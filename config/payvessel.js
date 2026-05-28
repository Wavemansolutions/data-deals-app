const axios = require('axios');

const PAYVESSEL_BASE_URL = 'https://api.payvessel.com/v1';

if (!process.env.PAYVESSEL_SECRET_KEY) {
  console.warn('[v0] WARNING: PAYVESSEL_SECRET_KEY is not set in environment variables');
}

const payvesselApi = axios.create({
  baseURL: PAYVESSEL_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.PAYVESSEL_SECRET_KEY || 'test_key'}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Add response interceptor for better error logging
payvesselApi.interceptors.response.use(
  response => {
    console.log('[v0] Payvessel API success:', {
      status: response.status,
      hasData: !!response.data
    });
    return response;
  },
  error => {
    console.error('[v0] Payvessel API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

module.exports = {
  payvesselApi,
  PAYVESSEL_BASE_URL
};
