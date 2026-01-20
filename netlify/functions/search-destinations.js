/**
 * Netlify Function: Search Destinations
 * Proxies requests to Amadeus Flight Destinations API
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
    const { origin } = event.queryStringParameters || {};

    if (!origin) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing origin parameter' }),
      };
    }

    console.log('🌍 Searching destinations from:', origin);

    // Make request to Amadeus API
    const url = `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${origin}&max=50`;
    const data = await amadeusRequest(url);

    console.log('✅ Found', data.data?.length || 0, 'destinations');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('❌ Destination search error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to search destinations',
        message: error.message,
      }),
    };
  }
}
