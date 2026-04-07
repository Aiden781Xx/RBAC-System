import api from "./axiosConfig";

export const marketApi = {
  // ─── Buyer ───────────────────────────────────────────────────────────────
  getBuyerProfile:           ()           => api.get("/buyer/me"),
  updateBuyerProfile:        (data)       => api.patch("/buyer/me", data),
  declarePurchaseAuthority:  (data)       => api.post("/buyer/declare-authority", data),
  createRfq:                 (payload)    => api.post("/rfq", payload),
  getBuyerRfqs:              ()           => api.get("/rfq"),
  getRfqById:                (id)         => api.get(`/rfq/${id}`),
  getRfqQuotes:              (rfqId)      => api.get(`/rfq/${rfqId}/quotes`),
  acceptQuote:               (rfqId, qId) => api.post(`/rfq/${rfqId}/quotes/${qId}/accept`),
  closeRfq:                  (rfqId)      => api.patch(`/rfq/${rfqId}/status`, { state: "CLOSED" }),

  // ─── Admin – Dashboard ───────────────────────────────────────────────────
  getAdminOverview:          ()           => api.get("/admin/overview"),
  getAdminMetrics:           ()           => api.get("/admin/metrics"),
  getAdminFlowHealth:        ()           => api.get("/admin/flow-health"),
  // renamed route: /admin/leads conflicts with leads-management; backend serves at /admin/dashboard-leads
  getAdminLeads:             ()           => api.get("/admin/dashboard-leads"),
  getAdminQuotes:            ()           => api.get("/admin/quotes"),
  getAdminDisputes:          ()                  => api.get("/admin/disputes"),
  resolveDispute:            (supplierId, data)  => api.patch(`/admin/disputes/${supplierId}/resolve`, data),
  getAdminLogs:              ()                  => api.get("/admin/logs"),

  // ─── Admin – Leads Management (CRUD) ─────────────────────────────────────
  getAdminLeadsManagement:   (params)     => api.get("/admin/leads-management", { params }),
  getAdminLeadById:          (id)         => api.get(`/admin/leads-management/${id}`),
  createAdminLead:           (data)       => api.post("/admin/leads-management", data),
  updateAdminLead:           (id, data)   => api.patch(`/admin/leads-management/${id}`, data),
  deleteAdminLead:           (id)         => api.delete(`/admin/leads-management/${id}`),

  // ─── Admin – Buyers ──────────────────────────────────────────────────────
  getAdminBuyers:            ()           => api.get("/admin/buyers"),
  getPendingBuyers:          ()           => api.get("/admin/buyers/pending"),
  getBuyerById:              (id)         => api.get(`/admin/buyers/${id}`),
  verifyBuyer:               (id)         => api.patch(`/admin/buyers/${id}/verify`),
  restrictBuyer:             (id, data)   => api.patch(`/admin/buyers/${id}/restrict`, data || {}),
  unrestrictBuyer:           (id)         => api.patch(`/admin/buyers/${id}/unrestrict`),
  blacklistBuyer:            (id, data)   => api.patch(`/admin/buyers/${id}/blacklist`, data || {}),
  flagBuyerMisuse:           (id, reason) => api.post(`/buyer/${id}/flag`, { reason }),
  adminUpdateBuyer:          (id, data)   => api.patch(`/buyer/${id}/admin-update`, data),

  // ─── Admin – Suppliers ───────────────────────────────────────────────────
  getAdminSuppliers:         (params)     => api.get("/admin/suppliers", { params }),
  getAdminSupplierById:      (id)         => api.get(`/admin/suppliers/${id}`),
  approveSupplier:           (id, data)   => api.patch(`/admin/suppliers/${id}/approve`, data || {}),
  restrictSupplier:          (id, data)   => api.patch(`/admin/suppliers/${id}/restrict`, data || {}),
  setSupplierSQI:            (id, data)   => api.patch(`/admin/suppliers/${id}/sqi`, data),
  updateSupplierLeadAccess:  (id, data)   => api.patch(`/admin/suppliers/${id}/lead-access`, data),

  // ─── Admin – RFQs (all under /admin/rfqs/*) ──────────────────────────────
  getPendingRfqs:            ()           => api.get("/admin/rfqs/pending"),
  getAllRfqs:                 ()           => api.get("/admin/rfqs/all"),
  confirmRfq:                (rfqId)      => api.patch(`/admin/rfqs/${rfqId}/validate`, { clarifications: [], rejection: null }),
  rejectRfq:                 (rfqId, r)   => api.patch(`/admin/rfqs/${rfqId}/validate`, { rejection: { reason: r } }),
  requestClarification:      (rfqId, c)   => api.patch(`/admin/rfqs/${rfqId}/validate`, { clarifications: c }),
  shortlistSuppliers:        (rfqId, d)   => api.patch(`/admin/rfqs/${rfqId}/shortlist`, d),

  // ─── Supplier ────────────────────────────────────────────────────────────
  getSupplierProfile:        ()           => api.get("/supplier/me"),
  updateSupplierProfile:     (data)       => api.put("/supplier/me", data),
  getSupplierLeads:          (params)     => api.get("/supplier/leads", { params }),
  purchaseLead:              (rfqId)      => api.post(`/lead/${rfqId}/purchase`),
  submitQuote:               (rfqId, d)   => api.post(`/rfq/${rfqId}/quotes`, d),
};