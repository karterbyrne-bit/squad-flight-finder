import { useState, useCallback, useRef, useEffect } from 'react';
import { useAmadeusAPI } from './useAmadeusAPI';
import { devLog, devError } from './useCache';
import { validateTravelerName, validateCityName } from '../utils/validation';
import { trackTravelerModified } from '../utils/analytics';

// Map cities to nearby airports with distances (in miles)
const cityToAirportsMap = {
  'Leicester': [
    { code: 'EMA', name: 'East Midlands', distance: 20 },
    { code: 'BHX', name: 'Birmingham', distance: 35 },
    { code: 'LHR', name: 'London Heathrow', distance: 100 },
    { code: 'LGW', name: 'London Gatwick', distance: 110 },
    { code: 'MAN', name: 'Manchester', distance: 75 }
  ],
  'London': [
    { code: 'LHR', name: 'Heathrow', distance: 15 },
    { code: 'LGW', name: 'Gatwick', distance: 28 },
    { code: 'STN', name: 'Stansted', distance: 35 },
    { code: 'LTN', name: 'Luton', distance: 30 },
    { code: 'LCY', name: 'City', distance: 6 }
  ],
  'Manchester': [
    { code: 'MAN', name: 'Manchester', distance: 10 },
    { code: 'LPL', name: 'Liverpool', distance: 35 },
    { code: 'LBA', name: 'Leeds Bradford', distance: 45 }
  ],
  'Birmingham': [
    { code: 'BHX', name: 'Birmingham', distance: 8 },
    { code: 'EMA', name: 'East Midlands', distance: 40 },
    { code: 'BRS', name: 'Bristol', distance: 85 }
  ],
  'Leeds': [
    { code: 'LBA', name: 'Leeds Bradford', distance: 8 },
    { code: 'MAN', name: 'Manchester', distance: 45 },
    { code: 'EMA', name: 'East Midlands', distance: 75 }
  ],
  'Liverpool': [
    { code: 'LPL', name: 'Liverpool', distance: 8 },
    { code: 'MAN', name: 'Manchester', distance: 35 }
  ],
  'Bristol': [
    { code: 'BRS', name: 'Bristol', distance: 8 },
    { code: 'CWL', name: 'Cardiff', distance: 45 },
    { code: 'BHX', name: 'Birmingham', distance: 85 }
  ],
  'Newcastle': [
    { code: 'NCL', name: 'Newcastle', distance: 8 },
    { code: 'EDI', name: 'Edinburgh', distance: 105 }
  ],
  'Glasgow': [
    { code: 'GLA', name: 'Glasgow', distance: 8 },
    { code: 'PIK', name: 'Prestwick', distance: 30 },
    { code: 'EDI', name: 'Edinburgh', distance: 45 }
  ],
  'Edinburgh': [
    { code: 'EDI', name: 'Edinburgh', distance: 8 },
    { code: 'GLA', name: 'Glasgow', distance: 45 }
  ],
  'Belfast': [
    { code: 'BFS', name: 'Belfast International', distance: 13 },
    { code: 'BHD', name: 'Belfast City', distance: 3 }
  ],
  'Cardiff': [
    { code: 'CWL', name: 'Cardiff', distance: 12 },
    { code: 'BRS', name: 'Bristol', distance: 45 }
  ],
  'Nottingham': [
    { code: 'EMA', name: 'East Midlands', distance: 14 },
    { code: 'BHX', name: 'Birmingham', distance: 50 },
    { code: 'MAN', name: 'Manchester', distance: 70 }
  ],
  'Sheffield': [
    { code: 'LBA', name: 'Leeds Bradford', distance: 35 },
    { code: 'EMA', name: 'East Midlands', distance: 40 },
    { code: 'MAN', name: 'Manchester', distance: 38 }
  ],
  'Oxford': [
    { code: 'LHR', name: 'Heathrow', distance: 40 },
    { code: 'LGW', name: 'Gatwick', distance: 80 },
    { code: 'BHX', name: 'Birmingham', distance: 60 }
  ],
  'Cambridge': [
    { code: 'STN', name: 'Stansted', distance: 28 },
    { code: 'LTN', name: 'Luton', distance: 40 },
    { code: 'LHR', name: 'Heathrow', distance: 60 }
  ],
  'Brighton': [
    { code: 'LGW', name: 'Gatwick', distance: 25 },
    { code: 'LHR', name: 'Heathrow', distance: 55 }
  ],
  'Southampton': [
    { code: 'SOU', name: 'Southampton', distance: 5 },
    { code: 'LHR', name: 'Heathrow', distance: 65 },
    { code: 'LGW', name: 'Gatwick', distance: 70 }
  ]
};

/**
 * Custom hook for traveler management
 * Handles traveler state, airport search, and traveler CRUD operations
 */
