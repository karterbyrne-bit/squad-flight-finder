/**
 * Google Analytics Event Tracking - Squad Flight Finder
 *
 * 12 Core Events tracking the complete user journey from search to affiliate click.
 * All events use the gtag() function initialized in index.html.
 */

/**
 * Base event tracking function
 * @param {string} eventName - The name of the event
 * @param {Object} eventParams - Additional parameters for the event
 */
const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// ============================================================================
// 1. SEARCH_INITIATED - User clicks "Find Flights"
// ============================================================================
/**
 * Track when user initiates a flight search
 * @param {number} numTravelers - Number of travelers in search
 * @param {number} numCities - Number of origin cities
 */
export const trackSearchInitiated = (numTravelers, numCities) => {
  trackEvent('search_initiated', {
    num_travelers: numTravelers,
    num_cities: numCities,
  });
};

// ============================================================================
// 2. RESULTS_LOADED - Flight results successfully displayed
// ============================================================================
/**
 * Track when results are successfully loaded and displayed
 * @param {string} destination - Destination city/airport
 * @param {number} fairnessScore - Calculated fairness score (0-100)
 * @param {number} numFlightOptions - Number of flight options shown
 */
export const trackResultsLoaded = (destination, fairnessScore, numFlightOptions) => {
  trackEvent('results_loaded', {
    destination: destination,
    fairness_score: fairnessScore,
    num_flight_options: numFlightOptions,
  });
};

// ============================================================================
// 3. AFFILIATE_CLICK - User clicks through to Skyscanner (MONEY EVENT)
// ============================================================================
/**
 * Track affiliate link clicks - YOUR KEY CONVERSION EVENT
 * @param {string} travelerCity - Which traveler's city the flight is from
 * @param {number} price - Flight price
 * @param {number} fairnessScore - Fairness score of this solution
 * @param {string} destination - Destination city
 */
export const trackAffiliateClick = (travelerCity, price, fairnessScore, destination) => {
  trackEvent('affiliate_click', {
    traveler_city: travelerCity,
    price: price,
    fairness_score: fairnessScore,
    destination: destination,
  });
};

// ============================================================================
// 4. SEARCH_FAILED - No results or API error
// ============================================================================
/**
 * Track when a search fails
 * @param {string} errorType - Type of error ('no_results', 'api_error', 'timeout', etc.)
 * @param {Object} searchParams - Search parameters that failed
 */
export const trackSearchFailed = (errorType, searchParams = {}) => {
  trackEvent('search_failed', {
    error_type: errorType,
    search_params: JSON.stringify(searchParams),
  });
};

// ============================================================================
// 5. SURVEY_SUBMITTED - Post-results feedback form completed
// ============================================================================
/**
 * Track user feedback survey submissions
 * @param {boolean} wouldUseAgain - Would use the tool again
 * @param {boolean} foundUseful - Found the results useful
 */
export const trackSurveySubmitted = (wouldUseAgain, foundUseful) => {
  trackEvent('survey_submitted', {
    would_use_again: wouldUseAgain,
    found_useful: foundUseful,
  });
};

// ============================================================================
// 6. EMAIL_COLLECTED - User signs up for launch list
// ============================================================================
/**
 * Track email collection for launch/newsletter
 * @param {string} source - Where email was collected ('homepage', 'results_page', 'footer', etc.)
 */
export const trackEmailCollected = (source) => {
  trackEvent('email_collected', {
    collection_source: source,
  });
};

// ============================================================================
// 7. DESTINATION_COMPARED - Multiple destination searches in one session
// ============================================================================
/**
 * Track when users compare multiple destinations
 * @param {number} numDestinations - Number of unique destinations searched in session
 */
export const trackDestinationCompared = (numDestinations) => {
  trackEvent('destination_compared', {
    num_destinations_checked: numDestinations,
  });
};

// ============================================================================
// 8. TRAVELER_MODIFIED - User adds/removes travelers mid-flow
// ============================================================================
/**
 * Track when users modify traveler list
 * @param {string} action - 'added' or 'removed'
 * @param {number} newTravelerCount - Total travelers after modification
 */
export const trackTravelerModified = (action, newTravelerCount) => {
  trackEvent('traveler_modified', {
    action: action,
    new_traveler_count: newTravelerCount,
  });
};

// ============================================================================
// 9. CITY_AUTOCOMPLETE_FAILED - City input didn't match mapping
// ============================================================================
/**
 * Track when city autocomplete/validation fails
 * @param {string} cityInput - What the user typed that didn't match
 */
export const trackCityAutocompleteFailed = (cityInput) => {
  trackEvent('city_autocomplete_failed', {
    city_input: cityInput,
  });
};

// ============================================================================
// 10. RESULTS_ABANDONED - Saw results but left without clicking Skyscanner
// ============================================================================
/**
 * Track when users view results but don't click through to Skyscanner
 * @param {number} timeOnResults - Seconds spent viewing results
 * @param {number} fairnessScore - Fairness score of shown results
 */
export const trackResultsAbandoned = (timeOnResults, fairnessScore) => {
  trackEvent('results_abandoned', {
    time_on_results_seconds: timeOnResults,
    fairness_score: fairnessScore,
  });
};

// ============================================================================
// 11. POPULAR_ORIGIN - Track which cities people search FROM
// ============================================================================
/**
 * Track origin cities to understand where users are traveling from
 * @param {string} originCity - Origin city name
 */
export const trackPopularOrigin = (originCity) => {
  trackEvent('popular_origin', {
    origin_city: originCity,
  });
};

// ============================================================================
// 12. POPULAR_DESTINATION - Track which cities people choose TO GO
// ============================================================================
/**
 * Track destination cities to understand where users want to travel
 * @param {string} destinationCity - Destination city name
 */
export const trackPopularDestination = (destinationCity) => {
  trackEvent('popular_destination', {
    destination_city: destinationCity,
  });
};
