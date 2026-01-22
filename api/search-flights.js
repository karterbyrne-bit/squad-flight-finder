/**
 * Vercel Function: Search Flights
 * Proxies requests to Amadeus Flight Offers Search API
 * Keeps API credentials secure on the server
 */

import { amadeusRequest, setCorsHeaders } from './_utils/amadeus.js';

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { origin, destination, departureDate, returnDate, adults = '1', nonStop } = req.query;

    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['origin', 'destination', 'departureDate'],
      });
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

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Flight search error:', error);

    return res.status(500).json({
      error: 'Failed to search flights',
      message: error.message,
    });
  }
}