export const useTravelers = () => {
  const [travelers, setTravelers] = useState([
    { id: 1, name: '', origin: '', luggage: 'hand', airports: [], selectedAirport: '', excludedAirports: [] }
  ]);
  const [searchingAirports, setSearchingAirports] = useState({});
  const [airportSearchLog, setAirportSearchLog] = useState([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(null);
  const [duplicateName, setDuplicateName] = useState('');

  const { searchAirports: apiSearchAirports } = useAmadeusAPI();
  const searchTimeoutRef = useRef({});

  // Cleanup all pending timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(searchTimeoutRef.current).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, []);

  /**
   * Search for airports for a specific traveler
   */
  const searchAirportsForCity = useCallback(async (travelerId, cityName) => {
    devLog('🔍 searchAirportsForCity called:', { travelerId, cityName });

    const logEntry = { travelerId, cityName, timestamp: new Date().toISOString() };

    if (!cityName || cityName.length < 3) {
      devLog('⚠️ cityName too short or empty:', cityName);
      logEntry.result = 'City name too short';
      setAirportSearchLog(prev => [...prev, logEntry]);
      return;
    }

    const sanitizedCity = validateCityName(cityName);
    setSearchingAirports(prev => ({ ...prev, [travelerId]: true }));

    try {
      // Check if we have predefined airports for this city (trim spaces and lowercase)
      const cityKey = Object.keys(cityToAirportsMap).find(
        key => key.toLowerCase() === sanitizedCity.toLowerCase().trim()
      );

      devLog('🗺️ Looking for city:', sanitizedCity.toLowerCase().trim(), 'Found match:', cityKey);

      if (cityKey) {
        // Use predefined airport list with distances
        const airports = cityToAirportsMap[cityKey];
        devLog('✅ Using predefined airports for', cityKey, ':', airports);
        logEntry.result = `Found in predefined list: ${airports.length} airports`;
        logEntry.airports = airports.map(a => a.code).join(', ');
        updateTraveler(travelerId, 'airports', airports);
        updateTraveler(travelerId, 'selectedAirport', airports[0].code);
      } else {
        // Fall back to API search - ONLY get AIRPORT codes, not city codes
        devLog('🌐 Falling back to API search for:', sanitizedCity);
        const airports = await apiSearchAirports(sanitizedCity);
        devLog('📡 API returned:', airports);
        const formatted = airports
          .filter(airport => airport.subType === 'AIRPORT') // Only airports!
          .slice(0, 5)
          .map(airport => ({
            code: airport.iataCode,
            name: airport.name,
            distance: 15, // Default distance if unknown
          }));

        devLog('✈️ Formatted airports:', formatted);

        if (formatted.length > 0) {
          logEntry.result = `API search: ${formatted.length} airports`;
          logEntry.airports = formatted.map(a => a.code).join(', ');
          updateTraveler(travelerId, 'airports', formatted);
          updateTraveler(travelerId, 'selectedAirport', formatted[0].code);
        } else {
          devLog('❌ No airports found after filtering');
          logEntry.result = 'API search found 0 airports';
        }
      }
    } catch (err) {
      devError('❌ Airport search failed:', err);
      logEntry.result = `Error: ${err.message}`;
    } finally {
      setSearchingAirports(prev => ({ ...prev, [travelerId]: false }));
      setAirportSearchLog(prev => [...prev, logEntry]);
    }
  }, [apiSearchAirports]);

  /**
   * Debounced airport search
   */
  const debouncedAirportSearch = useCallback((travelerId, cityName) => {
    if (searchTimeoutRef.current[travelerId]) {
      clearTimeout(searchTimeoutRef.current[travelerId]);
    }

    searchTimeoutRef.current[travelerId] = setTimeout(() => {
      searchAirportsForCity(travelerId, cityName);
    }, 800);
  }, [searchAirportsForCity]);

  /**
   * Add a new traveler
   */
  const addTraveler = useCallback(() => {
    const newTravelers = [...travelers, {
      id: Date.now(),
      name: '',
      origin: '',
      luggage: 'hand',
      airports: [],
      selectedAirport: '',
      excludedAirports: []
    }];
    setTravelers(newTravelers);
    trackTravelerModified('added', newTravelers.length);
  }, [travelers]);

  /**
   * Remove a traveler
   */
  const removeTraveler = useCallback((id) => {
    if (travelers.length > 1) {
      setShowRemoveConfirm(id);
    }
  }, [travelers.length]);

  /**
   * Confirm removal of a traveler
   */
  const confirmRemoveTraveler = useCallback((id) => {
    const newTravelers = travelers.filter(t => t.id !== id);
    setTravelers(newTravelers);
    setShowRemoveConfirm(null);
    trackTravelerModified('removed', newTravelers.length);
  }, [travelers]);

  /**
   * Update a traveler field
   */
  const updateTraveler = useCallback((id, field, value) => {
    // Apply validation for specific fields
    let sanitizedValue = value;
    if (field === 'name') {
      sanitizedValue = validateTravelerName(value);
    } else if (field === 'origin') {
      sanitizedValue = validateCityName(value);
    }

    setTravelers(prevTravelers =>
      prevTravelers.map(t => t.id === id ? { ...t, [field]: sanitizedValue } : t)
    );
  }, []);

  /**
   * Handle origin change with airport search
   */
  const handleOriginChange = useCallback((id, value) => {
    updateTraveler(id, 'origin', value);
    if (value.length >= 3) {
      debouncedAirportSearch(id, value);
    }
  }, [updateTraveler, debouncedAirportSearch]);

  /**
   * Duplicate a traveler
   */
  const duplicateTraveler = useCallback((travelerToDuplicate) => {
    setDuplicateName(travelerToDuplicate.name ? `${travelerToDuplicate.name} (copy)` : '');
    setShowDuplicateModal(travelerToDuplicate);
  }, []);

  /**
   * Confirm duplication of a traveler
   */
  const confirmDuplicateTraveler = useCallback(() => {
    if (showDuplicateModal) {
      const newTraveler = {
        ...showDuplicateModal,
        id: Date.now(),
        name: duplicateName
      };
      setTravelers([...travelers, newTraveler]);
      setShowDuplicateModal(null);
      setDuplicateName('');
    }
  }, [showDuplicateModal, duplicateName, travelers]);

  return {
    travelers,
    setTravelers,
    searchingAirports,
    airportSearchLog,
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
    searchAirportsForCity
  };
};

// Export cityToAirportsMap for use in other modules
export { cityToAirportsMap };
