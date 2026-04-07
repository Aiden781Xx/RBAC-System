import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import { applySQI } from "../services/sqiService.js";
import { ensureLeadsForSupplierForConfirmedRfqs } from "./adminRFQ.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.supplierStatus = req.query.status;

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter)
        .populate("userId", "name email status createdAt")
        .populate("companyId", "companyName country")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supplier.countDocuments(filter),
    ]);

    res.json({ suppliers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("getAllSuppliers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id)
      .populate("userId", "name email status phone")
      .populate("companyId")
      .populate("SQI.calculatedBy", "name email")
      .populate("approvedBy", "name email");

    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    console.error("getSupplierById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    if (supplier.supplierStatus === "APPROVED") {
      return res.status(400).json({ message: "Supplier already approved" });
    }

    const previousStatus = supplier.supplierStatus;
    supplier.supplierStatus = "APPROVED";
    supplier.approvedBy = req.user.userId;
    supplier.approvedAt = new Date();
    if (adminNotes) supplier.adminNotes = adminNotes;

    await supplier.save(); // pre-save hook syncs User.status = VERIFIED

    // Catch-up: ensure leads for already-confirmed RFQs
    await ensureLeadsForSupplierForConfirmedRfqs(supplier);

    res.json({
      message: "Supplier approved successfully",
      supplierId: id,
      previousStatus,
      newStatus: "APPROVED",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("approveSupplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const restrictSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    if (supplier.supplierStatus === "RESTRICTED") {
      return res.status(400).json({ message: "Supplier already restricted" });
    }

    const previousStatus = supplier.supplierStatus;
    supplier.supplierStatus = "RESTRICTED";
    if (reason) supplier.adminNotes = reason;
    await supplier.save(); // pre-save hook syncs User.status = RESTRICTED

    res.json({
      message: "Supplier restricted successfully",
      supplierId: id,
      previousStatus,
      newStatus: "RESTRICTED",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("restrictSupplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const setSupplierSQI = async (req, res) => {
  try {
    const { id } = req.params;
    const { certifications, processCapability, exportMaturity, platformPerformance, adminNotes } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    supplier.SQI.components = {
      certifications: Number(certifications) || 0,
      processCapability: Number(processCapability) || 0,
      exportMaturity: Number(exportMaturity) || 0,
      platformPerformance: Number(platformPerformance) || 0,
    };
    supplier.SQI.calculatedAt = new Date();
    supplier.SQI.calculatedBy = req.user.userId;
    if (adminNotes) supplier.adminNotes = adminNotes;

    applySQI(supplier);
    await supplier.save();

    // Catch-up leads for confirmed RFQs if supplier is approved
    await ensureLeadsForSupplierForConfirmedRfqs(supplier);

    res.json({
      message: "SQI updated",
      sqiScore: supplier.SQI.score,
      sqiLevel: supplier.SQI.level,
      components: supplier.SQI.components,
    });
  } catch (err) {
    console.error("setSupplierSQI error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSupplierLeadAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyLimit, usedToday, totalLeadsPurchased, conversionRate } = req.body;

    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    if (dailyLimit !== undefined) supplier.leadAccess.dailyLimit = dailyLimit;
    if (usedToday !== undefined) supplier.leadAccess.usedToday = usedToday;
    if (totalLeadsPurchased !== undefined) supplier.leadAccess.totalLeadsPurchased = totalLeadsPurchased;
    if (conversionRate !== undefined) supplier.leadAccess.conversionRate = conversionRate;

    await supplier.save();
    res.json({ message: "Lead access updated", leadAccess: supplier.leadAccess });
  } catch (err) {
    console.error("updateSupplierLeadAccess error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
