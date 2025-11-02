// Central API configuration for frontend
// Uses REACT_APP_API_URL if provided, otherwise falls back to the Render URL
const API = process.env.REACT_APP_API_URL || 'https://unizulu-health-care-portal.onrender.com';

export default API;
