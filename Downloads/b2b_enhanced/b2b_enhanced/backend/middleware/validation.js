import { body, validationResult } from "express-validator";
import Buyer from "../models/buyer.js";
import Supplier from "../models/Supplier.js";

/* ---------------------------------------
   COMMON VALIDATION HANDLER
--------------------------------------- */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/* =======================================
   BUYER VALIDATIONS
======================================= */

// Make both fields optional booleans so profile creation never 400s on missing fields
export const validateBuyerProfile = [
  body("purchaseAuthority")
    .optional()
    .isBoolean()
    .withMessage("Purchase authority must be true/false"),
  body("exportIntent")
    .optional()
    .isBoolean()
    .withMessage("Export intent must be true/false"),
  handleValidationErrors,
];

export const checkBuyerCanCreateRFQ = async (req, res, next) => {
  try {
    if (!req.user || req.user.userType !== "buyer") {
      return res.status(403).json({ error: "Buyer access required" });
    }

    const buyer = await Buyer.findOne({ userId: req.user.userId });

    if (!buyer) {
      return res.status(404).json({ error: "Buyer profile not found" });
    }

    if (buyer.buyerStatus !== "VERIFIED") {
      return res.status(403).json({ error: "Buyer not verified" });
    }

    if (!buyer.purchaseAuthority) {
      return res.status(403).json({ error: "Purchase authority required" });
    }

    if (buyer.misuseCount >= 3) {
      return res.status(403).json({ error: "Account restricted" });
    }

    if (buyer.activeRfqs >= 5) {
      return res.status(403).json({ error: "Max active RFQs reached" });
    }

    req.buyer = buyer;
    next();
  } catch (error) {
    console.error("Buyer RFQ validation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* =======================================
   SUPPLIER VALIDATIONS
======================================= */

export const validateSupplierProfile = [
  body("capabilities.processTypes")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one process type required"),
  handleValidationErrors,
];

export const checkSupplierCanAccessLeads = async (req, res, next) => {
  try {
    if (!req.user || req.user.userType !== "supplier") {
      return res.status(403).json({ error: "Supplier access required" });
    }

    const supplier = await Supplier.findOne({ userId: req.user.userId });

    if (!supplier) {
      return res.status(404).json({ error: "Supplier profile not found" });
    }

    if (supplier.supplierStatus !== "APPROVED") {
      return res.status(403).json({
        error: `Supplier not approved (status: ${supplier.supplierStatus}). Awaiting admin approval.`,
      });
    }

    const sqiScore = supplier.SQI?.score ?? 0;
    // SQI=0 is allowed for newly approved suppliers — admin can set SQI later
    // Only hard-block if explicitly restricted/blacklisted (handled above)

    // Reset daily counter if stale (soft reset — no DB write here)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (supplier.leadAccess?.resetAt && supplier.leadAccess.resetAt < today) {
      supplier.leadAccess.usedToday = 0;
    }

    if ((supplier.leadAccess?.usedToday ?? 0) >= (supplier.leadAccess?.dailyLimit ?? 3)) {
      return res.status(429).json({ error: "Daily lead purchase limit reached. Resets at midnight." });
    }

    req.supplier = supplier;
    next();
  } catch (error) {
    console.error("Supplier lead validation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/* =======================================
   SQI VALIDATION
======================================= */

export const validateSQIComponents = [
  body("certifications")
    .isInt({ min: 0, max: 100 })
    .withMessage("Certifications must be 0–100"),
  body("processCapability")
    .isInt({ min: 0, max: 100 })
    .withMessage("Process capability must be 0–100"),
  body("exportMaturity")
    .isInt({ min: 0, max: 100 })
    .withMessage("Export maturity must be 0–100"),
  body("platformPerformance")
    .isInt({ min: 0, max: 100 })
    .withMessage("Platform performance must be 0–100"),
  handleValidationErrors,
];
