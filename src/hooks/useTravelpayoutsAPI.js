import { useCallback } from 'react';
import { useCache, devLog, devError } from './useCache';
import { retryApiCall } from '../utils/retry';
import { apiRateLimiter } from '../utils/rateLimiter';

/**
 * Custom hook for Travelpayouts API integration
 * Uses FREE affiliate model - earn commission instead of paying per search
 *
 * Two API types:
 * 1. Cached API (v2/prices/latest) - for destination discovery (fast, unlimited)
 * 2. Real-time Search API (v1/flight_search) - for final booking (30-60s, 200/hour limit)
 */
export const useTravelpayoutsAPI = () => {
  const { cache, tracker } = useCache();

  const API_BASE = '/api';
  const TRAVELPAYOUTS_TOKEN = import.meta.env.VITE_TRAVELPAYOUTS_TOKEN;
  const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER;

  /**
   * Search for airports by city name
   * Note: Travelpayouts doesn't have a dedicated airport search API
   * We'll continue using Amadeus or the predefined cityToAirportsMap for this
   */
  const searchAirports = useCallback(
    async cityName => {
      // For now, delegate to Amadeus or use predefined map
      // This is a minor API call and Amadeus free tier covers it
      return retryApiCall(
        async () => {
          const cacheParams = { cityName };
          const cached = cache.get('airports', cacheParams);
          if (cached) return cached;

          await apiRateLimiter.acquire();
          tracker.trackCall('airports');

          const response = await fetch(
            `${API_BASE}/search-airports?cityName=${encodeURIComponent(cityName)}`
          );

          if (!response.ok) {
            devError('❌ API returned error status:', response.status, response.statusText);
            return [];
          }

          const data = await response.json();
          const result = data.data || [];

          cache.set('airports', cacheParams, result, 1440);
          return result;
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
        }
      );
    },
    [cache, tracker, API_BASE]
  );

  /**
   * Search for flights using Travelpayouts REAL-TIME API
   * Use this for Step 3 (final flight search) when user commits to booking
   *
   * IMPORTANT: This is the SLOW API (30-60s response time)
   * Only use when user clicks "Search Flights" button
   * Limited to 200 requests/hour per IP
   */
  const searchFlights = useCallback(
    async (origin, destination, departureDate, adults = 1, returnDate = null, filters = {}) => {
      return retryApiCall(
        async () => {
          const cacheParams = { origin, destination, departureDate, adults, returnDate, filters };
          const cached = cache.get('flights_travelpayouts', cacheParams);
          if (cached) return cached;

          await apiRateLimiter.acquire();
          tracker.trackCall('flights');

          devLog('🔍 Searching flights (Travelpayouts real-time):', {
            origin,
            destination,
            departureDate,
            returnDate,
            adults,
            filters,
          });

          const response = await fetch(
            `${API_BASE}/travelpayouts/search-flights-realtime?` +
              `origin=${origin}&destination=${destination}&departureDate=${departureDate}` +
              `&adults=${adults}` +
              (returnDate ? `&returnDate=${returnDate}` : '') +
              (filters.nonStop ? `&nonStop=true` : '')
          );

          if (!response.ok) {
            devError('❌ API returned error status:', response.status, response.statusText);
            return [];
          }

          const data = await response.json();
          devLog('✈️ Travelpayouts real-time response:', data);

          if (data.errors) {
            devError('❌ API returned errors:', data.errors);
            return [];
          }

          let results = data.data || [];

          // Apply client-side filtering for maxStops
          if (filters.maxStops !== undefined && filters.maxStops !== null && filters.maxStops > 0) {
            results = results.filter(flight => {
              return flight.itineraries.every(itinerary => {
                const stops = itinerary.segments.length - 1;
                return stops <= filters.maxStops;
              });
            });
            devLog(`   Filtered to ${results.length} flights with max ${filters.maxStops} stops`);
          }

          // Cache for 2 hours (Travelpayouts data changes similarly to Amadeus)
          cache.set('flights_travelpayouts', cacheParams, results, 120);

          return results;
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
        }
      );
    },
    [cache, tracker, API_BASE]
  );

  /**
   * Search for destinations using Travelpayouts CACHED API
   * Use this for Step 2 (destination discovery)
   *
   * This is the FAST API (instant response, unlimited requests)
   * Returns prices from last 48 hours (good enough for destination discovery)
   */
  const searchDestinations = useCallback(
    async origin => {
      return retryApiCall(
        async () => {
          const cacheParams = { origin };
          const cached = cache.get('destinations_travelpayouts', cacheParams);
          if (cached) return cached;

          // No rate limiting for cached API (unlimited)
          tracker.trackCall('destinations');

          devLog('🌍 Searching destinations (Travelpayouts cached):', origin);

          const response = await fetch(
            `${API_BASE}/travelpayouts/search-destinations-cached?origin=${origin}`
          );

          if (!response.ok) {
            devError('❌ API returned error status:', response.status, response.statusText);
            return [];
          }

          const data = await response.json();
          devLog(`🗺️ Travelpayouts cached destinations from ${origin}:`, data);

          if (data.errors) {
            devError('❌ API returned errors:', data.errors);
            return [];
          }

          const result = data.data || [];

          // Cache for 4 hours (cached data is already "old" so longer cache is fine)
          cache.set('destinations_travelpayouts', cacheParams, result, 240);

          return result;
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
        }
      );
    },
    [cache, tracker, API_BASE]
  );

  /**
   * Generate booking link with affiliate tracking
   * When user clicks "Book Now", redirect to Aviasales with our marker
   */
  const generateBookingLink = useCallback(
    (origin, destination, departureDate, returnDate = null, adults = 1) => {
      if (!TRAVELPAYOUTS_MARKER) {
        devError('⚠️ TRAVELPAYOUTS_MARKER not configured');
        return '#';
      }

      const params = new URLSearchParams({
        origin_iata: origin,
        destination_iata: destination,
        departure_at: departureDate,
        adults: String(adults),
        marker: TRAVELPAYOUTS_MARKER,
      });

      if (returnDate) {
        params.append('return_at', returnDate);
      }

      return `https://www.aviasales.com/search?${params.toString()}`;
    },
    [TRAVELPAYOUTS_MARKER]
  );

  return {
    searchAirports,
    searchFlights,
    searchDestinations,
    generateBookingLink,
  };
};
