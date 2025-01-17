const axios = require('axios');
const baseUrl = 'http://localhost:8000'

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: baseUrl, // Set your API base URL here
  headers: {
    'Content-Type': 'multipart/form-data', // Set the content type for file uploads
    // Add any other headers here, like authorization if needed
  },
});

const API_POINT = {
    GENERATE_REPORT: '/generate-report'
}

module.exports = { api, API_POINT }