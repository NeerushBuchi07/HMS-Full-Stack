import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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
    // Handle auth errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Remove auth header
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      window.location.href = '/login';
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
  getBillById
};