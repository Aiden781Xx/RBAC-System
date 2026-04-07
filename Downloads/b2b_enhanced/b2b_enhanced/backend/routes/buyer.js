import express from "express";
import auth from "../middleware/auth.js";
import buyerGuard from "../middleware/buyerGuard.js";
import adminGuard from "../middleware/adminGuard.js";
import { validateBuyerProfile } from "../middleware/validation.js";
import {
  createBuyerProfile,
  getBuyerProfile,
  declarePurchaseAuthority,
  flagBuyerMisuse,
} from "../controllers/buyer.js";
import Buyer from "../models/buyer.js";
import User from "../models/User.js";

const router = express.Router();

// Public buyer routes (auth required, no buyerGuard so PENDING can access)
router.post("/profile", auth, validateBuyerProfile, createBuyerProfile);
router.get("/me", auth, async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.userId })
      .populate("userId", "name email phone isEmailVerified isPhoneVerified")
      .populate("companyId", "companyName website country registrationNumber")
      .populate("verifiedBy", "name email");
    if (!buyer) return res.status(404).json({ message: "Buyer profile not found" });
    res.json(buyer);
  } catch (err) {
    console.error("getBuyerProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/declare-authority", auth, declarePurchaseAuthority);

// Update buyer profile (purchaseAuthority, exportIntent)
router.patch("/me", auth, async (req, res) => {
  try {
    const { purchaseAuthority, exportIntent, adminNotes } = req.body;
    const buyer = await Buyer.findOne({ userId: req.user.userId });
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    if (purchaseAuthority !== undefined) buyer.purchaseAuthority = purchaseAuthority;
    if (exportIntent !== undefined) buyer.exportIntent = exportIntent;
    if (adminNotes !== undefined) buyer.adminNotes = adminNotes;
    await buyer.save();
    res.json({ message: "Profile updated", buyer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin routes
router.post("/:buyerId/flag", auth, adminGuard, flagBuyerMisuse);

// Admin: update buyer notes/authority
router.patch("/:buyerId/admin-update", auth, adminGuard, async (req, res) => {
  try {
    const { adminNotes, purchaseAuthority, exportIntent } = req.body;
    const buyer = await Buyer.findById(req.params.buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    if (adminNotes !== undefined) buyer.adminNotes = adminNotes;
    if (purchaseAuthority !== undefined) buyer.purchaseAuthority = purchaseAuthority;
    if (exportIntent !== undefined) buyer.exportIntent = exportIntent;
    await buyer.save();
    res.json({ message: "Buyer updated", buyer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
