import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Buyer from "../models/buyer.js";
import Supplier from "../models/Supplier.js";

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Shared brute-force check + attempt tracking.
 * Returns { locked: true, message } if account is locked.
 * Returns { locked: false } and increments/resets attempts otherwise.
 */
const checkAndTrackAttempts = async (user, isMatch) => {
  const now = new Date();

  // Still locked?
  if (user.lockUntil && user.lockUntil > now) {
    const remainingMs = user.lockUntil - now;
    const mins = Math.ceil(remainingMs / 60000);
    return { locked: true, message: `Account locked. Try again in ${mins} minute(s).` };
  }

  if (!isMatch) {
    const attempts = (user.loginAttempts || 0) + 1;
    const update = { loginAttempts: attempts };
    if (attempts >= MAX_ATTEMPTS) {
      update.lockUntil = new Date(now.getTime() + LOCK_DURATION_MS);
    }
    await User.findByIdAndUpdate(user._id, update);
    const remaining = MAX_ATTEMPTS - attempts;
    if (remaining <= 0) {
      return { locked: true, message: "Account locked for 15 minutes due to too many failed attempts." };
    }
    return { locked: false, badCredentials: true, remaining };
  }

  // Successful login — reset
  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    lockUntil: null,
    lastLoginAt: now,
  });
  return { locked: false };
};

export const registerBuyer = async (req, res) => {
  try {

    const { name, email, password, phone, companyName,
      companyType, country, registrationNumber, verificationStatus, website, linkedin } = req.body;

    // Validate email is company domain
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid company email required" });
    }

    // Check if user already exists
    const emailNorm = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Create company record
    const company = await Company.create({
      companyName: companyName || "Company",
      companyType: companyType || "BUYER",
      country,
      registrationNumber,
      verificationStatus,
      website,
      linkedIn: linkedin,
    });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailCode = generateVerificationCode();
    const phoneCode = generateVerificationCode();

    const user = await User.create({
      name,
      email,
      phone: phone || "0000000000",
      password: hashedPassword,
      userType: "buyer",
      role: "BUYER",
      companyId: company._id,
      isEmailVerified: false,
      isPhoneVerified: false,
      emailVerificationCode: emailCode,
      phoneVerificationCode: phoneCode,
    });

    await Buyer.create({
      userId: user._id,
      companyId: company._id,
      buyerStatus: "PENDING_VERIFICATION",
    });

    res.status(201).json({
      message: "Buyer registration successful. Verification codes sent to email and SMS.",
      userId: user._id,
      // NOTE: Verification codes are sent via email/SMS only — never returned in API response
    });
  } catch (err) {
    console.error("registerBuyer error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

export const verifyBuyerEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email, userType: "buyer" });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyBuyerEmail error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginBuyer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), userType: "buyer" });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" }); // Don't reveal if email exists
    }

    if (!user.password) {
      console.error("User has no password:", user.email);
      return res.status(500).json({ error: "Account setup incomplete" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const check = await checkAndTrackAttempts(user, isMatch);
    if (check.locked) return res.status(429).json({ error: check.message });
    if (check.badCredentials) {
      return res.status(401).json({ error: `Invalid credentials. ${check.remaining} attempt(s) remaining.` });
    }

    let buyer = await Buyer.findOne({ userId: user._id });
    if (!buyer && user.companyId) {
      try {
        buyer = await Buyer.create({
          userId: user._id,
          companyId: user.companyId,
          buyerStatus: "PENDING_VERIFICATION",
        });
      } catch (createErr) {
        console.error("Error creating buyer profile:", createErr);
        return res.status(500).json({ error: "Failed to create buyer profile" });
      }
    }
    if (!buyer) {
      return res.status(403).json({ error: "Buyer profile missing. Contact support." });
    }

    const profileId = buyer._id;
    const token = jwt.sign(
      { userId: user._id, id: profileId, profileId, userType: user.userType, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, profileId, name: user.name, email: user.email, userType: user.userType, emailVerified: user.isEmailVerified, phoneVerified: user.isPhoneVerified },
    });
  } catch (err) {
    console.error("loginBuyer error:", err);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginSupplier = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email, userType: "supplier" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    const check = await checkAndTrackAttempts(user, isMatch);
    if (check.locked) return res.status(429).json({ error: check.message });
    if (check.badCredentials) return res.status(401).json({ error: `Invalid credentials. ${check.remaining} attempt(s) remaining.` });

    const supplier = await Supplier.findOne({ userId: user._id });
    if (!supplier) return res.status(403).json({ error: "Supplier profile not found. Complete supplier registration first." });

    const profileId = supplier._id;
    const token = jwt.sign(
      { userId: user._id, id: profileId, profileId, userType: user.userType, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, profileId, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (err) {
    console.error("loginSupplier error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email, userType: "admin" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    const check = await checkAndTrackAttempts(user, isMatch);
    if (check.locked) return res.status(429).json({ error: check.message });
    if (check.badCredentials) return res.status(401).json({ error: `Invalid credentials. ${check.remaining} attempt(s) remaining.` });

    const token = jwt.sign(
      { userId: user._id, id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType },
    });
  } catch (err) {
    console.error("loginAdmin error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
