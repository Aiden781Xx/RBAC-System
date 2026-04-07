export const API_ENDPOINTS = {
  GET_LEADS: '/supplier/leads',
  BUY_LEAD: (id) => `/supplier/leads/${id}/buy`,
  SUBMIT_QUOTE: '/supplier/quotes',
};

export const ROLES = {
  ADMIN: 'admin',
  BUYER: 'buyer',
  SUPPLIER: 'supplier',
};
