import User from "../models/User.js";
import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// This is a secure endpoint that should only be accessible once (or by existing admins)
// In production, this should be protected or run only during setup

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, setupSecret } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const adminCount = await User.countDocuments({ userType: "admin" });
    const isBootstrap = adminCount === 0;

    if (!isBootstrap) {
      const envSecret = (process.env.ADMIN_SETUP_SECRET || "").trim();
      const requireSecret =
        process.env.NODE_ENV === "production" || envSecret.length >= 8;
      if (requireSecret) {
        if (envSecret.length < 8) {
          return res.status(403).json({
            error:
              "Additional admin accounts need ADMIN_SETUP_SECRET set on the server (min. 8 characters).",
          });
        }
        if (!setupSecret || setupSecret !== envSecret) {
          return res.status(403).json({ error: "Invalid or missing admin setup secret" });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const platformCompany = await Company.findOneAndUpdate(
      { companyName: "Platform Admin" },
      { companyName: "Platform Admin", companyType: "BUYER" },
      { upsert: true, new: true }
    );

    const admin = await User.create({
      name: name || "Admin",
      email: emailNorm,
      password: hashedPassword,
      userType: "admin",
      role: "ADMIN",
      companyId: platformCompany._id,
      phone: "0000000000",
      isEmailVerified: true,
      isPhoneVerified: true,
    });

    const token = jwt.sign(
      { userId: admin._id, id: admin._id, userType: admin.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Admin user created successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email },
      token,
    });
  } catch (err) {
    console.error("createAdminUser error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};