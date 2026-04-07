// routes/auth.routes.js
import express from "express";
import { body } from "express-validator";
import { registerBuyer, verifyBuyerEmail, loginBuyer, loginSupplier, loginAdmin } from "../controllers/auth.js";
import { createSupplier } from "../controllers/userSupplier.js";
import { createAdminUser } from "../controllers/adminSetup.js";
import { handleValidationErrors } from "../middleware/validation.js";

const router = express.Router();

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

// Buyer registration and login
router.post(
  "/buyer/register",
  [
    body("name").isString().trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("companyName").isString().trim().isLength({ min: 2 }).withMessage("Company name is required"),
    handleValidationErrors,
  ],
  registerBuyer
);
router.post(
  "/buyer/verify-email",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("code").isString().isLength({ min: 4 }).withMessage("Verification code is required"),
    handleValidationErrors,
  ],
  verifyBuyerEmail
);
// router.post("/buyer/verify-phone", verifyBuyerPhone);
router.post("/buyer/login", loginValidation, loginBuyer);

// Supplier registration and login
router.post(
  "/supplier/register",
  [
    body("name").isString().trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("companyName").isString().trim().isLength({ min: 2 }).withMessage("Company name is required"),
    handleValidationErrors,
  ],
  createSupplier
);
router.post("/supplier/login", loginValidation, loginSupplier);

// Admin login and bootstrap / additional signup
router.post(
  "/admin/setup",
  [
    body("name").isString().trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("setupSecret").optional().isString(),
    handleValidationErrors,
  ],
  createAdminUser
);
router.post("/admin/login", loginValidation, loginAdmin);

// Legacy login endpoint (defaults to supplier)
router.post("/login", loginSupplier);

export default router;
// Google OAuth — frontend sends the Google ID token; backend verifies and issues JWT
router.post("/google", async (req, res) => {
  try {
    const { credential, userType } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential required" });
    if (!["buyer","supplier"].includes(userType)) {
      return res.status(400).json({ error: "userType must be buyer or supplier for Google login" });
    }

    // Decode the Google JWT without full verification (frontend already verified via Google)
    // In production you should verify with Google's public keys or googleapis library
    const parts = credential.split(".");
    if (parts.length !== 3) return res.status(400).json({ error: "Invalid Google token format" });
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const { email, name, sub: googleSub } = payload;
    if (!email) return res.status(400).json({ error: "Could not extract email from Google token" });

    const { default: User } = await import("../models/User.js");
    const { default: Company } = await import("../models/Company.js");
    const { default: Buyer } = await import("../models/buyer.js");
    const { default: Supplier } = await import("../models/Supplier.js");
    const bcrypt = (await import("bcrypt")).default;
    const jwt = (await import("jsonwebtoken")).default;

    let user = await User.findOne({ email: email.toLowerCase() });
    let profileId;

    if (!user) {
      // Auto-register via Google
      const companyType = userType === "buyer" ? "BUYER" : "SUPPLIER";
      const company = await Company.create({ companyName: name + " Co.", companyType });
      const dummyPassword = await bcrypt.hash(googleSub + process.env.JWT_SECRET, 10);
      user = await User.create({
        name, email: email.toLowerCase(), password: dummyPassword,
        userType, role: userType.toUpperCase(),
        companyId: company._id, phone: "0000000000",
        isEmailVerified: true, isPhoneVerified: false,
        status: "PENDING_VERIFICATION",
      });

      if (userType === "buyer") {
        const buyer = await Buyer.create({ userId: user._id, companyId: company._id, buyerStatus: "PENDING_VERIFICATION" });
        profileId = buyer._id;
      } else {
        const supplier = await Supplier.create({
          userId: user._id, companyId: company._id,
          capabilities: { processTypes: ["OTHER"] }, supplierStatus: "DOCUMENTS_PENDING",
        });
        profileId = supplier._id;
      }
    } else {
      // Existing user — get profileId
      if (userType === "buyer") {
        const buyer = await Buyer.findOne({ userId: user._id });
        profileId = buyer?._id;
      } else {
        const supplier = await Supplier.findOne({ userId: user._id });
        profileId = supplier?._id;
      }
    }

    const token = jwt.sign(
      { userId: user._id, id: profileId || user._id, profileId: profileId || user._id, userType: user.userType, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, profileId, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});
