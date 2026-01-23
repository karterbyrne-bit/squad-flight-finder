import { useAmadeusAPI } from './useAmadeusAPI';
import { useTravelpayoutsAPI } from './useTravelpayoutsAPI';

/**
 * Flight API Provider Hook
 *
 * Dynamically switches between Amadeus and Travelpayouts APIs based on
 * the VITE_FLIGHT_API_PROVIDER environment variable.
 *
 * Usage in App.jsx:
 * const { searchAirports, searchFlights, searchDestinations } = useFlightAPI();
 *
 * Configuration (.env):
 * VITE_FLIGHT_API_PROVIDER=amadeus     # Use Amadeus (default)
 * VITE_FLIGHT_API_PROVIDER=travelpayouts  # Use Travelpayouts
 */
export const useFlightAPI = () => {
  const provider = import.meta.env.VITE_FLIGHT_API_PROVIDER || 'amadeus';

  console.log(`🔌 Flight API Provider: ${provider}`);

  // Choose API based on environment variable
  if (provider === 'travelpayouts') {
    const api = useTravelpayoutsAPI();
    console.log('✅ Using Travelpayouts API (FREE - €0 costs, earn commission)');
    return {
      ...api,
      provider: 'travelpayouts',
      isFree: true,
    };
  }

  // Default to Amadeus
  const api = useAmadeusAPI();
  console.log('💰 Using Amadeus API (PAID - €1,400/month @ 5K sessions)');
  return {
    ...api,
    provider: 'amadeus',
    isFree: false,
  };
};
