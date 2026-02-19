// search.js
const axios = require('axios');

// Use environment variables for API credentials (never hardcode secrets!)
const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.GOOGLE_SEARCH_CX;

if (!apiKey || !cx) {
  console.warn('Warning: GOOGLE_API_KEY and GOOGLE_SEARCH_CX environment variables should be set');
}

async function search(query) {
  if (!apiKey || !cx) {
    throw new Error('Search API credentials not configured');
  }
  
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: cx,
        q: query
      }
    });
    return response.data.items; // Only return search results
  } catch (error) {
    console.error('Error searching Google:', error.message);
    throw new Error('Google Search API error');
  }
}

module.exports = search;
