import RFQ from "../models/rfq.js";
import Buyer from "../models/buyer.js";
import Supplier from "../models/Supplier.js";
import Lead from "../models/Lead.js";

function computeLeadPrice({ supplierSQI }) {
  // price = basePrice * (1 - SQI.score/100)
  const basePrice = 100;
  const score = Math.max(0, Math.min(100, Number(supplierSQI || 0)));
  const price = Math.round(basePrice * (1 - score / 100));
  return Math.max(10, price);
}

/**
 * Ensure a supplier has AVAILABLE leads for already CONFIRMED RFQs.
 * This is important when admin approvals/SQI are done after RFQs were confirmed,
 * because leads are otherwise only created on RFQ confirmation.
 */
export async function ensureLeadsForSupplierForConfirmedRfqs(supplierDoc) {
  if (!supplierDoc) return { created: 0, updated: 0, skipped: true };
  if (supplierDoc.supplierStatus !== "APPROVED") return { created: 0, updated: 0, skipped: true };
  const score = supplierDoc?.SQI?.score ?? 0;
  if (score <= 0) return { created: 0, updated: 0, skipped: true };

  const supplierTypes = supplierDoc?.capabilities?.processTypes || [];
  const hasWildcard = supplierTypes.includes("OTHER");

  const rfqFilter = {
    state: "CONFIRMED",
    visibleToSuppliers: true,
  };
  if (!hasWildcard) {
    rfqFilter.rfqType = { $in: supplierTypes };
  }

  const rfqs = await RFQ.find(rfqFilter).select("_id rfqType").lean();
  if (!rfqs.length) return { created: 0, updated: 0, skipped: false };

  const now = new Date();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const leadPrice = computeLeadPrice({ supplierSQI: score });

  let created = 0;
  let updated = 0;

  for (const rfq of rfqs) {
    const existing = await Lead.findOne({ rfqId: rfq._id, supplierId: supplierDoc._id });
    if (existing && existing.isPurchased) {
      // Historical purchases should not be overwritten.
      continue;
    }

    if (!existing) {
      await Lead.create({
        rfqId: rfq._id,
        supplierId: supplierDoc._id,
        isPurchased: false,
        status: "AVAILABLE",
        purchasedAt: undefined,
        expiresAt,
        isConverted: false,
        leadScore: score,
        price: leadPrice,
        visibilityType: "NORMAL",
      });
      created += 1;
      continue;
    }

    // Refresh/ensure availability window for existing non-purchased leads.
    existing.leadScore = score;
    existing.price = leadPrice;
    existing.status = "AVAILABLE";
    existing.isPurchased = false;
    existing.expiresAt = expiresAt;
    existing.visibilityType = existing.visibilityType || "NORMAL";
    await existing.save();
    updated += 1;
  }

  return { created, updated, skipped: false };
}

async function createLeadsForConfirmedRfq(rfq) {
  const rfqType = (rfq.rfqType || "").toUpperCase();

  const matchedSuppliers = await Supplier.find({
    supplierStatus: "APPROVED",
    "SQI.score": { $gt: 0 },
    // Treat `OTHER` as a wildcard during capability matching so newly-registered suppliers can still get leads.
    "capabilities.processTypes": { $in: [rfqType, "OTHER"] },
  })
    .sort({ "SQI.score": -1 })
    .select("_id SQI.score SQI.level");

  if (matchedSuppliers.length === 0) {
    return { created: 0, supplierIds: [] };
  }

  const supplierIds = matchedSuppliers.map((s) => s._id);

  // Ensure RFQ access list is aligned with matched suppliers
  rfq.suppliersWithAccess = supplierIds;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Upsert leads for each matched supplier
  const bulkOps = matchedSuppliers.map((s) => {
    const visibilityType = "NORMAL";

    return {
      updateOne: {
        filter: { rfqId: rfq._id, supplierId: s._id },
        update: {
          $setOnInsert: {
            rfqId: rfq._id,
            supplierId: s._id,
            isPurchased: false,
            status: "AVAILABLE",
            expiresAt,
          },
          $set: {
            leadScore: s.SQI?.score ?? 0,
            price: computeLeadPrice({ supplierSQI: s.SQI?.score ?? 0 }),
            visibilityType,
          },
        },
        upsert: true,
      },
    };
  });

  await Lead.bulkWrite(bulkOps, { ordered: false });

  return { created: matchedSuppliers.length, supplierIds };
}

