/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';
import { supplierApi } from '../api/supplierApi';

const SupplierContext = createContext();

const initialState = {
  profile: null,
  sqi: null,
  stats: {
    availableLeads: 0,
    purchasedLeads: 0,
    activeQuotes: 0,
    conversionRate: 0,
  },
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_SQI':
      return { ...state, sqi: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    default:
      return state;
  }
}

export function SupplierProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const profile = await supplierApi.getMe();
      const supplier = profile.data;

      dispatch({ type: 'SET_PROFILE', payload: profile.data });
      dispatch({ type: 'SET_SQI', payload: supplier?.SQI || null });
      dispatch({ 
        type: 'SET_STATS', 
        payload: {
          availableLeads: 0,
          purchasedLeads: supplier?.leadAccess?.totalLeadsPurchased || 0,
          activeQuotes: supplier?.leadAccess?.totalQuotesSubmitted || 0,
          conversionRate: supplier?.leadAccess?.conversionRate || 0,
        }
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SupplierContext.Provider value={{ ...state, refresh: loadData, dispatch }}>
      {children}
    </SupplierContext.Provider>
  );
}

export const useSupplierContext = () => useContext(SupplierContext);