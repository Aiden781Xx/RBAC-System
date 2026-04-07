import express from "express";
import auth from "../middleware/auth.js";
import { checkSupplierCanAccessLeads } from "../middleware/validation.js";
import { getSupplierLeads } from "../controllers/adminRFQ.js";
import {
  createRfq,
  getAllRfqs,
  getRfqById,
  updateRfqStatus,
  deleteRfq,
  getQuotesForRfq,
  submitQuoteForRfq,
  acceptQuoteForRfq,
} from "../controllers/rfq.js";

const router = express.Router();

// NOTE: Admin RFQ routes (pending/validate/shortlist/all) have moved to
// /api/admin/rfqs/* — see routes/admin.js. Do NOT put them here to avoid
// /:rfqId wildcard conflicts.

// ── Supplier: view available leads ────────────────────────────────────────
router.get("/supplier/leads", auth, checkSupplierCanAccessLeads, getSupplierLeads);

// ── Buyer / Supplier shared ───────────────────────────────────────────────
router.post("/",                              auth, createRfq);
router.get("/",                               auth, getAllRfqs);
router.get("/:id/quotes",                     auth, getQuotesForRfq);
router.post("/:id/quotes",                    auth, submitQuoteForRfq);
router.post("/:id/quotes/:quoteId/accept",    auth, acceptQuoteForRfq);
router.get("/:id",                            auth, getRfqById);
router.patch("/:id/status",                   auth, updateRfqStatus);
router.delete("/:id",                         auth, deleteRfq);

export default router;