export const getPendingRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.find({ state: "SUBMITTED" })
      .populate("buyerId", "buyerStatus purchaseAuthority exportIntent")
      .populate("companyId", "companyName country website")
      .sort({ createdAt: -1 })
      .lean();

    res.json(rfqs);
  } catch (err) {
    console.error("getPendingRFQs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const validateRFQ = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const { clarifications, rejection } = req.body;
    const clarificationsArr = Array.isArray(clarifications)
      ? [...clarifications]
      : [];

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    const rejectionReason = typeof rejection?.reason === "string"
      ? rejection.reason.trim()
      : "";

    // An explicit admin rejection should not be overridden by auto-generated
    // clarification checks.
    if (rejectionReason) {
      rfq.state = "REJECTED";
      rfq.adminValidation = {
        status: false,
        rejectionReason,
        validatedAt: new Date(),
        validatedBy: req.user.id,
      };

      const buyer = await Buyer.findById(rfq.buyerId);
      if (buyer) {
        buyer.misuseCount = (buyer.misuseCount || 0) + 1;
        await buyer.save();
      }

      await rfq.save();
      return res.json({ message: "RFQ rejected" });
    }

    // Technical clarity check
    const specText =
      rfq.specifications || rfq.engineeringDetails?.description || "";
    if (!specText || specText.length < 10) {
      clarificationsArr.push("Specifications need more detail");
    }

    // Budget realism check
    if (!rfq.budgetRange?.min || !rfq.budgetRange?.max) {
      clarificationsArr.push("Budget range must be clear");
    }

    // Timeline feasibility check
    // `createRfq` already validates "expectedDelivery must be in the future".
    // Keep this check only for invalid or clearly past calendar dates.
    const requiredDate =
      rfq.timeLine?.expectedDeliveryDate || rfq.timeline?.requiredDate;
    if (requiredDate) {
      const required = new Date(requiredDate);
      if (Number.isNaN(required.getTime())) {
        clarificationsArr.push("Timeline must be a valid date");
      } else {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (required < todayStart) {
          clarificationsArr.push("Timeline must be in the future");
        }
      }
    }

    // If clarifications needed
    if (clarificationsArr.length > 0) {
      rfq.state = "CLARIFICATION_REQUIRED";
      rfq.adminValidation = {
        status: false,
        clarifications: clarificationsArr,
        validatedAt: new Date(),
        validatedBy: req.user.id,
      };
      await rfq.save();
      return res.json({
        message: "Clarifications required",
        clarifications: clarificationsArr,
      });
    }

    // If confirmed
    rfq.state = "CONFIRMED";
    rfq.visibleToSuppliers = true;
    rfq.adminValidation = {
      status: true,
      validatedAt: new Date(),
      validatedBy: req.user.id,
    };
    const matchResult = await createLeadsForConfirmedRfq(rfq);
    await rfq.save();

    console.log({
      action: "RFQ_CONFIRMED",
      rfqId: rfq._id?.toString(),
      matchedSuppliers: matchResult.supplierIds?.length || 0,
      leadsCreated: matchResult.created || 0,
      time: new Date().toISOString(),
    });

    res.json({
      message: "RFQ confirmed, suppliers matched, leads created",
      matchedSuppliers: matchResult.supplierIds?.length || 0,
      leadsCreated: matchResult.created || 0,
    });
  } catch (err) {
    console.error("validateRFQ error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const shortlistSuppliers = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const { supplierIds, makeExclusive } = req.body;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    if (rfq.state !== "CONFIRMED") {
      return res.status(400).json({
        message: "RFQ must be confirmed before shortlisting suppliers",
      });
    }

    // Shortlist suppliers
    rfq.shortListedSuppliers = supplierIds;
    rfq.suppliersWithAccess = supplierIds;

    // Create / update leads for shortlisted suppliers
    const suppliers = await Supplier.find({
      _id: { $in: supplierIds },
      supplierStatus: "APPROVED",
      "SQI.score": { $gt: 0 },
    }).select("_id SQI.score SQI.level");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const bulkOps = suppliers.map((s) => {
      const visibilityType = "PRIORITY";
      return {
        updateOne: {
          filter: { rfqId: rfq._id, supplierId: s._id },
          update: {
            $setOnInsert: {
              rfqId: rfq._id,
              supplierId: s._id,
              isPurchased: false,
              status: "AVAILABLE",
              expiresAt,
            },
            $set: {
              leadScore: s.SQI?.score ?? 0,
              price: computeLeadPrice({ supplierSQI: s.SQI?.score ?? 0 }),
              visibilityType,
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await Lead.bulkWrite(bulkOps, { ordered: false });
    }

    // If exclusive access
    if (makeExclusive) {
      // Update supplier access
      for (const supplierId of supplierIds) {
        await Supplier.findByIdAndUpdate(supplierId, {
          "leadAccess.exclusive": true,
          "leadAccess.premium": true,
        });
      }
    }

    await rfq.save();

    res.json({
      message: "Suppliers shortlisted",
      shortlistCount: supplierIds.length,
    });
  } catch (err) {
    console.error("shortlistSuppliers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSupplierLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const supplierId = req.supplier?._id;
    if (!supplierId) {
      return res.status(403).json({ message: "Supplier access required" });
    }

    const leads = await Lead.find({
      supplierId,
      status: { $in: ["AVAILABLE", "PURCHASED"] },
    })
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "rfqId",
        select: "rfqType title budgetRange timeline timeLine deliveryTerms state createdAt",
      });

    const total = await Lead.countDocuments({
      supplierId,
      status: { $in: ["AVAILABLE", "PURCHASED"] },
    });

    res.json({
      leads: leads
        .filter((l) => l.rfqId)
        .map((l) => ({
          id: l._id,
          rfqId: l.rfqId._id,
          isPurchased: l.isPurchased,
          status: l.status,
          price: l.price,
          leadScore: l.leadScore,
          visibilityType: l.visibilityType,
          rfq: {
            type: l.rfqId.rfqType,
            title: l.rfqId.title,
            budgetRange: l.rfqId.budgetRange,
            timeline: l.rfqId.timeline || l.rfqId.timeLine,
            deliveryTerms: l.rfqId.deliveryTerms,
            state: l.rfqId.state,
          },
        })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getSupplierLeads error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRFQs = async (req, res) => {
  try {
    const { state, page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};
    if (state) filter.state = state;

    const [rfqs, total] = await Promise.all([
      RFQ.find(filter)
        .populate("buyerId", "buyerStatus purchaseAuthority exportIntent userId")
        .populate("companyId", "companyName country website")
        .select("_id title state rfqType budgetRange quantity timeLine adminValidation visibleToSuppliers createdAt buyerId companyId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      RFQ.countDocuments(filter),
    ]);

    res.json({ rfqs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error("getAllRFQs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
