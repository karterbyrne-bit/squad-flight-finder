import { useCallback } from 'react';
import { useCache, devLog, devError } from './useCache';
import { retryApiCall } from '../utils/retry';
import { apiRateLimiter } from '../utils/rateLimiter';

/**
 * Custom hook for Amadeus API integration
 * Now calls our secure backend API instead of Amadeus directly
 * Handles caching, retry logic, and rate limiting
 */
export const useAmadeusAPI = () => {
  const { cache, tracker } = useCache();

  // Determine API base URL based on environment
  const API_BASE = import.meta.env.DEV
    ? 'http://localhost:8888/api'  // Netlify Dev local server
    : '/api';  // Production (proxied by Netlify)

  /**
   * Search for airports by city name
   */
  const searchAirports = useCallback(async (cityName) => {
    return retryApiCall(async () => {
      // Check cache first
      const cacheParams = { cityName };
      const cached = cache.get('airports', cacheParams);
      if (cached) return cached;

      // Apply rate limiting
      await apiRateLimiter.acquire();

      tracker.trackCall('airports');

      // Call our backend API (which securely calls Amadeus)
      const response = await fetch(
        `${API_BASE}/search-airports?cityName=${encodeURIComponent(cityName)}`
      );

      if (!response.ok) {
        devError('❌ API returned error status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      const result = data.data || [];

      // Cache for 60 minutes (airports don't change often)
      cache.set('airports', cacheParams, result, 60);

      return result;
    }, {
      maxRetries: 3,
      initialDelay: 1000
    });
  }, [cache, tracker, API_BASE]);

  /**
   * Search for flights between origin and destination
   */
  const searchFlights = useCallback(async (origin, destination, departureDate, adults = 1, returnDate = null, filters = {}) => {
    return retryApiCall(async () => {
      // Check cache first
      const cacheParams = { origin, destination, departureDate, adults, returnDate, filters };
      const cached = cache.get('flights', cacheParams);
      if (cached) return cached;

      // Apply rate limiting
      await apiRateLimiter.acquire();

      tracker.trackCall('flights');

      // Build query parameters
      const params = new URLSearchParams({
        origin,
        destination,
        departureDate,
        adults: String(adults),
      });

      if (returnDate) {
        params.append('returnDate', returnDate);
      }

      if (filters.nonStop || filters.maxStops === 0) {
        params.append('nonStop', 'true');
      }

      devLog('🔍 Searching flights:', { origin, destination, departureDate, returnDate, filters, tripType: returnDate ? 'round-trip' : 'one-way' });

      // Call our backend API (which securely calls Amadeus)
      const response = await fetch(`${API_BASE}/search-flights?${params}`);

      if (!response.ok) {
        devError('❌ API returned error status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      devLog(`✈️ API Response for ${origin}->${destination} (${returnDate ? 'round-trip' : 'one-way'}):`, data);

      // Log itinerary structure for debugging
      if (data.data && data.data.length > 0) {
        const firstFlight = data.data[0];
        devLog(`   Itineraries: ${firstFlight.itineraries.length} (${firstFlight.itineraries.length > 1 ? 'round-trip' : 'one-way'})`);
      }

      if (data.errors) {
        devError('❌ API returned errors:', data.errors);
        return [];
      }

      let results = data.data || [];

      // Apply client-side filtering for maxStops (when not using nonStop)
      if (filters.maxStops !== undefined && filters.maxStops !== null && filters.maxStops > 0) {
        results = results.filter(flight => {
          // Check all itineraries (outbound and return)
          return flight.itineraries.every(itinerary => {
            const stops = itinerary.segments.length - 1; // Number of segments - 1 = stops
            return stops <= filters.maxStops;
          });
        });
        devLog(`   Filtered to ${results.length} flights with max ${filters.maxStops} stops`);
      }

      // Cache for 30 minutes
      cache.set('flights', cacheParams, results, 30);

      return results;
    }, {
      maxRetries: 3,
      initialDelay: 2000
    });
  }, [cache, tracker, API_BASE]);

  /**
   * Search for available destinations from an origin
   */
  const searchDestinations = useCallback(async (origin) => {
    return retryApiCall(async () => {
      // Check cache first
      const cacheParams = { origin };
      const cached = cache.get('destinations', cacheParams);
      if (cached) return cached;

      // Apply rate limiting
      await apiRateLimiter.acquire();

      tracker.trackCall('destinations');

      devLog('🌍 Searching destinations from:', origin);

      // Call our backend API (which securely calls Amadeus)
      const response = await fetch(`${API_BASE}/search-destinations?origin=${origin}`);

      if (!response.ok) {
        devError('❌ API returned error status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      devLog(`🗺️ Available destinations from ${origin}:`, data);

      if (data.errors) {
        devError('❌ API returned errors:', data.errors);
        return [];
      }

      const result = data.data || [];

      // Cache for 60 minutes (destinations don't change often)
      cache.set('destinations', cacheParams, result, 60);

      return result;
    }, {
      maxRetries: 3,
      initialDelay: 2000
    });
  }, [cache, tracker, API_BASE]);

  return {
    searchAirports,
    searchFlights,
    searchDestinations
  };
};
