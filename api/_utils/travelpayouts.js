/**
 * Travelpayouts API Utilities
 * Handles authentication and common request logic for Travelpayouts API
 */

/**
 * Make a request to Travelpayouts API with authentication
 * @param {string} url - The Travelpayouts API endpoint URL
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} - The API response data
 */
export async function travelpayoutsRequest(url, options = {}) {
  const token = process.env.TRAVELPAYOUTS_TOKEN;

  if (!token) {
    throw new Error('TRAVELPAYOUTS_TOKEN is not configured');
  }

  console.log(`🔗 Travelpayouts API Request: ${url}`);

  const headers = {
    'X-Access-Token': token,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Travelpayouts API Error (${response.status}):`, errorText);
      throw new Error(`Travelpayouts API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Travelpayouts request failed:', error);
    throw error;
  }
}

/**
 * Set CORS headers for API responses
 * @param {object} res - The response object
 */
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Access-Token');
}

/**
 * Get the affiliate marker (partner ID) for tracking commissions
 * @returns {string} - The marker/partner ID
 */
export function getMarker() {
  const marker = process.env.TRAVELPAYOUTS_MARKER;

  if (!marker) {
    console.warn('⚠️ TRAVELPAYOUTS_MARKER is not configured - affiliate tracking disabled');
  }

  return marker || '';
}

/**
 * Map Travelpayouts cached price data to our app's format
 * Converts from Travelpayouts v2/prices/latest format to app-friendly format
 */
export function mapCachedDestinationData(travelpayoutsData) {
  if (!travelpayoutsData || !travelpayoutsData.data) {
    return { data: [] };
  }

  // Transform Travelpayouts format to match our expected structure
  const destinations = travelpayoutsData.data.map(item => ({
    type: 'flight-destination',
    origin: item.origin,
    destination: item.destination,
    departureDate: item.departure_at,
    returnDate: item.return_at,
    price: {
      total: String(item.value),
    },
    // Add airline if available
    ...(item.airline && { airline: item.airline }),
  }));

  return {
    data: destinations,
    meta: {
      count: destinations.length,
      source: 'travelpayouts_cached',
      currency: travelpayoutsData.currency || 'USD',
    },
  };
}

/**
 * Map Travelpayouts real-time flight data to our app's format
 * Converts from Travelpayouts flight search format to app-friendly format
 */
export function mapRealTimeFlightData(travelpayoutsData) {
  if (!travelpayoutsData || !travelpayoutsData.data) {
    return { data: [] };
  }

  // Transform Travelpayouts real-time format to match Amadeus-like structure
  const flights = travelpayoutsData.data.map((item, index) => ({
    id: `tp_${index}`,
    type: 'flight-offer',
    source: 'travelpayouts',
    instantTicketingRequired: false,
    nonRefundable: true,
    oneWay: !item.return_at,
    lastTicketingDate: item.departure_at,
    numberOfBookableSeats: 9,
    itineraries: [
      {
        duration: item.duration || 'PT2H',
        segments: item.segments || [
          {
            departure: {
              iataCode: item.origin,
              at: item.departure_at,
            },
            arrival: {
              iataCode: item.destination,
              at: item.arrival_at || item.departure_at,
            },
            carrierCode: item.airline || 'XX',
            number: item.flight_number || '0000',
            aircraft: {
              code: '320',
            },
            operating: {
              carrierCode: item.airline || 'XX',
            },
            duration: item.duration || 'PT2H',
            id: `${index}_1`,
            numberOfStops: 0,
            blacklistedInEU: false,
          },
        ],
      },
    ],
    price: {
      currency: item.currency || 'USD',
      total: String(item.value),
      base: String(item.value),
      grandTotal: String(item.value),
    },
    pricingOptions: {
      fareType: ['PUBLISHED'],
      includedCheckedBagsOnly: true,
    },
    validatingAirlineCodes: [item.airline || 'XX'],
    travelerPricings: [
      {
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: item.currency || 'USD',
          total: String(item.value),
          base: String(item.value),
        },
        fareDetailsBySegment: [
          {
            segmentId: `${index}_1`,
            cabin: 'ECONOMY',
            fareBasis: 'Economy',
            class: 'Y',
            includedCheckedBags: {
              quantity: 0,
            },
          },
        ],
      },
    ],
  }));

  return {
    data: flights,
    meta: {
      count: flights.length,
      source: 'travelpayouts_realtime',
    },
    dictionaries: {
      currencies: {
        EUR: 'EURO',
        USD: 'US DOLLAR',
        GBP: 'POUND STERLING',
      },
    },
  };
}
