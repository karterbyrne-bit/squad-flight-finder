/**
 * Vercel Function: Search Destinations (Travelpayouts Cached)
 * Uses Travelpayouts v2/prices/latest API (cached data from last 48 hours)
 *
 * FAST & FREE - Unlimited requests
 * Use for Step 2 (destination discovery)
 */

import {
  travelpayoutsRequest,
  setCorsHeaders,
  mapCachedDestinationData,
} from '../_utils/travelpayouts.js';

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
    const { origin } = req.query;

    if (!origin) {
      return res.status(400).json({ error: 'Missing origin parameter' });
    }

    console.log('🌍 Searching destinations (cached) from:', origin);

    // Build Travelpayouts API URL
    // v2/prices/latest returns cached prices from last 48 hours
    const params = new URLSearchParams({
      currency: 'EUR',
      origin,
      limit: '50', // Get top 50 destinations
      sorting: 'price', // Sort by price
      one_way: 'false', // Round trip by default
    });

    const url = `https://api.travelpayouts.com/v2/prices/latest?${params}`;

    // Make request to Travelpayouts
    const data = await travelpayoutsRequest(url);

    console.log('✅ Found', data.data?.length || 0, 'destinations (cached)');
    console.log('💡 Data source: Last 48 hours of searches (cached)');

    // Map to our app's format
    const mappedData = mapCachedDestinationData(data);

    return res.status(200).json(mappedData);
  } catch (error) {
    console.error('❌ Travelpayouts cached destination search error:', error);

    return res.status(500).json({
      error: 'Failed to search destinations',
      message: error.message,
      provider: 'travelpayouts_cached',
    });
  }
}
