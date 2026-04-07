import bcrypt from "bcrypt";
import Supplier from "../models/Supplier.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { applySQI } from "../services/sqiService.js";
import { ensureLeadsForSupplierForConfirmedRfqs } from "./adminRFQ.js";

// Supplier registration (creates User + Company + Supplier)
export const createSupplier = async (req, res) => {
  try {
    const { name, email, password, companyName, country, capabilities = [], certifications = [], machines = [], toleranceRanges = [], exportExperience } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    if (!companyName || !name) return res.status(400).json({ message: "Company name and name required" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const company = await Company.create({
      companyName,
      companyType: "SUPPLIER",
      country: country || undefined,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "SUPPLIER",
      userType: "supplier",
      companyId: company._id,
      status: "PENDING_VERIFICATION",
      phone: req.body.phone || "0000000000",
    });

    const processTypes = Array.isArray(capabilities) && capabilities.length > 0 ? capabilities : ["OTHER"];
    const certs = (certifications || []).map((c) => (typeof c === "string" ? { name: c } : c)).filter((c) => c && c.name);
    const supplier = await Supplier.create({
      userId: user._id,
      companyId: company._id,
      capabilities: { processTypes, machineList: machines || [], toleranceRange: toleranceRanges?.[0] },
      certifications: certs,
      exportExperience: typeof exportExperience === "boolean" ? { years: exportExperience ? 1 : 0 } : { years: exportExperience?.years || 0 },
      supplierStatus: "DOCUMENTS_PENDING",
    });

    res.status(201).json({ message: "Supplier registered successfully", userId: user._id });
  } catch (err) {
    console.error("createSupplier error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Create supplier profile (2.3)
export const createSupplierProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyRegistration,
      website,
      factoryAddress,
      capabilities,
      certifications,
      exportExperience,
      phone,
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user || user.role !== "SUPPLIER") {
      return res.status(403).json({ message: "Only suppliers allowed" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email must be verified first" });
    }

    const existing = await Supplier.findOne({ userId: user._id });
    if (existing) {
      return res.status(400).json({ message: "Supplier profile already exists" });
    }

    // Create company
    const company = await Company.create({
      companyName,
      registrationNumber: companyRegistration,
      website,
      factoryAddress,
      emailDomain: user.email.split("@")[1],
    });

    // Create supplier profile
    const supplier = await Supplier.create({
      userId: user._id,
      companyId: company._id,
      capabilities: {
        processTypes: capabilities.processTypes || [],
        materials: capabilities.materials || [],
        toleranceRange: capabilities.toleranceRange,
        machineList: capabilities.machineList || [],
        maxCapacity: capabilities.maxCapacity,
      },
      certifications: certifications || [],
      exportExperience: {
        years: exportExperience?.years || 0,
        countries: exportExperience?.countries || [],
        documentProof: exportExperience?.documentProof,
      },
      supplierStatus: "DOCUMENTS_PENDING",
    });

    // Update user phone if provided
    if (phone) {
      user.phone = phone;
      await user.save();
    }

    // Sync user status
    user.status = "PENDING_VERIFICATION";
    await user.save();

    res.status(201).json({
      message: "Supplier profile created. Awaiting admin verification.",
      supplier: {
        id: supplier._id,
        supplierStatus: supplier.supplierStatus,
      },
    });
  } catch (err) {
    console.error("createSupplierProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get supplier profile
export const getSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.userId })
      .populate("companyId", "companyName website factoryAddress")
      .populate("SQI.calculatedBy", "name email")
      .populate("approvedBy", "name email");

    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    res.status(200).json(supplier);
  } catch (err) {
    console.error("getSupplierProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update capabilities (before approval)
export const updateCapabilities = async (req, res) => {
  try {
    const { capabilities } = req.body;

    const supplier = await Supplier.findOne({ userId: req.user.userId });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    if (supplier.supplierStatus === "APPROVED") {
      return res.status(403).json({ message: "Cannot modify after approval" });
    }

    supplier.capabilities = {
      ...supplier.capabilities,
      ...capabilities,
    };

    await supplier.save();

    res.json({ message: "Capabilities updated", capabilities: supplier.capabilities });
  } catch (err) {
    console.error("updateCapabilities error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Calculate/Update SQI (2.4)
export const calculateSQI = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { certifications, processCapability, exportMaturity, platformPerformance } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Update components (SQI auto-calculated via pre-save hook)
    supplier.SQI.components = {
      certifications: certifications || 0,
      processCapability: processCapability || 0,
      exportMaturity: exportMaturity || 0,
      platformPerformance: platformPerformance || 0,
    };
    supplier.SQI.calculatedAt = new Date();
    supplier.SQI.calculatedBy = req.user.userId;

    applySQI(supplier);
    await supplier.save();

    // Catch-up: if RFQs were already confirmed, ensure the supplier has leads now.
    // This prevents "no leads" when admin calculates SQI after RFQ confirmation.
    await ensureLeadsForSupplierForConfirmedRfqs(supplier);

    res.json({
      message: "SQI calculated",
      sqiScore: supplier.SQI.score,
      sqiLevel: supplier.SQI.level,
      components: supplier.SQI.components,
    });
  } catch (err) {
    console.error("calculateSQI error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Approve supplier (2.3)
export const approveSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { adminNotes } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.supplierStatus = "APPROVED";
    supplier.approvedBy = req.user.userId;
    supplier.approvedAt = new Date();
    supplier.adminNotes = adminNotes || supplier.adminNotes;

    await supplier.save();

    // Sync user status
    await User.findByIdAndUpdate(supplier.userId, {
      status: "VERIFIED",
    });

    // Catch-up: newly approved suppliers should get leads for already-confirmed RFQs.
    await ensureLeadsForSupplierForConfirmedRfqs(supplier);

    res.json({ message: "Supplier approved", supplierStatus: supplier.supplierStatus });
  } catch (err) {
    console.error("approveSupplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Restrict supplier (2.6)
export const restrictSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { reason } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.supplierStatus = "RESTRICTED";
    supplier.adminNotes = reason;

    await supplier.save();

    // Sync user status
    await User.findByIdAndUpdate(supplier.userId, {
      status: "RESTRICTED",
      accountStatus: "SUSPENDED",
    });

    res.json({ message: "Supplier restricted" });
  } catch (err) {
    console.error("restrictSupplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get available leads (2.5) - Anonymized
export const getAvailableLeads = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.userId });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    if (supplier.supplierStatus !== "APPROVED") {
      return res.status(403).json({ message: "Supplier not approved" });
    }

    if (supplier.SQI.score === 0) {
      return res.status(403).json({ message: "SQI not calculated" });
    }

    // Reset daily counter if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!supplier.leadAccess.resetAt || supplier.leadAccess.resetAt < today) {
      supplier.leadAccess.usedToday = 0;
      supplier.leadAccess.resetAt = new Date();
      await supplier.save();
    }

    const remaining = supplier.leadAccess.dailyLimit - supplier.leadAccess.usedToday;

    res.json({
      sqiScore: supplier.SQI.score,
      sqiLevel: supplier.SQI.level,
      dailyLimit: supplier.leadAccess.dailyLimit,
      usedToday: supplier.leadAccess.usedToday,
      remainingToday: remaining,
      message: "Call RFQ service to get matching leads",
    });
  } catch (err) {
    console.error("getAvailableLeads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Purchase lead (2.5) - Reveal buyer identity
export const purchaseLead = async (req, res) => {
  try {
    const { rfqId } = req.params;

    const supplier = await Supplier.findOne({ userId: req.user.userId });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    if (supplier.supplierStatus !== "APPROVED") {
      return res.status(403).json({ message: "Supplier not approved" });
    }

    if (supplier.leadAccess.usedToday >= supplier.leadAccess.dailyLimit) {
      return res.status(403).json({ message: "Daily limit reached" });
    }

    // Increment counters
    supplier.leadAccess.usedToday += 1;
    supplier.leadAccess.totalLeadsPurchased += 1;
    await supplier.save();

    res.json({
      message: "Lead purchased successfully",
      rfqId,
      buyerIdentityRevealed: true,
      remainingToday: supplier.leadAccess.dailyLimit - supplier.leadAccess.usedToday,
    });
  } catch (err) {
    console.error("purchaseLead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update performance metrics (2.6) - Called by system
export const updatePerformance = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { avgResponseTime, quoteSeriousnessScore, buyerFeedbackScore } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.performance = {
      ...supplier.performance,
      avgResponseTime: avgResponseTime || supplier.performance?.avgResponseTime,
      quoteSeriousnessScore: quoteSeriousnessScore || supplier.performance?.quoteSeriousnessScore,
      buyerFeedbackScore: buyerFeedbackScore || supplier.performance?.buyerFeedbackScore,
    };

    await supplier.save();

    res.json({ message: "Performance updated", performance: supplier.performance });
  } catch (err) {
    console.error("updatePerformance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Record dispute (2.6)
export const recordDispute = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.performance.disputeCount += 1;
    supplier.performance.lastDisputeAt = new Date();

    await supplier.save();

    res.json({ 
      message: "Dispute recorded", 
      disputeCount: supplier.performance.disputeCount 
    });
  } catch (err) {
    console.error("recordDispute error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if supplier can access leads (called by middleware)
export const checkSupplierEligibility = async (userId) => {
  const supplier = await Supplier.findOne({ userId });

  if (!supplier) return { eligible: false, reason: "Supplier profile not found" };
  if (supplier.supplierStatus !== "APPROVED") return { eligible: false, reason: "Not approved" };
  if (supplier.SQI.score === 0) return { eligible: false, reason: "SQI not calculated" };

  return { eligible: true, supplier };
};