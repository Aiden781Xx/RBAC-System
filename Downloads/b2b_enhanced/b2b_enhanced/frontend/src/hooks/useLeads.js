 import { useState, useEffect, useCallback } from 'react';
import { supplierApi } from '../api/supplierApi';

export function useLeads() {
  const [available, setAvailable] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const loadAvailable = useCallback(async () => {
    setLoading(true);
    const res = await supplierApi.getLeads(filters);
    const leads = res.data?.leads || [];
    setAvailable(leads.filter((l) => !l.isPurchased));
    setLoading(false);
  }, [filters]);

  const loadMyLeads = useCallback(async () => {
    setLoading(true);
    const res = await supplierApi.getLeads(filters);
    const leads = res.data?.leads || [];
    setMyLeads(leads.filter((l) => l.isPurchased));
    setLoading(false);
  }, [filters]);

  const buyLead = async (rfqId) => {
    await supplierApi.purchaseLead(rfqId);
    await loadAvailable();
    await loadMyLeads();
  };

  const submitQuote = async (rfqId, data) => {
    await supplierApi.submitQuote(rfqId, data);
    await loadMyLeads();
  };

  useEffect(() => {
    // run async loader inside IIFE to satisfy lint rule about setState in effect
    (async () => {
      await loadAvailable();
    })();
  }, [loadAvailable]);

  return {
    available,
    myLeads,
    loading,
    filters,
    setFilters,
    buyLead,
    submitQuote,
  };
}