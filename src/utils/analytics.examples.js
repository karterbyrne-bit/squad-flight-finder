/**
 * Google Analytics Event Tracking - Usage Examples
 *
 * This file demonstrates how to use the analytics utility throughout your application.
 * Import the functions you need and call them at the appropriate places in your code.
 */

import {
  trackEvent,
  trackFlightSearch,
  trackFlightSelection,
  trackAddTraveler,
  trackRemoveTraveler,
  trackShare,
  trackFilterApplied,
  trackAPIError,
  trackPageView,
  trackEngagement,
} from './analytics';

// ============================================================================
// EXAMPLE 1: Track Flight Searches
// ============================================================================
// Call this when a user submits a flight search
const handleFlightSearch = (formData) => {
  // Your existing search logic...
  const searchParams = {
    origin: formData.origin,
    destination: formData.destination,
    travelers: formData.travelers,
    searchType: 'multi-person',
  };

  // Track the search event
  trackFlightSearch(searchParams);

  // Continue with your API call...
};

// ============================================================================
// EXAMPLE 2: Track Flight Selection
// ============================================================================
// Call this when a user clicks on a specific flight option
const handleFlightClick = (flight) => {
  trackFlightSelection({
    airline: flight.airline,
    price: flight.price,
    flightNumber: flight.flightNumber || 'unknown',
  });

  // Your existing logic for handling flight selection...
};

// ============================================================================
// EXAMPLE 3: Track Add/Remove Traveler
// ============================================================================
const handleAddTraveler = (travelers) => {
  // Your existing logic to add traveler...
  const newTravelers = [...travelers, { name: '' }];

  // Track the event
  trackAddTraveler(newTravelers.length);

  return newTravelers;
};

const handleRemoveTraveler = (travelers, index) => {
  // Your existing logic to remove traveler...
  const newTravelers = travelers.filter((_, i) => i !== index);

  // Track the event
  trackRemoveTraveler(newTravelers.length);

  return newTravelers;
};

// ============================================================================
// EXAMPLE 4: Track Share Actions
// ============================================================================
const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    trackShare('clipboard');
    // Show success message...
  } catch (error) {
    console.error('Failed to copy link', error);
  }
};

const handleShareButton = () => {
  // Generate shareable link...
  trackShare('link');
  // Your sharing logic...
};

// ============================================================================
// EXAMPLE 5: Track Filter Applications
// ============================================================================
const handlePriceFilterChange = (maxPrice) => {
  trackFilterApplied({
    type: 'price',
    value: maxPrice,
  });

  // Apply filter logic...
};

const handleAirlineFilter = (airline) => {
  trackFilterApplied({
    type: 'airline',
    value: airline,
  });

  // Apply filter logic...
};

// ============================================================================
// EXAMPLE 6: Track API Errors
// ============================================================================
const fetchFlightData = async (searchParams) => {
  try {
    const response = await fetch('/api/flights', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Track the error
    trackAPIError('/api/flights', error.message);

    // Handle error in your UI...
    throw error;
  }
};

// ============================================================================
// EXAMPLE 7: Track Custom Events
// ============================================================================
const handleCurrencyChange = (newCurrency) => {
  trackEvent('currency_change', {
    currency: newCurrency,
  });

  // Your currency change logic...
};

const handleSortChange = (sortBy) => {
  trackEvent('sort_results', {
    sort_by: sortBy,
  });

  // Your sort logic...
};

// ============================================================================
// EXAMPLE 8: Track Engagement Time (using React useEffect)
// ============================================================================
// import { useEffect } from 'react';
//
// const FlightResultsComponent = () => {
//   useEffect(() => {
//     const startTime = Date.now();
//
//     return () => {
//       const endTime = Date.now();
//       const timeSpent = Math.floor((endTime - startTime) / 1000);
//
//       if (timeSpent > 5) { // Only track if user spent more than 5 seconds
//         trackEngagement(timeSpent, 'viewing_results');
//       }
//     };
//   }, []);
//
//   return <div>Your flight results...</div>;
// };

// ============================================================================
// EXAMPLE 9: Common Events to Track in Your Flight Finder
// ============================================================================

// Track when user expands flight details
const trackFlightDetailsView = (flightId) => {
  trackEvent('view_flight_details', {
    flight_id: flightId,
  });
};

// Track when user compares flights
const trackFlightComparison = (numberOfFlights) => {
  trackEvent('compare_flights', {
    flight_count: numberOfFlights,
  });
};

// Track when no results are found
const trackNoResults = (searchParams) => {
  trackEvent('no_results_found', {
    origin: searchParams.origin,
    destination: searchParams.destination,
  });
};

// Track when user exports/downloads results
const trackExport = (format) => {
  trackEvent('export_results', {
    format: format, // e.g., 'pdf', 'csv', 'image'
  });
};

export {
  handleFlightSearch,
  handleFlightClick,
  handleAddTraveler,
  handleRemoveTraveler,
  handleCopyLink,
  handleShareButton,
  handlePriceFilterChange,
  handleAirlineFilter,
  fetchFlightData,
  handleCurrencyChange,
  handleSortChange,
  trackFlightDetailsView,
  trackFlightComparison,
  trackNoResults,
  trackExport,
};
