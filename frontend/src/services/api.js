import axios from 'axios';

// Build the API base URL from environment variable when provided.
// REACT_APP_API_URL can be set to the backend root (with or without a trailing /api).
const _env = process.env.REACT_APP_API_URL || '';
let API_BASE_URL = '';
if (_env) {
  // normalize: ensure it ends with /api
  if (_env.endsWith('/api')) API_BASE_URL = _env.replace(/\/+$/, '');
  else API_BASE_URL = _env.replace(/\/+$/, '') + '/api';
} else {
  // Fallbacks: prefer relative /api (useful when frontend is served from same origin)
  // but also allow local development to work without extra config
  API_BASE_URL = window?.location?.origin ? `${window.location.origin}/api` : 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // Increase timeout to 30s to allow slower network/backend responses during diagnosis
  timeout: 30000,
});

// Log the computed API base URL so deployed frontend consoles reveal which backend it's calling.
/* eslint-disable no-console */
console.info('[api] API_BASE_URL =', API_BASE_URL, '; REACT_APP_API_URL=', process.env.REACT_APP_API_URL || '<not set>');
/* eslint-enable no-console */

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Only set auth header if we have a valid token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Also update the default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Clean up any stale auth headers
      delete config.headers.Authorization;
      delete api.defaults.headers.common['Authorization'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors (401)
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      const isLoginOrSignup = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/patient/signup') || reqUrl.includes('/auth/signup');

      // Log 401 details for debugging
      /* eslint-disable no-console */
      console.warn('[api] 401 received for', reqUrl, '; isLoginOrSignup=', isLoginOrSignup);
      console.debug('[api] full error:', error);
      /* eslint-enable no-console */

      if (isLoginOrSignup) {
        // For login/signup failures, do NOT clear localStorage or redirect here.
        // Let the calling code handle showing the error so the UI can display
        // invalid credential messages without being reloaded or redirected.
        return Promise.reject(error);
      }

      // For other endpoints, clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Billing related API calls
const createBill = async (billData) => {
  try {
    const response = await api.post('/billing', billData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getAllBills = async () => {
  try {
    const response = await api.get('/billing');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getPatientBills = async (patientId) => {
  try {
    const response = await api.get(`/billing/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getBillById = async (billId) => {
  try {
    const response = await api.get(`/billing/${billId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export {
  api as default,
  createBill,
  getAllBills,
  getPatientBills,
  getBillById,
  API_BASE_URL
};