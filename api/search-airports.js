/**
 * Vercel Serverless Function: Search Airports
 * Proxies requests to Amadeus Airport & City Search API
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
    const { cityName } = req.query;

    if (!cityName) {
      return res.status(400).json({ error: 'Missing cityName parameter' });
    }

    console.log('🔍 Searching airports for:', cityName);

    // Make request to Amadeus API
    const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=5`;
    const data = await amadeusRequest(url);

    console.log('✅ Found', data.data?.length || 0, 'results');

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Airport search error:', error);

    return res.status(500).json({
      error: 'Failed to search airports',
      message: error.message,
    });
  }
}
