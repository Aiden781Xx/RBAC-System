import express from "express";
import auth from "../middleware/auth.js";
import adminGuard from "../middleware/adminGuard.js";

import {
  getAllSuppliers, getSupplierById, approveSupplier,
  restrictSupplier, setSupplierSQI, updateSupplierLeadAccess,
} from "../controllers/adminSupplier.js";
import {
  getAllLeads, getLeadById, updateLead, createLead, deleteLead,
} from "../controllers/adminLead.js";
import {
  getAllBuyers, getPendingBuyers, verifyBuyer, restrictBuyer,
  blacklistBuyer, getBuyerById, unrestrictBuyer,
} from "../controllers/adminBuyer.js";
import {
  getAdminMetrics, getAdminOverview, getFlowHealth,
  getAdminLeads, getAdminQuotes, getAdminDisputes, getAdminLogs,
  resolveDispute,
} from "../controllers/adminDashboard.js";
import {
  getPendingRFQs, validateRFQ, shortlistSuppliers, getAllRFQs,
} from "../controllers/adminRFQ.js";

const router = express.Router();

// ── Dashboard ─────────────────────────────────────────────────────────────
router.get("/overview",         auth, adminGuard, getAdminOverview);
router.get("/metrics",          auth, adminGuard, getAdminMetrics);
router.get("/flow-health",      auth, adminGuard, getFlowHealth);
// NOTE: /leads conflicts with leads-management; use /dashboard-leads for the summary
router.get("/dashboard-leads",  auth, adminGuard, getAdminLeads);
router.get("/quotes",           auth, adminGuard, getAdminQuotes);
router.get("/disputes",         auth, adminGuard, getAdminDisputes);
router.patch("/disputes/:supplierId/resolve", auth, adminGuard, resolveDispute);
router.get("/logs",             auth, adminGuard, getAdminLogs);

// ── Buyers ────────────────────────────────────────────────────────────────
router.get("/buyers",                       auth, adminGuard, getAllBuyers);
router.get("/buyers/pending",               auth, adminGuard, getPendingBuyers);
router.get("/buyers/:buyerId",              auth, adminGuard, getBuyerById);
router.patch("/buyers/:buyerId/verify",     auth, adminGuard, verifyBuyer);
router.patch("/buyers/:buyerId/restrict",   auth, adminGuard, restrictBuyer);
router.patch("/buyers/:buyerId/unrestrict", auth, adminGuard, unrestrictBuyer);
router.patch("/buyers/:buyerId/blacklist",  auth, adminGuard, blacklistBuyer);

// ── Suppliers ─────────────────────────────────────────────────────────────
router.get("/suppliers",                   auth, adminGuard, getAllSuppliers);
router.get("/suppliers/:id",               auth, adminGuard, getSupplierById);
router.patch("/suppliers/:id/approve",     auth, adminGuard, approveSupplier);
router.patch("/suppliers/:id/restrict",    auth, adminGuard, restrictSupplier);
router.patch("/suppliers/:id/sqi",         auth, adminGuard, setSupplierSQI);
router.patch("/suppliers/:id/lead-access", auth, adminGuard, updateSupplierLeadAccess);

// ── RFQ Management ────────────────────────────────────────────────────────
router.get("/rfqs/pending",              auth, adminGuard, getPendingRFQs);
router.get("/rfqs/all",                  auth, adminGuard, getAllRFQs);
router.patch("/rfqs/:rfqId/validate",    auth, adminGuard, validateRFQ);
router.patch("/rfqs/:rfqId/shortlist",   auth, adminGuard, shortlistSuppliers);

// ── Leads CRUD ────────────────────────────────────────────────────────────
router.get("/leads-management",          auth, adminGuard, getAllLeads);
router.get("/leads-management/:id",      auth, adminGuard, getLeadById);
router.patch("/leads-management/:id",    auth, adminGuard, updateLead);
router.post("/leads-management",         auth, adminGuard, createLead);
router.delete("/leads-management/:id",   auth, adminGuard, deleteLead);

export default router;
