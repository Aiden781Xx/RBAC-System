import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import Rfq from "../models/rfq.js";

export const purchaseLead = async (req, res) => {
  const { rfqId } = req.params;
  const { supplier } = req;

  const runPurchase = async (session = null) => {
    const now = new Date();

    // Ensure RFQ is sellable/confirmed
    const rfqQuery = Rfq.findById(rfqId).select("state visibleToSuppliers");
    const rfq = session ? await rfqQuery.session(session) : await rfqQuery;
    if (!rfq || rfq.state !== "CONFIRMED" || !rfq.visibleToSuppliers) {
      return { status: 400, body: { message: "RFQ is not available for purchase" } };
    }

    const lead = await Lead.findOneAndUpdate(
      {
        rfqId,
        supplierId: supplier._id,
        status: "AVAILABLE",
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: "PURCHASED",
          isPurchased: true,
          purchasedAt: now,
        },
      },
      session ? { new: true, session } : { new: true }
    );

    if (!lead) {
      return { status: 400, body: { message: "Already purchased, expired, or unavailable" } };
    }

    if (!supplier.leadAccess) supplier.leadAccess = {};
    supplier.leadAccess.usedToday = (supplier.leadAccess.usedToday || 0) + 1;
    supplier.leadAccess.totalLeadsPurchased = (supplier.leadAccess.totalLeadsPurchased || 0) + 1;

    if (session) {
      await supplier.save({ session });
    } else {
      await supplier.save();
    }

    return {
      status: 200,
      body: {
        message: "Lead purchased successfully",
        rfqId,
        leadId: lead._id,
        buyerIdentityRevealed: true,
        remainingToday: (supplier.leadAccess.dailyLimit || 3) - (supplier.leadAccess.usedToday || 0),
      },
      lead,
    };
  };

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await runPurchase(session);
    if (result.status !== 200) {
      await session.abortTransaction();
      return res.status(result.status).json(result.body);
    }
    await session.commitTransaction();

    console.log({
      action: "LEAD_PURCHASE",
      supplierId: supplier._id?.toString(),
      rfqId,
      leadId: result.lead?._id?.toString(),
      time: new Date().toISOString(),
    });
    return res.status(200).json(result.body);
  } catch (err) {
    const txUnsupported = /Transaction numbers are only allowed|replica set|mongos/i.test(err?.message || "");
    if (txUnsupported) {
      try {
        const result = await runPurchase(null);
        return res.status(result.status).json(result.body);
      } catch (fallbackErr) {
        console.error("Purchase lead fallback error:", fallbackErr);
        return res.status(500).json({ message: "Server error" });
      }
    }
    console.error("Purchase lead error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (session) {
      try {
        await session.endSession();
      } catch {
        // no-op
      }
    }
  }
};

