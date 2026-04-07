import mongoose from "mongoose";
import Rfq from "../models/rfq.js";
import Quote from "../models/Quote.js";
import Lead from "../models/Lead.js";
import Supplier from "../models/Supplier.js";
import Buyer from "../models/buyer.js";
import { applySQI } from "../services/sqiService.js";

// ─────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────

const VALID_RFQ_TYPES = [
  "MACHINING",
  "CASTING",
  "SHEET_METAL",
  "FORGING",
  "FABRICATION",
  "INJECTION_MOULDING",
  "OTHER",
];

const VALID_STATES = [
  "SUBMITTED",
  "UNDER_VALIDATION",
  "CLARIFICATION_REQUIRED",
  "CONFIRMED",
  "REJECTED",
  "CLOSED",
];

async function ensureBuyerEligible(req) {
  const buyer = await Buyer.findOne({ userId: req.user.userId });
  if (!buyer) return { ok: false, error: "Buyer profile not found" };
  if (buyer.buyerStatus !== "VERIFIED") {
    return { ok: false, error: `Buyer is ${buyer.buyerStatus}` };
  }
  if (!buyer.purchaseAuthority) {
    return { ok: false, error: "Purchase authority declaration required" };
  }
  if ((buyer.misuseCount || 0) >= 3) return { ok: false, error: "Account restricted" };
  return { ok: true, buyer };
}

async function ensureSupplierEligible(req) {
  const supplier = await Supplier.findOne({ userId: req.user.userId });
  if (!supplier) return { ok: false, error: "Supplier profile not found" };
  if (supplier.supplierStatus !== "APPROVED") {
    return { ok: false, error: `Supplier not approved (${supplier.supplierStatus || "UNKNOWN"})` };
  }
  // SQI=0 allowed — newly approved suppliers can quote; admin sets SQI later
  return { ok: true, supplier };
}

/**
 * Validates the RFQ payload against the foundation document rules.
 * Returns an array of error strings (empty = valid).
 */
function validateRfqPayload(body) {
  const errors = [];

  // ── rfqType ──────────────────────────────────
  if (!body.rfqType) {
    errors.push("rfqType is required.");
  } else if (!VALID_RFQ_TYPES.includes(body.rfqType.toUpperCase())) {
    errors.push(
      `rfqType must be one of: ${VALID_RFQ_TYPES.join(", ")}.`
    );
  }

  // ── description / engineering specifications ──
  if (!body.description || body.description.trim().length < 20) {
    errors.push(
      "description (engineering specifications) is required and must be at least 20 characters."
    );
  }

  // ── drawings OR designRequest ─────────────────
  const hasDrawings =
    Array.isArray(body.drawings) && body.drawings.length > 0;
  const hasDesignRequest = body.designRequest === true;

  if (!hasDrawings && !hasDesignRequest) {
    errors.push(
      "Either drawings must be provided or designRequest must be set to true."
    );
  }

  // ── quantity ──────────────────────────────────
  if (!body.quantity) {
    errors.push("quantity is required.");
  } else {
    const bulk = Number(body.quantity.bulk);
    const trial = Number(body.quantity.trial);
    if (!bulk || bulk <= 0) {
      errors.push("quantity.bulk must be a positive number.");
    }
    if (!trial || trial <= 0) {
      errors.push("quantity.trial must be a positive number.");
    }
    if (bulk && trial && trial > bulk) {
      errors.push(
        "quantity.trial must be less than or equal to quantity.bulk."
      );
    }
  }

  // ── budgetRange ───────────────────────────────
  if (!body.budgetRange) {
    errors.push("budgetRange is required.");
  } else {
    const min = Number(body.budgetRange.min);
    const max = Number(body.budgetRange.max);
    if (isNaN(min) || min <= 0) {
      errors.push("budgetRange.min must be a positive number.");
    }
    if (isNaN(max) || max <= 0) {
      errors.push("budgetRange.max must be a positive number.");
    }
    if (!isNaN(min) && !isNaN(max) && min >= max) {
      errors.push("budgetRange.min must be less than budgetRange.max.");
    }
  }

  // ── timeline / expectedDelivery ───────────────
  if (!body.timeline || !body.timeline.expectedDelivery) {
    errors.push("timeline.expectedDelivery is required.");
  } else {
    const deliveryDate = new Date(body.timeline.expectedDelivery);
    if (isNaN(deliveryDate.getTime())) {
      errors.push("timeline.expectedDelivery must be a valid date.");
    } else if (deliveryDate <= new Date()) {
      errors.push("timeline.expectedDelivery must be a future date.");
    }
  }

  return errors;
}

