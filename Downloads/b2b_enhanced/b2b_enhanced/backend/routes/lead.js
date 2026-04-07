import express from "express";
import auth from "../middleware/auth.js";
import { checkSupplierCanAccessLeads } from "../middleware/validation.js";
import { purchaseLead } from "../controllers/lead.js";

const router = express.Router();

// Clean, non-ambiguous lead API
router.post("/:rfqId/purchase", auth, checkSupplierCanAccessLeads, purchaseLead);

export default router;
