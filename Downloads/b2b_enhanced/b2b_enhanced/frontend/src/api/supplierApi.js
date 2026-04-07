import api from './axiosConfig';

export const supplierApi = {
  // Supplier profile (backend: /api/supplier/me)
  getMe: () => api.get('/supplier/me'),
  updateMe: (data) => api.put('/supplier/me', data),

  // Leads list (backend: /api/rfq/supplier/leads)
  getLeads: (params) => api.get('/rfq/supplier/leads', { params }),

  // Purchase lead (backend: /api/lead/:rfqId/purchase)
  purchaseLead: (rfqId) => api.post(`/lead/${rfqId}/purchase`),

  // Quote submit (backend: POST /api/rfq/:rfqId/quotes)
  submitQuote: (rfqId, data) => api.post(`/rfq/${rfqId}/quotes`, data),
};
