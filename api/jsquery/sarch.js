// search.js
const axios = require('axios');

// Your Google API Key
const apiKey = 'AIzaSyC1Z4JTXSuOhgL4cd68ImJUnAxaT8vN3as';
// Your Custom Search Engine ID (replace with yours)
const cx = '416a70b07ca2e4220'; 

async function search(query) {
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
