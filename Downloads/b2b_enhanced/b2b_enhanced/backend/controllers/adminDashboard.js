import Buyer from "../models/buyer.js";
import Supplier from "../models/Supplier.js";
import Rfq from "../models/rfq.js";
import Lead from "../models/Lead.js";
import Quote from "../models/Quote.js";

export const getAdminOverview = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalBuyers, pendingBuyers, restrictedBuyers, blacklistedBuyers, verifiedBuyers,
      totalSuppliers, approvedSuppliers, pendingSuppliers, restrictedSuppliers,
      totalRfqs, submittedRfqs, confirmedRfqs, rejectedRfqs, closedRfqs, clarificationRfqs,
      totalLeads, availableLeads, purchasedLeads, expiredLeads,
      totalQuotes, acceptedQuotes, submittedQuotes,
      recentBuyers, recentRfqs, recentLeads,
    ] = await Promise.all([
      Buyer.countDocuments({ isDeleted: false }),
      Buyer.countDocuments({ buyerStatus: "PENDING_VERIFICATION", isDeleted: false }),
      Buyer.countDocuments({ buyerStatus: "RESTRICTED", isDeleted: false }),
      Buyer.countDocuments({ buyerStatus: "BLACKLISTED", isDeleted: false }),
      Buyer.countDocuments({ buyerStatus: "VERIFIED", isDeleted: false }),
      Supplier.countDocuments({}),
      Supplier.countDocuments({ supplierStatus: "APPROVED" }),
      Supplier.countDocuments({ supplierStatus: { $in: ["DOCUMENTS_PENDING", "UNDER_REVIEW"] } }),
      Supplier.countDocuments({ supplierStatus: "RESTRICTED" }),
      Rfq.countDocuments({}),
      Rfq.countDocuments({ state: "SUBMITTED" }),
      Rfq.countDocuments({ state: "CONFIRMED" }),
      Rfq.countDocuments({ state: "REJECTED" }),
      Rfq.countDocuments({ state: "CLOSED" }),
      Rfq.countDocuments({ state: "CLARIFICATION_REQUIRED" }),
      Lead.countDocuments({}),
      Lead.countDocuments({ status: "AVAILABLE" }),
      Lead.countDocuments({ status: "PURCHASED" }),
      Lead.countDocuments({ status: "EXPIRED" }),
      Quote.countDocuments({}),
      Quote.countDocuments({ status: "ACCEPTED" }),
      Quote.countDocuments({ status: "SUBMITTED" }),
      Buyer.countDocuments({ createdAt: { $gte: sevenDaysAgo }, isDeleted: false }),
      Rfq.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    // Expiring leads (next 24 hours)
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiringSoon = await Lead.countDocuments({
      status: "AVAILABLE",
      expiresAt: { $lte: in24h, $gt: now },
    });

    // Upcoming RFQs (delivery within 30 days)
    const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingDelivery = await Rfq.countDocuments({
      state: "CONFIRMED",
      "timeLine.expectedDeliveryDate": { $lte: in30days, $gt: now },
    });

    // Overdue RFQs (delivery date passed but still confirmed)
    const overdueRfqs = await Rfq.countDocuments({
      state: "CONFIRMED",
      "timeLine.expectedDeliveryDate": { $lt: now },
    });

    res.json({
      buyers: { total: totalBuyers, pendingVerification: pendingBuyers, restricted: restrictedBuyers, blacklisted: blacklistedBuyers, verified: verifiedBuyers, newThisWeek: recentBuyers },
      suppliers: { total: totalSuppliers, approved: approvedSuppliers, pending: pendingSuppliers, restricted: restrictedSuppliers },
      rfqs: { total: totalRfqs, submitted: submittedRfqs, confirmed: confirmedRfqs, rejected: rejectedRfqs, closed: closedRfqs, clarificationRequired: clarificationRfqs, upcomingDelivery, overdueRfqs, newThisWeek: recentRfqs },
      leads: { total: totalLeads, available: availableLeads, purchased: purchasedLeads, expired: expiredLeads, expiringSoon, newThisWeek: recentLeads },
      quotes: { total: totalQuotes, accepted: acceptedQuotes, pending: submittedQuotes },
      marketplace: { leads: totalLeads, quotes: totalQuotes },
    });
  } catch (err) {
    console.error("getAdminOverview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminMetrics = async (req, res) => {
  try {
    const [totalRFQs, totalLeads, totalPurchases, totalQuotes, totalConverted, sqiAgg, topSuppliers] =
      await Promise.all([
        Rfq.countDocuments({}),
        Lead.countDocuments({}),
        Lead.countDocuments({ status: "PURCHASED" }),
        Quote.countDocuments({}),
        Lead.countDocuments({ isConverted: true }),
        Supplier.aggregate([{ $group: { _id: null, avgSQI: { $avg: "$SQI.score" }, minSQI: { $min: "$SQI.score" }, maxSQI: { $max: "$SQI.score" } } }]),
        Supplier.find({}).sort({ "SQI.score": -1 }).select("_id SQI.score SQI.level leadAccess.conversionRate userId").populate("userId", "name email").limit(5).lean(),
      ]);

    const conversionRate = totalQuotes > 0 ? Number((totalConverted / totalQuotes).toFixed(4)) : 0;
    const sqiSummary = sqiAgg?.[0] || { avgSQI: 0, minSQI: 0, maxSQI: 0 };
    res.json({
      totalRFQs, totalLeads, totalPurchases, totalQuotes, conversionRate,
      sqi: { avg: Number((sqiSummary.avgSQI || 0).toFixed(2)), min: sqiSummary.minSQI || 0, max: sqiSummary.maxSQI || 0, topSuppliers },
    });
  } catch (err) {
    console.error("getAdminMetrics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFlowHealth = async (req, res) => {
  try {
    const rfqs = await Rfq.find({}).sort({ createdAt: -1 }).limit(200).select("_id title state createdAt timeLine").lean();
    const rfqIds = rfqs.map((r) => r._id);
    const [leadsAgg, purchasedAgg, quotesAgg, acceptedAgg, convertedAgg] = await Promise.all([
      Lead.aggregate([{ $match: { rfqId: { $in: rfqIds } } }, { $group: { _id: "$rfqId", count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: { rfqId: { $in: rfqIds }, isPurchased: true } }, { $group: { _id: "$rfqId", count: { $sum: 1 } } }]),
      Quote.aggregate([{ $match: { rfqId: { $in: rfqIds } } }, { $group: { _id: "$rfqId", count: { $sum: 1 } } }]),
      Quote.aggregate([{ $match: { rfqId: { $in: rfqIds }, status: "ACCEPTED" } }, { $group: { _id: "$rfqId", count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: { rfqId: { $in: rfqIds }, isConverted: true } }, { $group: { _id: "$rfqId", count: { $sum: 1 } } }]),
    ]);
    const toMap = (arr) => arr.reduce((acc, x) => { acc[String(x._id)] = x.count; return acc; }, {});
    const leadsMap = toMap(leadsAgg), purchasedMap = toMap(purchasedAgg), quotesMap = toMap(quotesAgg), acceptedMap = toMap(acceptedAgg), convertedMap = toMap(convertedAgg);
    const now = new Date();
    const items = rfqs.map((rfq) => {
      const id = String(rfq._id);
      const deliveryDate = rfq.timeLine?.expectedDeliveryDate;
      const isOverdue = deliveryDate && new Date(deliveryDate) < now && rfq.state === "CONFIRMED";
      const isUpcoming = deliveryDate && new Date(deliveryDate) > now && new Date(deliveryDate) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) && rfq.state === "CONFIRMED";
      return {
        rfqId: id, title: rfq.title, state: rfq.state, createdAt: rfq.createdAt, deliveryDate, isOverdue, isUpcoming,
        flow: { rfqCreated: true, adminConfirmed: rfq.state === "CONFIRMED" || rfq.state === "CLOSED", leadsCreated: (leadsMap[id] || 0) > 0, leadPurchased: (purchasedMap[id] || 0) > 0, quoteSubmitted: (quotesMap[id] || 0) > 0, quoteAccepted: (acceptedMap[id] || 0) > 0, leadConverted: (convertedMap[id] || 0) > 0 },
        counts: { leads: leadsMap[id] || 0, purchasedLeads: purchasedMap[id] || 0, quotes: quotesMap[id] || 0, acceptedQuotes: acceptedMap[id] || 0, convertedLeads: convertedMap[id] || 0 },
      };
    });
    res.json({ total: items.length, items });
  } catch (err) {
    console.error("getFlowHealth error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 }).limit(300)
      .populate("rfqId", "title rfqType")
      .populate({ path: "supplierId", select: "userId", populate: { path: "userId", select: "name email" } })
      .lean();
    res.json(leads);
  } catch (err) {
    console.error("getAdminLeads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({}).sort({ createdAt: -1 }).limit(300)
      .populate({
        path: "rfqId",
        select: "title rfqType buyerId",
        populate: { path: "buyerId", select: "userId", populate: { path: "userId", select: "name email" } },
      })
      .populate({ path: "supplierId", select: "userId", populate: { path: "userId", select: "name email" } })
      .lean();
    res.json(quotes);
  } catch (err) {
    console.error("getAdminQuotes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminDisputes = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Active disputes
    const openSuppliers = await Supplier.find({ "performance.disputeCount": { $gt: 0 } })
      .sort({ "performance.lastDisputeAt": -1 }).limit(100)
      .populate("userId", "name email").lean();

    // Recently resolved (last 30 days) - include for audit trail
    const resolvedSuppliers = await Supplier.find({
      "performance.disputeCount": 0,
      "performance.lastResolvedAt": { $gte: thirtyDaysAgo },
    })
      .sort({ "performance.lastResolvedAt": -1 }).limit(50)
      .populate("userId", "name email").lean();

    const mapDispute = (s, status) => ({
      id: s._id,
      supplierId: s._id,
      raisedBy: s.userId?.name || s.userId?.email || "Supplier",
      email: s.userId?.email || "",
      role: "Supplier",
      disputeCount: status === "RESOLVED"
        ? (s.performance?.totalDisputesHistoric || 0)
        : (s.performance?.disputeCount || 0),
      lastDisputeAt: s.performance?.lastDisputeAt || s.updatedAt,
      resolvedAt: s.performance?.lastResolvedAt || null,
      resolvedNote: s.performance?.lastResolutionNote || null,
      status,
      note: status === "RESOLVED"
        ? (s.performance?.lastResolutionNote || "Resolved by admin")
        : "Supplier has unresolved dispute history",
    });

    const disputes = [
      ...openSuppliers.map(s => mapDispute(s, "OPEN")),
      ...resolvedSuppliers.map(s => mapDispute(s, "RESOLVED")),
    ];

    res.json(disputes);
  } catch (err) {
    console.error("getAdminDisputes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminLogs = async (req, res) => {
  try {
    const [rfqs, leads, quotes, buyers, suppliers] = await Promise.all([
      Rfq.find({}).sort({ createdAt: -1 }).limit(60).select("_id title state createdAt buyerId").populate("buyerId", "userId").lean(),
      Lead.find({}).sort({ createdAt: -1 }).limit(60).select("_id status createdAt supplierId isPurchased purchasedAt").populate({ path: "supplierId", select: "userId", populate: { path: "userId", select: "name" } }).lean(),
      Quote.find({}).sort({ createdAt: -1 }).limit(60).select("_id status createdAt rfqId supplierId quotedPrice").populate("rfqId", "title").populate({ path: "supplierId", select: "userId", populate: { path: "userId", select: "name" } }).lean(),
      Buyer.find({}).sort({ updatedAt: -1 }).limit(30).select("_id buyerStatus updatedAt userId").populate("userId", "name email").lean(),
      Supplier.find({}).sort({ updatedAt: -1 }).limit(30).select("_id supplierStatus updatedAt userId").populate("userId", "name email").lean(),
    ]);

    const logs = [
      ...rfqs.map((r) => ({ id: `RFQ-${r._id}`, action: r.state === "CONFIRMED" ? "RFQ_CONFIRMED" : r.state === "REJECTED" ? "RFQ_REJECTED" : "RFQ_SUBMITTED", target: r.title || r._id.toString(), type: "rfq", status: r.state, time: r.createdAt })),
      ...leads.map((l) => ({ id: `LEAD-${l._id}`, action: l.isPurchased ? "LEAD_PURCHASED" : "LEAD_CREATED", target: l.supplierId?.userId?.name || l._id.toString(), type: "lead", status: l.status, time: l.purchasedAt || l.createdAt })),
      ...quotes.map((q) => ({ id: `QUOTE-${q._id}`, action: q.status === "ACCEPTED" ? "QUOTE_ACCEPTED" : "QUOTE_SUBMITTED", target: `${q.supplierId?.userId?.name || "Supplier"} → ${q.rfqId?.title || "RFQ"}`, type: "quote", status: q.status, time: q.createdAt, value: q.quotedPrice })),
      ...buyers.map((b) => ({ id: `BUYER-${b._id}`, action: `BUYER_${b.buyerStatus}`, target: b.userId?.name || b.userId?.email || b._id.toString(), type: "buyer", status: b.buyerStatus, time: b.updatedAt })),
      ...suppliers.map((s) => ({ id: `SUPPLIER-${s._id}`, action: `SUPPLIER_${s.supplierStatus}`, target: s.userId?.name || s.userId?.email || s._id.toString(), type: "supplier", status: s.supplierStatus, time: s.updatedAt })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 200);

    res.json(logs);
  } catch (err) {
    console.error("getAdminLogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Resolve dispute
export const resolveDispute = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { note } = req.body;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    // Accumulate historic count before resetting
    const prevCount = supplier.performance?.disputeCount || 0;
    const prevHistoric = supplier.performance?.totalDisputesHistoric || 0;

    supplier.performance.totalDisputesHistoric = prevHistoric + prevCount;
    supplier.performance.disputeCount = 0;
    supplier.performance.lastResolvedAt = new Date();
    supplier.performance.lastResolutionNote = note || "Resolved by admin";
    supplier.adminNotes = note || "Dispute resolved by admin";
    await supplier.save();
    res.json({ message: "Dispute resolved" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
