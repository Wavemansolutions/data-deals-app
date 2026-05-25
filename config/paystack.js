const axios = require('axios');

const PAYVESSEL_BASE_URL = 'https://api.payvessel.com/v1';

const payvesselApi = axios.create({
  baseURL: PAYVESSEL_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.PAYVESSEL_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

module.exports = {
  payvesselApi,
  PAYVESSEL_BASE_URL
};
