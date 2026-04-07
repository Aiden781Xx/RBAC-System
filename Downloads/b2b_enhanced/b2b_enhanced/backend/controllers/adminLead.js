import Lead from "../models/Lead.js";
import Rfq from "../models/rfq.js";
import Supplier from "../models/Supplier.js";

export const getAllLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.rfqId) query.rfqId = req.query.rfqId;
    if (req.query.supplierId) query.supplierId = req.query.supplierId;
    if (req.query.status) query.status = req.query.status;

    const leads = await Lead.find(query)
      .populate("rfqId", "title rfqType state")
      .populate({ path: "supplierId", select: "userId", populate: { path: "userId", select: "name email" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllLeads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate("rfqId")
      .populate({ path: "supplierId", populate: { path: "userId", select: "name email phone" } });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (err) {
    console.error("getLeadById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent strictly controlled fields from arbitrary updates unless needed
    const lead = await Lead.findByIdAndUpdate(id, updates, { new: true });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead updated", lead });
  } catch (err) {
    console.error("updateLead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createLead = async (req, res) => {
  try {
    const { rfqId, supplierId, price, expiresAt, status, isPurchased } = req.body;
    
    const rfq = await Rfq.findById(rfqId);
    if (!rfq) return res.status(404).json({ message: "RFQ not found" });
    
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    const existingLead = await Lead.findOne({ rfqId, supplierId });
    if (existingLead) {
      return res.status(400).json({ message: "Lead already exists for this RFQ and Supplier" });
    }

    const lead = await Lead.create({
      rfqId,
      supplierId,
      price: price || 100, // Def price
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: status || "AVAILABLE",
      isPurchased: isPurchased || false,
      leadScore: supplier.SQI?.score || 0,
      visibilityType: "NORMAL"
    });

    res.status(201).json({ message: "Lead created", lead });
  } catch (err) {
    console.error("createLead error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Lead already exists for this RFQ and Supplier" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error("deleteLead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
