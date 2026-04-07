import { useSupplierContext } from '../contexts/SupplierContext';
import { supplierApi } from '../api/supplierApi';
import { useState, useCallback } from 'react';

export function useSupplier() {
  const { profile, sqi, stats, loading, refresh, dispatch } = useSupplierContext();
  const [updating, setUpdating] = useState(false);

  const updateProfile = useCallback(async (data) => {
    setUpdating(true);
    try {
      const res = await supplierApi.updateMe(data);
      dispatch({ type: 'UPDATE_PROFILE', payload: res.data });
      return res.data;
    } finally {
      setUpdating(false);
    }
  }, [dispatch]);

  return { profile, sqi, stats, loading, updating, updateProfile, refresh };
}
