/**
 * App.jsx - REFACTORED VERSION (< 500 lines)
 *
 * This is a template showing how to integrate all the extracted hooks and components.
 * The original 2,757-line App.jsx is refactored into this streamlined orchestration layer.
 *
 * To use this:
 * 1. Rename src/App.jsx to src/App.original.jsx (backup)
 * 2. Rename this file to src/App.jsx
 * 3. Create the remaining FlightResults components (see TODOs below)
 * 4. Test thoroughly
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plane, X, Settings } from 'lucide-react';
import './App.css';

// Custom Hooks
import { useTravelers } from './hooks/useTravelers';
import { useAmadeusAPI } from './hooks/useAmadeusAPI';
import { useFairness } from './hooks/useFairness';
import { useSettings } from './hooks/useSettings';

// Utils
import { apiRequestQueue } from './utils/rateLimiter';

// Shared Components
import { ConfirmModal, InputModal } from './components/shared/Modal';
import InstallPrompt from './components/InstallPrompt';
import SettingsPanel from './components/SettingsPanel';

// Feature Components
import { TripPlanner } from './components/TripPlanning/TripPlanner';
import { DestinationList } from './components/DestinationSelection/DestinationList';
import FlightResults from './components/FlightResults/FlightResults';

// Data
import { MAJOR_HUB_CITIES, destinationAirportMap, getDestinationTypes } from './data/constants';

// Analytics
import {
  trackSearchInitiated,
  trackResultsLoaded,
  trackSearchFailed,
  trackPopularOrigin,
  trackPopularDestination,
} from './utils/analytics';

export default function HolidayPlanner() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Navigation
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Trip Configuration
  const [tripType, setTripType] = useState([]); // Array for multi-select (empty = not selected, required)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [maxBudget, setMaxBudget] = useState(150);

  // Destination
  const [selectedDestination, setSelectedDestination] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [sortBy, setSortBy] = useState('avgPrice');

  // Flight Search
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightData, setFlightData] = useState({});

  // Filters
  const [directFlightsOnly, setDirectFlightsOnly] = useState(false);
  const [maxStops, setMaxStops] = useState(null);
  const [checkAllAirports, setCheckAllAirports] = useState(false);

  // Debug
  const [debugMode, setDebugMode] = useState(false);
  const [apiCallStats, setApiCallStats] = useState({ total: 0, cacheHits: 0, byEndpoint: {} });

  // Settings
  const [showSettings, setShowSettings] = useState(false);

  // ============================================================================
  // CUSTOM HOOKS
  // ============================================================================

  const {
    travelers,
    searchingAirports,
    showRemoveConfirm,
    setShowRemoveConfirm,
    showDuplicateModal,
    setShowDuplicateModal,
    duplicateName,
    setDuplicateName,
    addTraveler,
    removeTraveler,
    confirmRemoveTraveler,
    updateTraveler,
    handleOriginChange,
    duplicateTraveler,
    confirmDuplicateTraveler,
  } = useTravelers();

  const { searchAirports, searchFlights, searchDestinations } = useAmadeusAPI();

  const { calculateWeightedScore, calculateFairnessScore, getFairnessDetails } = useFairness(
    travelers,
    flightData,
    showResults,
    selectedDestination,
    customDestination
  );

  const { settings, toggleAddToHomeScreen, dismissInstallPrompt, shouldShowInstallPrompt } =
    useSettings();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Register service worker for PWA support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }
  }, []);

  // Listen for API call updates
  useEffect(() => {
    const handleApiCallUpdate = event => {
      setApiCallStats(event.detail);
    };

    window.addEventListener('apiCallUpdate', handleApiCallUpdate);
    return () => window.removeEventListener('apiCallUpdate', handleApiCallUpdate);
  }, []);

  // Debug mode keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const canProceed = useMemo(() => {
    const hasTripType = Array.isArray(tripType) ? tripType.length > 0 : (tripType && tripType !== 'all');
    return travelers.every(t => t.selectedAirport) && dateFrom && hasTripType;
  }, [travelers, dateFrom, tripType]);

  const destination = selectedDestination || customDestination;

  // Get fairness details for FlightResults component
  const fairnessDetails = getFairnessDetails;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getAirportsToCheck = traveler => {
    let airportsToCheck = traveler.airports || [];

    // Filter out excluded airports
    if (traveler.excludedAirports && traveler.excludedAirports.length > 0) {
      airportsToCheck = airportsToCheck.filter(
        airport => !traveler.excludedAirports.includes(airport.code)
      );
    }

    // If checkAllAirports is enabled, return all non-excluded airports
    if (checkAllAirports) {
      return airportsToCheck;
    }

    // Check if this is a major hub city (check all airports for these)
    const isMajorHub = MAJOR_HUB_CITIES.some(
      hubCity => traveler.origin && traveler.origin.toLowerCase().includes(hubCity.toLowerCase())
    );

    if (isMajorHub) {
      return airportsToCheck;
    }

    // For non-hub cities, limit to 2-3 closest airports
    return airportsToCheck.sort((a, b) => a.distance - b.distance).slice(0, 3);
  };

  const getFlightFilters = () => {
    const filters = {};

    if (directFlightsOnly) {
      filters.nonStop = true;
    } else if (maxStops !== null && maxStops !== undefined) {
      filters.maxStops = maxStops;
    }

    return filters;
  };

  // ============================================================================
  // DESTINATION SEARCH
  // ============================================================================

  const calculateDestinationPrices = async destinationCode => {
    const pricePromises = travelers.map(async traveler => {
      const airportsToCheck = getAirportsToCheck(traveler);
      if (airportsToCheck.length === 0) return null;

      const filters = getFlightFilters();

      const flightSearches = airportsToCheck.map(async airport => {
        const flights = await searchFlights(
          airport.code,
          destinationCode,
          dateFrom,
          1,
          dateTo,
          filters
        );
        if (flights.length === 0) return null;

        const cheapest = flights.reduce((min, flight) => {
          const price = parseFloat(flight.price.total);
          return price < parseFloat(min.price.total) ? flight : min;
        }, flights[0]);

        return {
          price: parseFloat(cheapest.price.total),
          weightedScore: calculateWeightedScore(parseFloat(cheapest.price.total), airport.distance),
        };
      });

      const results = await Promise.all(flightSearches);
      const validResults = results.filter(r => r !== null);

      if (validResults.length === 0) return null;

      const best = validResults.reduce((best, current) =>
        current.weightedScore < best.weightedScore ? current : best
      );

      return best;
    });

    const prices = await Promise.all(pricePromises);
    const validPrices = prices.filter(p => p !== null).map(p => p.price);

    if (validPrices.length === 0) return null;

    // Calculate fairness score (0-100, higher = more fair)
    const avg = validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length;
    const maxDiff = Math.max(...validPrices.map(p => Math.abs(p - avg)));
    const fairnessScore = Math.round(Math.max(0, 100 - (maxDiff / avg) * 100));

    return {
      avgPrice: Math.round(validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length),
      minPrice: Math.round(Math.min(...validPrices)),
      maxPrice: Math.round(Math.max(...validPrices)),
      deviation: Math.round(Math.max(...validPrices) - Math.min(...validPrices)),
      fairnessScore: fairnessScore,
    };
  };

  const goToDestinations = async () => {
    if (!canProceed) return;

    setStep(2);
    setLoadingDestinations(true);
    setError(null); // Clear any previous errors

    try {
      // Get a curated list of popular destinations from our constants
      const curatedDestinations = Object.entries(destinationAirportMap).map(([city, code]) => ({
        city,
        code,
        types: getDestinationTypes(city),
      }));

      // Try to fetch API-based destinations, but don't let it block us
      let apiDestinations = [];
      try {
        const allAirports = travelers.flatMap(traveler => getAirportsToCheck(traveler));
        const uniqueAirports = [...new Set(allAirports.map(a => a.code))];

        // Limit to first 3 airports to avoid too many API calls
        const airportsToCheck = uniqueAirports.slice(0, 3);
        console.log(
          `🌍 Fetching destinations from ${airportsToCheck.length} airports:`,
          airportsToCheck
        );

        const destinationPromises = airportsToCheck.map(airport =>
          searchDestinations(airport).catch(err => {
            console.warn(`Failed to fetch destinations for ${airport}:`, err);
            return [];
          })
        );

        const results = await Promise.all(destinationPromises);
        const allDestinations = results.flat();

        // Map API destinations to city names
        apiDestinations = allDestinations
          .map(dest => {
            const cityName = Object.entries(destinationAirportMap).find(
              ([, code]) => code === dest.destination
            )?.[0];

            if (!cityName) return null;

            return {
              city: cityName,
              code: dest.destination,
              types: getDestinationTypes(cityName),
            };
          })
          .filter(d => d !== null);

        console.log(`✅ Found ${apiDestinations.length} destinations from API`);
      } catch (err) {
        console.warn('API destination search failed, using curated list:', err);
      }

      // Merge API destinations with curated list, preferring API results
      const apiCodes = new Set(apiDestinations.map(d => d.code));
      let mergedDestinations = [
        ...apiDestinations,
        ...curatedDestinations.filter(d => !apiCodes.has(d.code)),
      ];

      // IMPORTANT: Filter by trip type BEFORE pricing to reduce API calls
      // Trip type is now required and can be multiple types
      const selectedTypes = Array.isArray(tripType) ? tripType : (tripType ? [tripType] : []);
      if (selectedTypes.length > 0 && !selectedTypes.includes('all')) {
        mergedDestinations = mergedDestinations.filter(d =>
          d.types && d.types.some(type => selectedTypes.includes(type))
        );
        console.log(`🎯 Filtered to ${mergedDestinations.length} destinations matching: ${selectedTypes.join(', ')}`);
      }

      // Limit to top 15 destinations after filtering to avoid too many price checks
      const destinationsToPrice = mergedDestinations.slice(0, 15);
      console.log(`💰 Calculating prices for ${destinationsToPrice.length} destinations...`);

      // Calculate prices for destinations using request queue for controlled concurrency
      const destinationsWithPrices = [];
      let processed = 0;

      // Use Promise.allSettled with request queue to process in parallel but controlled
      const pricingPromises = destinationsToPrice.map(dest =>
        apiRequestQueue.add(async () => {
          try {
            const priceMetrics = await calculateDestinationPrices(dest.code);
            processed++;

            if (priceMetrics) {
              console.log(
                `✓ ${processed}/${destinationsToPrice.length}: ${dest.city} - £${priceMetrics.avgPrice}`
              );
              return {
                ...dest,
                ...priceMetrics,
              };
            } else {
              console.log(
                `✗ ${processed}/${destinationsToPrice.length}: ${dest.city} - no flights found`
              );
              return null;
            }
          } catch (err) {
            processed++;
            console.warn(`Failed to price ${dest.city}:`, err);
            return null;
          }
        })
      );

      const pricingResults = await Promise.allSettled(pricingPromises);

      pricingResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          destinationsWithPrices.push(result.value);
        }
      });

      console.log(`📊 Completed: ${destinationsWithPrices.length} destinations with prices`);

      if (destinationsWithPrices.length === 0) {
        // Fallback: show curated list without prices
        console.warn('No destinations with prices found, showing curated list');
        setError(
          'Unable to fetch destination prices. Please try entering a custom destination below.'
        );
        setAvailableDestinations([]);
      } else {
        setAvailableDestinations(destinationsWithPrices);
      }
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
      setError('Unable to load destinations. Please try entering a custom destination below.');
      setAvailableDestinations([]);
    } finally {
      setLoadingDestinations(false);
    }
  };

  // ============================================================================
  // FLIGHT SEARCH
  // ============================================================================

  const searchFlightsForDestination = async destinationCity => {
    console.log('🛫 searchFlightsForDestination called:', destinationCity);
    setLoading(true);
    setError(null);

    try {
      // Get destination airport code
      let destinationCode = destinationAirportMap[destinationCity];

      if (!destinationCode) {
        const destAirports = await searchAirports(destinationCity);
        const airportOnly = destAirports.filter(a => a.subType === 'AIRPORT');
        if (airportOnly.length === 0) {
          throw new Error(`No airports found for ${destinationCity}`);
        }
        destinationCode = airportOnly[0].iataCode;
      }

      const filters = getFlightFilters();

      // Search flights for each traveler
      const flightPromises = travelers.map(async traveler => {
        const airportsToCheck = getAirportsToCheck(traveler);
        if (airportsToCheck.length === 0) return null;

        const allFlightSearches = airportsToCheck.map(async airport => {
          const flights = await searchFlights(
            airport.code,
            destinationCode,
            dateFrom,
            1,
            dateTo,
            filters
          );

          return flights.map(flight => ({
            ...flight,
            departureAirport: airport,
            weightedScore: calculateWeightedScore(parseFloat(flight.price.total), airport.distance),
          }));
        });

        const allResults = await Promise.all(allFlightSearches);
        let allFlights = allResults.flat().filter(f => f);

        // Fallback for connecting flights if no direct flights found
        if (allFlights.length === 0 && filters.nonStop) {
          const fallbackFilters = { ...filters, nonStop: false };
          const fallbackSearches = airportsToCheck.map(async airport => {
            const flights = await searchFlights(
              airport.code,
              destinationCode,
              dateFrom,
              1,
              dateTo,
              fallbackFilters
            );
            return flights.map(flight => ({
              ...flight,
              departureAirport: airport,
              weightedScore: calculateWeightedScore(
                parseFloat(flight.price.total),
                airport.distance
              ),
            }));
          });

          const fallbackResults = await Promise.all(fallbackSearches);
          allFlights = fallbackResults.flat().filter(f => f);
        }

        if (allFlights.length === 0) return null;

        const sortedFlights = allFlights.sort((a, b) => a.weightedScore - b.weightedScore);

        return {
          travelerId: traveler.id,
          flights: sortedFlights.slice(0, 5),
          cheapest: sortedFlights[0],
        };
      });

      const results = await Promise.all(flightPromises);
      const flightMap = {};
      let foundFlights = 0;

      results.forEach(result => {
        if (result) {
          flightMap[result.travelerId] = result;
          foundFlights++;
        }
      });

      if (foundFlights === 0) {
        setError(
          'No flights found for the selected date and destination. Try adjusting your dates or filters.'
        );
        trackSearchFailed('no_results', {
          destination: destinationCity,
          travelers: travelers.length,
          date: dateFrom,
        });
      } else {
        trackResultsLoaded(destinationCity, calculateFairnessScore, foundFlights);
      }

      console.log('✅ Flight search complete:', { foundFlights, totalTravelers: travelers.length });
      setFlightData(flightMap);
      setShowResults(true);
      console.log('📊 State updated: showResults = true, step =', step);
    } catch (err) {
      console.error('Flight search error:', err);
      setError(err.message || 'An error occurred while searching for flights. Please try again.');
      trackSearchFailed('api_error', {
        destination: destinationCity,
        error: err.message,
        travelers: travelers.length,
      });
      // Still show results page even on error so user can navigate back properly
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = () => {
    console.log('🔍 Search initiated:', {
      destination,
      travelers: travelers.length,
      step,
      showResults,
    });

    if (!destination) {
      console.error('❌ No destination selected');
      setError('Please select a destination before searching');
      return;
    }

    if (destination) {
      const uniqueCities = new Set(travelers.map(t => t.origin).filter(Boolean));
      trackSearchInitiated(travelers.length, uniqueCities.size);

      travelers.forEach(t => {
        if (t.origin) trackPopularOrigin(t.origin);
      });
      trackPopularDestination(destination);

      console.log('✈️ Starting flight search for:', destination);
      searchFlightsForDestination(destination);
    }
  };

  // Get sorted destinations
  const destinationsToShow = useMemo(() => {
    if (availableDestinations.length === 0) return [];

    // Destinations are already filtered by tripType in goToDestinations
    // So we just need to apply sorting here
    let sorted = [...availableDestinations];

    if (sortBy === 'avgPrice') {
      sorted.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sortBy === 'deviation') {
      sorted.sort((a, b) => a.deviation - b.deviation);
    } else if (sortBy === 'minPrice') {
      sorted.sort((a, b) => a.minPrice - b.minPrice);
    }

    return sorted;
  }, [availableDestinations, sortBy]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8 relative">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center justify-center gap-3 mb-2">
            <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-float" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Squad Flight Finder
            </h1>
          </div>
          <p className="text-white/90 text-xs sm:text-sm">
            Compare prices with Fairness for your squad
          </p>
          {debugMode && (
            <div className="mt-3 inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
              🔧 Debug Mode Active (Ctrl+Shift+D to toggle)
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <X className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Trip Planning */}
        {step === 1 && (
          <TripPlanner
            maxBudget={maxBudget}
            onBudgetChange={setMaxBudget}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            directFlightsOnly={directFlightsOnly}
            onDirectFlightsChange={setDirectFlightsOnly}
            maxStops={maxStops}
            onMaxStopsChange={setMaxStops}
            checkAllAirports={checkAllAirports}
            onCheckAllAirportsChange={setCheckAllAirports}
            travelers={travelers}
            onAddTraveler={addTraveler}
            onUpdateTraveler={updateTraveler}
            onRemoveTraveler={removeTraveler}
            onDuplicateTraveler={duplicateTraveler}
            onOriginChange={handleOriginChange}
            searchingAirports={searchingAirports}
            tripType={tripType}
            onTripTypeChange={setTripType}
            onProceed={goToDestinations}
            canProceed={canProceed}
            debugMode={debugMode}
            apiCallStats={apiCallStats}
          />
        )}

        {/* Step 2: Destination Selection */}
        {step === 2 && !showResults && (
          <>
            {console.log('🗺️ Rendering DestinationList', { step, showResults })}
            <DestinationList
              destinations={destinationsToShow}
              loading={loadingDestinations}
              dateTo={dateTo}
              selectedDestination={selectedDestination}
              onSelectDestination={setSelectedDestination}
              customDestination={customDestination}
              onCustomDestinationChange={setCustomDestination}
              sortBy={sortBy}
              onSortChange={setSortBy}
              tripType={tripType}
              onTripTypeChange={setTripType}
              onSearchFlights={searchTrips}
              onBack={() => {
                setStep(1);
                setShowResults(false);
                setFlightData({});
              }}
              isSearching={loading}
            />
          </>
        )}

        {/* Step 2: Flight Results */}
        {step === 2 && showResults && (
          <>
            {console.log('🎨 Rendering FlightResults component', {
              step,
              showResults,
              destination,
            })}
            <FlightResults
              flightData={flightData}
              travelers={travelers}
              destination={destination}
              dateFrom={dateFrom}
              dateTo={dateTo}
              fairnessDetails={fairnessDetails}
              onBack={() => {
                setStep(1);
                setShowResults(false);
              }}
            />
          </>
        )}

        {/* Modals */}
        <ConfirmModal
          isOpen={showRemoveConfirm !== null}
          onClose={() => setShowRemoveConfirm(null)}
          onConfirm={() => confirmRemoveTraveler(showRemoveConfirm)}
          title="Remove Traveler?"
          message="Are you sure you want to remove this traveler? All their travel information will be lost."
          confirmText="Remove"
        />

        <InputModal
          isOpen={showDuplicateModal !== null}
          onClose={() => {
            setShowDuplicateModal(null);
            setDuplicateName('');
          }}
          onConfirm={confirmDuplicateTraveler}
          title="Duplicate Traveler"
          message={`This will copy all details from ${showDuplicateModal?.name || 'this traveler'}. Enter a name for the new traveler:`}
          placeholder="Name (optional)"
          value={duplicateName}
          onChange={setDuplicateName}
          confirmText="Duplicate"
        />

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onToggleAddToHomeScreen={toggleAddToHomeScreen}
        />

        {/* Install Prompt */}
        <InstallPrompt enabled={shouldShowInstallPrompt()} onDismiss={dismissInstallPrompt} />
      </div>
    </div>
  );
}
