/**
 * Netlify Function: Search Airports
 * Proxies requests to Amadeus Airport & City Search API
 * Keeps API credentials secure on the server
 */

import { amadeusRequest, corsHeaders, handleCors } from './utils/amadeus.js';

export async function handler(event, context) {
  // Handle CORS preflight
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get query parameters
    const { cityName } = event.queryStringParameters || {};

    if (!cityName) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing cityName parameter' }),
      };
    }

    console.log('🔍 Searching airports for:', cityName);

    // Make request to Amadeus API
    const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=5`;
    const data = await amadeusRequest(url);

    console.log('✅ Found', data.data?.length || 0, 'results');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('❌ Airport search error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to search airports',
        message: error.message,
      }),
    };
  }
}
