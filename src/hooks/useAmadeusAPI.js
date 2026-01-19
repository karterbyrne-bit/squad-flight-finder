import { useMemo, useCallback } from 'react';
import { useCache, devLog, devError } from './useCache';
import { retryApiCall } from '../utils/retry';
import { apiRateLimiter } from '../utils/rateLimiter';

/**
 * Custom hook for Amadeus API integration
 * Handles authentication, caching, retry logic, and rate limiting
 */
export const useAmadeusAPI = () => {
  const { cache, tracker } = useCache();

  // Token management state (shared across all hook instances)
  const tokenManager = useMemo(() => ({
    accessToken: null,
    tokenExpiry: null,

    async getAccessToken() {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: import.meta.env.VITE_AMADEUS_API_KEY,
          client_secret: import.meta.env.VITE_AMADEUS_API_SECRET,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error_description || 'Authentication failed');
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      return this.accessToken;
    }
  }), []);

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

      const token = await tokenManager.getAccessToken();
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
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
  }, [cache, tracker, tokenManager]);

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

      const token = await tokenManager.getAccessToken();
      let url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&max=5`;

      // Add returnDate for round-trip searches
      if (returnDate) {
        url += `&returnDate=${returnDate}`;
      }

      // Add filter parameters
      if (filters.nonStop) {
        url += '&nonStop=true';
      }

      if (filters.maxStops !== undefined && filters.maxStops !== null) {
        // maxStops filter: 0 = direct only, 1 = max 1 stop, 2 = max 2 stops
        if (filters.maxStops === 0) {
          url += '&nonStop=true';
        }
        // Note: Amadeus API doesn't have a native maxStops parameter,
        // so we'll filter results after fetching for maxStops > 0
      }

      devLog('🔍 Searching flights:', { origin, destination, departureDate, returnDate, filters, tripType: returnDate ? 'round-trip' : 'one-way', url });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
  }, [cache, tracker, tokenManager]);

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

      const token = await tokenManager.getAccessToken();
      const url = `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${origin}&max=50`;
      devLog('🌍 Searching destinations from:', origin);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
  }, [cache, tracker, tokenManager]);

  return {
    searchAirports,
    searchFlights,
    searchDestinations
  };
};
