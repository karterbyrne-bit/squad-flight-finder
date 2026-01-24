/**
 * Vercel Function: Search Flights (Travelpayouts Real-Time)
 * Uses Travelpayouts Flight Search API (real-time search)
 *
 * SLOW but ACCURATE - 30-60 second response time
 * LIMITED - 200 requests per hour per IP
 * Use ONLY for Step 3 (final flight search when user commits)
 *
 * Note: Travelpayouts uses async search model:
 * 1. Initiate search (returns search_id)
 * 2. Poll for results (can take 30-60 seconds)
 * 3. Return final results
 */

import {
  travelpayoutsRequest,
  setCorsHeaders,
  getMarker,
  mapRealTimeFlightData,
} from '../_utils/travelpayouts.js';

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initiate flight search
 */
async function initiateSearch(params) {
  const marker = getMarker();
  const url = 'https://api.travelpayouts.com/v1/flight_search';

  const searchParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    depart_date: params.departureDate,
    return_date: params.returnDate || '',
    adults: params.adults || '1',
    children: '0',
    infants: '0',
    trip_class: '0', // Economy
    marker: marker,
    currency: 'EUR',
    host: 'www.aviasales.com',
  });

  console.log('🔍 Initiating Travelpayouts flight search:', searchParams.toString());

  const response = await travelpayoutsRequest(`${url}?${searchParams}`, {
    method: 'GET',
  });

  return response.search_id;
}

/**
 * Poll for search results
 */
async function pollResults(searchId, maxAttempts = 20) {
  const url = `https://api.travelpayouts.com/v1/flight_search_results`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📊 Polling results (attempt ${attempt}/${maxAttempts})...`);

    try {
      const params = new URLSearchParams({
        uuid: searchId,
        currency: 'EUR',
        host: 'www.aviasales.com',
      });

      const response = await travelpayoutsRequest(`${url}?${params}`);

      // Check if search is complete
      if (response.data && response.data.length > 0) {
        console.log(`✅ Found ${response.data.length} flights`);
        return response;
      }

      // Search still in progress, wait before next poll
      if (attempt < maxAttempts) {
        const waitTime = Math.min(3000 + attempt * 1000, 5000); // Exponential backoff up to 5s
        console.log(`⏳ Waiting ${waitTime}ms before next poll...`);
        await sleep(waitTime);
      }
    } catch (error) {
      console.error(`❌ Poll attempt ${attempt} failed:`, error);

      if (attempt === maxAttempts) {
        throw error;
      }

      // Wait before retry
      await sleep(2000);
    }
  }

  // Timeout - no results after max attempts
  console.warn('⚠️ Search timed out after maximum polling attempts');
  return { data: [] };
}

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
    const { origin, destination, departureDate, returnDate, adults, nonStop } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['origin', 'destination', 'departureDate'],
      });
    }

    console.log('✈️ Searching flights (real-time) with Travelpayouts:', {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      nonStop,
    });

    // Step 1: Initiate search
    const searchId = await initiateSearch({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
    });

    console.log(`🎫 Search initiated with ID: ${searchId}`);

    // Step 2: Poll for results (can take 30-60 seconds)
    const results = await pollResults(searchId);

    // Step 3: Map to our app's format
    const mappedData = mapRealTimeFlightData(results);

    // Step 4: Apply nonStop filter if requested
    let finalData = mappedData;
    if (nonStop === 'true' && mappedData.data) {
      finalData.data = mappedData.data.filter(flight => {
        return flight.itineraries.every(itinerary => {
          return itinerary.segments.length === 1;
        });
      });
      console.log(`🔍 Filtered to ${finalData.data.length} direct flights only`);
    }

    console.log(`✅ Returning ${finalData.data?.length || 0} flight options`);

    return res.status(200).json(finalData);
  } catch (error) {
    console.error('❌ Travelpayouts real-time flight search error:', error);

    return res.status(500).json({
      error: 'Failed to search flights',
      message: error.message,
      provider: 'travelpayouts_realtime',
    });
  }
}
