/**
 * Netlify Function: Search Flights
 * Proxies requests to Amadeus Flight Offers Search API
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
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = '1',
      nonStop,
    } = event.queryStringParameters || {};

    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Missing required parameters',
          required: ['origin', 'destination', 'departureDate'],
        }),
      };
    }

    console.log('🔍 Searching flights:', {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      nonStop,
    });

    // Build Amadeus API URL
    let url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&max=5`;

    if (returnDate) {
      url += `&returnDate=${returnDate}`;
    }

    if (nonStop === 'true') {
      url += '&nonStop=true';
    }

    // Make request to Amadeus API
    const data = await amadeusRequest(url);

    console.log('✅ Found', data.data?.length || 0, 'flight offers');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('❌ Flight search error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to search flights',
        message: error.message,
      }),
    };
  }
}