// ─────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────

export const createRfq = async (req, res) => {
  try {
    if (req.user.userType !== "buyer") {
      return res.status(403).json({ error: "Only buyers can create RFQs." });
    }

    const eligibility = await ensureBuyerEligible(req);
    if (!eligibility.ok) {
      return res.status(403).json({ error: eligibility.error });
    }

    // Field-level validation
    const errors = validateRfqPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const rfq = await Rfq.create({
      // UI sends `title` and `description`; schema stores them in `title` + `specifications`/engineeringDetails.
      title: req.body.title,
      specifications: req.body.description,
      engineeringDetails: {
        description: req.body.description,
        designRequest: req.body.designRequest === true,
        drawings: Array.isArray(req.body.drawings) ? req.body.drawings : [],
      },
      drawings: Array.isArray(req.body.drawings) ? req.body.drawings : [],
      designRequest: req.body.designRequest === true,

      // Commercials
      rfqType: req.body.rfqType.toUpperCase(),
      budgetRange: req.body.budgetRange
        ? {
            min: Number(req.body.budgetRange.min),
            max: Number(req.body.budgetRange.max),
            currency: req.body.budgetRange.currency,
          }
        : undefined,
      quantity: req.body.quantity
        ? {
            bulk: Number(req.body.quantity.bulk),
            trial: Number(req.body.quantity.trial),
          }
        : undefined,

      // Timeline
      timeLine: req.body.timeline?.expectedDelivery
        ? { expectedDeliveryDate: new Date(req.body.timeline.expectedDelivery) }
        : undefined,

      // Identity / state
      buyerId: req.user.id,
      companyId: req.user.companyId,
      state: "SUBMITTED",
    });

    res.status(201).json({
      message: "RFQ created successfully.",
      rfq,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRfqs = async (req, res) => {
  try {
    let filter = {};

    if (req.user.userType === "buyer") {
      // Return empty array (not 403) for unverified buyers — dashboard must load cleanly.
      const buyer = await Buyer.findOne({ userId: req.user.userId });
      if (!buyer) return res.status(200).json([]);
      if (buyer.buyerStatus !== "VERIFIED") {
        return res.status(200).json({ rfqs: [], buyerStatus: buyer.buyerStatus });
      }
      filter = { buyerId: buyer._id };
    }

    if (req.user.userType === "supplier") {
      const eligibility = await ensureSupplierEligible(req);
      if (!eligibility.ok) {
        // Return empty array for unapproved/no-SQI suppliers — leads page must load cleanly.
        return res.status(200).json({ rfqs: [], supplierStatus: eligibility.error });
      }
      const leads = await Lead.find({
        supplierId: req.user.id,
      }).select("rfqId");

      const rfqIds = leads.map((l) => l.rfqId);

      filter = {
        _id: { $in: rfqIds },
        state: "CONFIRMED",
      };
    }

    // ADMIN: filter = {} → all RFQs

    const rfqs = await Rfq.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "buyerId",
        populate: { path: "companyId", select: "companyName" },
      });

    res.status(200).json(rfqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRfqById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid RFQ ID." });
    }

    const rfq = await Rfq.findById(req.params.id).populate({
      path: "buyerId",
      populate: { path: "companyId", select: "companyName" },
    });

    if (!rfq) {
      return res.status(404).json({ error: "RFQ not found." });
    }

    // BUYER: must own the RFQ
    if (
      req.user.userType === "buyer" &&
      rfq.buyerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "You do not own this RFQ." });
    }

    // SUPPLIER: must have a purchased lead for this RFQ
    if (req.user.userType === "supplier") {
      const eligibility = await ensureSupplierEligible(req);
      if (!eligibility.ok) {
        return res.status(403).json({ error: eligibility.error });
      }
      const lead = await Lead.findOne({
        rfqId: rfq._id,
        supplierId: req.user.id,
        isPurchased: true,
      });

      if (!lead) {
        return res.status(403).json({
          error: "You must purchase this lead to view the full RFQ details.",
        });
      }
    }

    res.status(200).json(rfq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRfqStatus = async (req, res) => {
  try {
    // Role guard: only BUYER or ADMIN
    if (!["buyer", "admin"].includes(req.user.userType)) {
      return res.status(403).json({ error: "Not allowed." });
    }

    if (req.user.userType === "buyer") {
      const eligibility = await ensureBuyerEligible(req);
      if (!eligibility.ok) {
        return res.status(403).json({ error: eligibility.error });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid RFQ ID." });
    }

    const rawState = req.body?.state;
    const state = typeof rawState === "string" ? rawState.trim().toUpperCase() : "";

    if (!state) {
      return res.status(400).json({ error: "state is required." });
    }

    if (!VALID_STATES.includes(state)) {
      return res.status(400).json({
        error: `Invalid state. Allowed values: ${VALID_STATES.join(", ")}.`,
      });
    }

    const rfq = await Rfq.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ error: "RFQ not found." });
    }

    // BUYER: must own the RFQ
    if (
      req.user.userType === "buyer" &&
      rfq.buyerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "You do not own this RFQ." });
    }

    // BUYER: restrict which states they can set themselves
    // (Admin-only states: UNDER_VALIDATION, CLARIFICATION_REQUIRED, CONFIRMED, REJECTED)
    const buyerAllowedStates = ["CLOSED"];
    if (
      req.user.userType === "buyer" &&
      !buyerAllowedStates.includes(state)
    ) {
      return res.status(403).json({
        error: `Buyers can only set state to: ${buyerAllowedStates.join(", ")}.`,
      });
    }

    // Guard: cannot move a CLOSED or REJECTED RFQ to an active state
    const terminalStates = ["CLOSED", "REJECTED"];
    if (terminalStates.includes(rfq.state) && !terminalStates.includes(state)) {
      return res.status(400).json({
        error: `Cannot reopen an RFQ that is already ${rfq.state}.`,
      });
    }

    rfq.state = state;
    await rfq.save();

    res.status(200).json({
      message: "RFQ status updated successfully.",
      rfq,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRfq = async (req, res) => {
  try {
    if (req.user.userType !== "buyer") {
      return res
        .status(403)
        .json({ error: "Only buyers can delete their own RFQs." });
    }

    const eligibility = await ensureBuyerEligible(req);
    if (!eligibility.ok) {
      return res.status(403).json({ error: eligibility.error });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid RFQ ID." });
    }

    const rfq = await Rfq.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ error: "RFQ not found." });
    }

    if (rfq.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not own this RFQ." });
    }

    // Prevent deletion of active / confirmed RFQs to protect suppliers
    const nonDeletableStates = ["CONFIRMED", "UNDER_VALIDATION"];
    if (nonDeletableStates.includes(rfq.state)) {
      return res.status(400).json({
        error: `Cannot delete an RFQ in ${rfq.state} state. Please close it instead.`,
      });
    }

    await rfq.deleteOne();

    res.status(200).json({ message: "RFQ deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuotesForRfq = async (req, res) => {
  try {
    if (req.user.userType !== "buyer") {
      return res
        .status(403)
        .json({ error: "Only buyers can view quotes for their RFQs." });
    }

    const eligibility = await ensureBuyerEligible(req);
    if (!eligibility.ok) {
      return res.status(403).json({ error: eligibility.error });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid RFQ ID." });
    }

    const rfq = await Rfq.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ error: "RFQ not found." });
    }

    if (rfq.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You do not own this RFQ." });
    }

    const quotes = await Quote.find({ rfqId: rfq._id })
      .populate({
        path: "supplierId",
        populate: [
          { path: "companyId", select: "companyName" },
          { path: "userId", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitQuoteForRfq = async (req, res) => {
  try {
    if (req.user.userType !== "supplier") {
      return res.status(403).json({ error: "Only suppliers can submit quotes." });
    }

    const eligibility = await ensureSupplierEligible(req);
    if (!eligibility.ok) {
      return res.status(403).json({ error: eligibility.error });
    }

    const rfqId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(rfqId)) {
      return res.status(400).json({ error: "Invalid RFQ ID." });
    }

    const { quotedPrice, leadTimeDays, remarks } = req.body || {};
    if (quotedPrice == null || Number(quotedPrice) <= 0) {
      return res.status(400).json({ error: "quotedPrice must be a positive number." });
    }
    if (leadTimeDays == null || Number(leadTimeDays) <= 0) {
      return res.status(400).json({ error: "leadTimeDays must be a positive number." });
    }

    const rfq = await Rfq.findById(rfqId).select("state visibleToSuppliers");
    if (!rfq || rfq.state !== "CONFIRMED" || !rfq.visibleToSuppliers) {
      return res.status(400).json({ error: "RFQ is not open for quoting." });
    }

    // Must have purchased lead
    const lead = await Lead.findOne({
      rfqId,
      supplierId: req.user.id,
      isPurchased: true,
    });
    if (!lead) {
      return res.status(403).json({
        error: "You must purchase this lead before submitting a quote.",
      });
    }

    if (lead.expiresAt && lead.expiresAt < new Date()) {
      return res.status(400).json({ error: "Lead expired" });
    }

    const existing = await Quote.findOne({ rfqId, supplierId: req.user.id }).select("_id");
    if (existing) {
      return res.status(400).json({ error: "Duplicate quote not allowed for this RFQ." });
    }

    const quote = await Quote.create({
      rfqId,
      supplierId: req.user.id,
      quotedPrice: Number(quotedPrice),
      leadTimeDays: Number(leadTimeDays),
      remarks,
      status: "SUBMITTED",
    });

    await Supplier.findByIdAndUpdate(req.user.id, {
      $inc: { "leadAccess.totalQuotesSubmitted": 1 },
    });

    console.log({
      action: "QUOTE_SUBMITTED",
      rfqId,
      quoteId: quote._id?.toString(),
      supplierId: req.user.id,
      time: new Date().toISOString(),
    });

    res.status(201).json({ message: "Quote submitted", quote });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ error: "Duplicate quote not allowed for this RFQ." });
    }
    res.status(500).json({ error: error.message });
  }
};

export const acceptQuoteForRfq = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (req.user.userType !== "buyer") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: "Only buyers can accept quotes." });
    }

    const eligibility = await ensureBuyerEligible(req);
    if (!eligibility.ok) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: eligibility.error });
    }

    const rfqId = req.params.id;
    const quoteId = req.params.quoteId;
    if (!mongoose.Types.ObjectId.isValid(rfqId) || !mongoose.Types.ObjectId.isValid(quoteId)) {
      return res.status(400).json({ error: "Invalid RFQ/Quote ID." });
    }

    const rfq = await Rfq.findById(rfqId).select("buyerId state");
    if (!rfq) return res.status(404).json({ error: "RFQ not found." });
    if (rfq.buyerId.toString() !== req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: "You do not own this RFQ." });
    }
    if (rfq.state !== "CONFIRMED") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "RFQ must be CONFIRMED to accept quotes." });
    }

    const winningQuote = await Quote.findOne({ _id: quoteId, rfqId }).session(session);
    if (!winningQuote) return res.status(404).json({ error: "Quote not found for this RFQ." });
    if (winningQuote.status === "REJECTED") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Cannot accept a rejected quote." });
    }

    // Mark winning quote accepted
    winningQuote.status = "ACCEPTED";
    await winningQuote.save({ session });

    // Mark all other quotes rejected
    await Quote.updateMany(
      { rfqId, _id: { $ne: winningQuote._id }, status: { $ne: "REJECTED" } },
      { $set: { status: "REJECTED" } },
      { session }
    );

    // Update lead conversion for winning supplier
    const lead = await Lead.findOne({
      rfqId,
      supplierId: winningQuote.supplierId,
      isPurchased: true,
    }).session(session);

    if (lead) {
      lead.isConverted = true;
      lead.convertedAt = new Date();
      lead.acceptedQuoteId = winningQuote._id;
      await lead.save({ session });
    }

    // Update supplier performance + conversion + SQI recalculation (via pre-save hook)
    const supplier = await Supplier.findById(winningQuote.supplierId).session(session);
    if (supplier) {
      supplier.leadAccess.totalLeadsConverted = (supplier.leadAccess.totalLeadsConverted || 0) + 1;

      const submitted = supplier.leadAccess.totalQuotesSubmitted || 0;
      const converted = supplier.leadAccess.totalLeadsConverted || 0;
      const conversionRate = submitted > 0 ? Number((converted / submitted).toFixed(4)) : 0;
      supplier.leadAccess.conversionRate = conversionRate;

      // Recalculate SQI by updating platformPerformance component from conversionRate
      supplier.SQI = supplier.SQI || {};
      supplier.SQI.components = supplier.SQI.components || {};
      supplier.SQI.components.platformPerformance = Math.max(
        0,
        Math.min(100, Math.round(conversionRate * 100))
      );

      applySQI(supplier);
      await supplier.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    console.log({
      action: "QUOTE_ACCEPTED",
      rfqId,
      acceptedQuoteId: winningQuote._id?.toString(),
      acceptedSupplierId: winningQuote.supplierId?.toString(),
      time: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Quote accepted; others rejected; lead and supplier metrics updated.",
      acceptedQuoteId: winningQuote._id,
      rejectedCount: await Quote.countDocuments({ rfqId, status: "REJECTED" }),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};