/**
 * Vercel Serverless Function: Search Destinations
 * Proxies requests to Amadeus Flight Destinations API
 * Keeps API credentials secure on the server
 */

import { amadeusRequest, handleCors } from './_lib/amadeus.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { origin } = req.query;

    if (!origin) {
      return res.status(400).json({ error: 'Missing origin parameter' });
    }

    console.log('🌍 Searching destinations from:', origin);

    // Make request to Amadeus API
    const url = `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${origin}&max=50`;
    const data = await amadeusRequest(url);

    console.log('✅ Found', data.data?.length || 0, 'destinations');

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Destination search error:', error);

    return res.status(500).json({
      error: 'Failed to search destinations',
      message: error.message,
    });
  }
}
