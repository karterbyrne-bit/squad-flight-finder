/**
 * Google Analytics Event Tracking Utility
 *
 * This module provides helper functions for tracking custom events in Google Analytics.
 * Events are sent using the gtag() function that was initialized in index.html.
 */

/**
 * Track a custom event in Google Analytics
 * @param {string} eventName - The name of the event (e.g., 'search_flights', 'select_flight')
 * @param {Object} eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track flight search events
 * @param {Object} searchParams - Search parameters used
 */
export const trackFlightSearch = (searchParams) => {
  trackEvent('search_flights', {
    origin: searchParams.origin,
    destination: searchParams.destination,
    num_travelers: searchParams.travelers?.length || 0,
    search_type: searchParams.searchType || 'standard',
  });
};

/**
 * Track when a user selects a flight
 * @param {Object} flightData - Selected flight information
 */
export const trackFlightSelection = (flightData) => {
  trackEvent('select_flight', {
    airline: flightData.airline,
    price: flightData.price,
    flight_number: flightData.flightNumber,
  });
};

/**
 * Track when a user adds a traveler
 * @param {number} totalTravelers - Total number of travelers after adding
 */
export const trackAddTraveler = (totalTravelers) => {
  trackEvent('add_traveler', {
    total_travelers: totalTravelers,
  });
};

/**
 * Track when a user removes a traveler
 * @param {number} totalTravelers - Total number of travelers after removing
 */
export const trackRemoveTraveler = (totalTravelers) => {
  trackEvent('remove_traveler', {
    total_travelers: totalTravelers,
  });
};

/**
 * Track when results are shared
 * @param {string} shareMethod - Method used to share (e.g., 'link', 'clipboard')
 */
export const trackShare = (shareMethod) => {
  trackEvent('share_results', {
    method: shareMethod,
  });
};

/**
 * Track when a user applies filters
 * @param {Object} filterData - Filter settings
 */
export const trackFilterApplied = (filterData) => {
  trackEvent('apply_filters', {
    filter_type: filterData.type,
    filter_value: filterData.value,
  });
};

/**
 * Track API errors
 * @param {string} endpoint - API endpoint that failed
 * @param {string} errorMessage - Error message
 */
export const trackAPIError = (endpoint, errorMessage) => {
  trackEvent('api_error', {
    endpoint: endpoint,
    error_message: errorMessage,
  });
};

/**
 * Track page views (useful for SPA navigation)
 * @param {string} pagePath - Page path or view name
 */
export const trackPageView = (pagePath) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-3L99Y7WVRJ', {
      page_path: pagePath,
    });
  }
};

/**
 * Track user engagement time
 * @param {number} timeInSeconds - Time spent on activity
 * @param {string} activity - Activity name
 */
export const trackEngagement = (timeInSeconds, activity) => {
  trackEvent('user_engagement', {
    engagement_time: timeInSeconds,
    activity: activity,
  });
};
