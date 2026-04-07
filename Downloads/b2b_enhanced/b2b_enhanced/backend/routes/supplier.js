import express from "express";
import Supplier from "../models/Supplier.js";
import Lead from "../models/Lead.js";
import auth from "../middleware/auth.js";
import adminGuard from "../middleware/adminGuard.js";
import { applySQI } from "../services/sqiService.js";
import { purchaseLead } from "../controllers/lead.js";
import {
  validateSupplierProfile,
  checkSupplierCanAccessLeads,
  validateSQIComponents,
} from "../middleware/validation.js";
import { ensureLeadsForSupplierForConfirmedRfqs } from "../controllers/adminRFQ.js";

const router = express.Router();

// Admin: list suppliers for management UI
router.get("/", auth, adminGuard, async (req, res) => {
  try {
    const suppliers = await Supplier.find({})
      .populate("userId", "name email")
      .populate("companyId", "companyName country")
      .sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    console.error("List suppliers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current supplier profile (your existing)
router.get("/me", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.userId })
      .populate("companyId", "companyName website factoryAddress")
      .populate("SQI.calculatedBy", "name email")
      .populate("approvedBy", "name email");

    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    res.json(supplier);
  } catch (err) {
    console.error("Get supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update supplier profile (your existing - enhanced)
router.put("/me", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.userId });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    // Prevent modification after approval (except admin)
    if (supplier.supplierStatus === "APPROVED" && req.user.userType !== "admin") {
      return res.status(403).json({ message: "Cannot modify after approval" });
    }

    const updated = await Supplier.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Update supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create supplier profile (2.3)
router.post("/profile", auth, validateSupplierProfile, async (req, res) => {
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

    // Check if already exists
    const existing = await Supplier.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(400).json({ message: "Supplier profile already exists" });
    }

    // Import Company model dynamically to avoid circular dependency
    const { default: Company } = await import("../models/Company.js");

    // Create company
    const company = await Company.create({
      companyName,
      companyType: "SUPPLIER",
      registrationNumber: companyRegistration,
      website,
    });

    // Create supplier
    const supplier = await Supplier.create({
      userId: req.user.userId,
      companyId: company._id,
      capabilities: {
        processTypes: capabilities?.processTypes || [],
        materials: capabilities?.materials || [],
        toleranceRange: capabilities?.toleranceRange,
        machineList: capabilities?.machineList || [],
        maxCapacity: capabilities?.maxCapacity,
      },
      certifications: certifications || [],
      exportExperience: {
        years: exportExperience?.years || 0,
        countries: exportExperience?.countries || [],
        documentProof: exportExperience?.documentProof,
      },
      supplierStatus: "DOCUMENTS_PENDING",
    });

    // Update user
    const { default: User } = await import("../models/User.js");
    if (phone) {
      await User.findByIdAndUpdate(req.user.userId, { phone });
    }
    await User.findByIdAndUpdate(req.user.userId, { status: "PENDING_VERIFICATION" });

    res.status(201).json({
      message: "Supplier profile created. Awaiting admin verification.",
      supplier: {
        id: supplier._id,
        supplierStatus: supplier.supplierStatus,
      },
    });
  } catch (err) {
    console.error("Create supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

import { getSupplierLeads } from "../controllers/adminRFQ.js";

// Get available leads (2.5)
router.get("/leads", auth, checkSupplierCanAccessLeads, getSupplierLeads);

// Purchase lead (2.5) - Reveal buyer identity
router.post("/leads/:rfqId/purchase", auth, checkSupplierCanAccessLeads, purchaseLead);

// ==================== ADMIN ROUTES ====================

// Calculate/Update SQI (2.4)
router.post("/:supplierId/sqi", auth, adminGuard, validateSQIComponents, async (req, res) => {
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

    // Catch-up: if there are already CONFIRMED RFQs, ensure this supplier now has AVAILABLE leads.
    await ensureLeadsForSupplierForConfirmedRfqs(supplier);

    console.log({
      action: "SQI_UPDATED",
      supplierId: supplier._id?.toString(),
      score: supplier.SQI.score,
      level: supplier.SQI.level,
      updatedBy: req.user.id,
      time: new Date().toISOString(),
    });

    res.json({
      message: "SQI calculated",
      sqiScore: supplier.SQI.score,
      sqiLevel: supplier.SQI.level,
      components: supplier.SQI.components,
    });
  } catch (err) {
    console.error("Calculate SQI error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve supplier (2.3)
router.post("/:supplierId/approve", auth, adminGuard, async (req, res) => {
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
    if (adminNotes) supplier.adminNotes = adminNotes;

    await supplier.save();

    // Sync user status
    const { default: User } = await import("../models/User.js");
    await User.findByIdAndUpdate(supplier.userId, { status: "VERIFIED" });

    // Catch-up: newly approved supplier should get leads for already-confirmed RFQs.
    await ensureLeadsForSupplierForConfirmedRfqs(supplier);

    res.json({ message: "Supplier approved", supplierStatus: supplier.supplierStatus });
  } catch (err) {
    console.error("Approve supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Restrict supplier (2.6)
router.post("/:supplierId/restrict", auth, adminGuard, async (req, res) => {
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
    const { default: User } = await import("../models/User.js");
    await User.findByIdAndUpdate(supplier.userId, {
      status: "RESTRICTED",
      accountStatus: "SUSPENDED",
    });

    res.json({ message: "Supplier restricted" });
  } catch (err) {
    console.error("Restrict supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update performance metrics (2.6)
router.put("/:supplierId/performance", auth, adminGuard, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { avgResponseTime, quoteSeriousnessScore, buyerFeedbackScore } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.performance = {
      ...supplier.performance,
      avgResponseTime: avgResponseTime ?? supplier.performance?.avgResponseTime,
      quoteSeriousnessScore: quoteSeriousnessScore ?? supplier.performance?.quoteSeriousnessScore,
      buyerFeedbackScore: buyerFeedbackScore ?? supplier.performance?.buyerFeedbackScore,
    };

    await supplier.save();

    res.json({ message: "Performance updated", performance: supplier.performance });
  } catch (err) {
    console.error("Update performance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Record dispute (2.6)
router.post("/:supplierId/dispute", auth, adminGuard, async (req, res) => {
  try {
    const { supplierId } = req.params;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.performance.disputeCount = (supplier.performance?.disputeCount || 0) + 1;
    supplier.performance.lastDisputeAt = new Date();

    await supplier.save();

    res.json({
      message: "Dispute recorded",
      disputeCount: supplier.performance.disputeCount,
    });
  } catch (err) {
    console.error("Record dispute error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;