/**
 * Google Analytics - Squad Flight Finder Implementation Examples
 *
 * This file shows exactly how and where to implement the 12 core events
 * in your Squad Flight Finder application.
 */

import {
  trackSearchInitiated,
  trackResultsLoaded,
  trackAffiliateClick,
  trackSearchFailed,
  trackSurveySubmitted,
  trackEmailCollected,
  trackDestinationCompared,
  trackTravelerModified,
  trackCityAutocompleteFailed,
  trackResultsAbandoned,
  trackPopularOrigin,
  trackPopularDestination,
} from './analytics';

// ============================================================================
// EVENT 1: SEARCH_INITIATED
// Trigger: User clicks "Find Flights" button
// ============================================================================
const handleSearchSubmit = (travelers, destination) => {
  // Extract unique origin cities from travelers
  const uniqueCities = new Set(travelers.map(t => t.city));

  // Track the search
  trackSearchInitiated(travelers.length, uniqueCities.size);

  // Track each origin city for popular_origin analytics
  travelers.forEach(traveler => {
    trackPopularOrigin(traveler.city);
  });

  // Track destination for popular_destination analytics
  trackPopularDestination(destination);

  // Your existing search logic...
  performFlightSearch(travelers, destination);
};

// ============================================================================
// EVENT 2: RESULTS_LOADED
// Trigger: API successfully returns flight results and they're displayed
// ============================================================================
const handleResultsSuccess = (results, destination) => {
  // Calculate fairness score (your existing logic)
  const fairnessScore = calculateFairnessScore(results);

  // Count flight options
  const numOptions = results.flights?.length || 0;

  // Track successful results load
  trackResultsLoaded(destination, fairnessScore, numOptions);

  // Display results to user...
  setFlightResults(results);

  // Start tracking for potential abandonment
  startAbandonmentTimer(fairnessScore);
};

// ============================================================================
// EVENT 3: AFFILIATE_CLICK (MONEY EVENT!)
// Trigger: User clicks Skyscanner link on any flight option
// ============================================================================
const handleSkyscannerClick = (flight, travelerCity, destination, fairnessScore) => {
  // Track the affiliate click - YOUR KEY CONVERSION
  trackAffiliateClick(
    travelerCity,
    flight.price,
    fairnessScore,
    destination
  );

  // Open Skyscanner in new tab
  window.open(flight.skyscannerUrl, '_blank');
};

// Example in a FlightCard component:
const FlightCard = ({ flight, travelerCity, destination, fairnessScore }) => {
  return (
    <div className="flight-card">
      <div className="flight-details">
        {/* Flight info */}
      </div>
      <button
        onClick={() => handleSkyscannerClick(flight, travelerCity, destination, fairnessScore)}
        className="book-button"
      >
        Book on Skyscanner
      </button>
    </div>
  );
};

// ============================================================================
// EVENT 4: SEARCH_FAILED
// Trigger: API error, no results, or timeout
// ============================================================================
const performFlightSearch = async (travelers, destination) => {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ travelers, destination }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Check for no results
    if (!data.flights || data.flights.length === 0) {
      trackSearchFailed('no_results', { travelers, destination });
      showNoResultsMessage();
      return;
    }

    handleResultsSuccess(data, destination);

  } catch (error) {
    // Track the failure
    trackSearchFailed('api_error', {
      travelers: travelers.length,
      destination,
      error: error.message
    });

    showErrorMessage();
  }
};

// ============================================================================
// EVENT 5: SURVEY_SUBMITTED
// Trigger: User submits post-results feedback form
// ============================================================================
const handleSurveySubmit = (formData) => {
  trackSurveySubmitted(
    formData.wouldUseAgain === 'yes',
    formData.foundUseful === 'yes'
  );

  // Send to backend, show thank you message, etc.
  submitSurveyToBackend(formData);
};

// Example survey component:
const FeedbackSurvey = () => {
  const [formData, setFormData] = useState({
    wouldUseAgain: null,
    foundUseful: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSurveySubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Would you use this again?</label>
      <input type="radio" name="wouldUseAgain" value="yes" onChange={(e) => setFormData({...formData, wouldUseAgain: e.target.value})} />
      <input type="radio" name="wouldUseAgain" value="no" onChange={(e) => setFormData({...formData, wouldUseAgain: e.target.value})} />

      <label>Did you find this useful?</label>
      <input type="radio" name="foundUseful" value="yes" onChange={(e) => setFormData({...formData, foundUseful: e.target.value})} />
      <input type="radio" name="foundUseful" value="no" onChange={(e) => setFormData({...formData, foundUseful: e.target.value})} />

      <button type="submit">Submit Feedback</button>
    </form>
  );
};

// ============================================================================
// EVENT 6: EMAIL_COLLECTED
// Trigger: User signs up for launch list or newsletter
// ============================================================================
const handleEmailSignup = async (email, source) => {
  try {
    await submitEmailToBackend(email);

    // Track where the email was collected
    trackEmailCollected(source); // 'homepage', 'results_page', 'footer'

    showSuccessMessage('Thanks for signing up!');
  } catch (error) {
    console.error('Email signup failed', error);
  }
};

// Example usage in different places:
// On homepage: trackEmailCollected('homepage')
// On results page: trackEmailCollected('results_page')
// In footer: trackEmailCollected('footer')

// ============================================================================
// EVENT 7: DESTINATION_COMPARED
// Trigger: User searches multiple destinations in same session
// ============================================================================
// Track this at the session level
let searchedDestinations = new Set();

const trackDestinationSearch = (destination) => {
  searchedDestinations.add(destination);

  // Only track comparison if user has searched 2+ destinations
  if (searchedDestinations.size >= 2) {
    trackDestinationCompared(searchedDestinations.size);
  }
};

// Call this when results load
const handleResultsSuccess_WithComparison = (results, destination) => {
  trackDestinationSearch(destination);

  // Your existing results handling...
  handleResultsSuccess(results, destination);
};

// ============================================================================
// EVENT 8: TRAVELER_MODIFIED
// Trigger: User adds or removes travelers after initial load
// ============================================================================
const handleAddTraveler = (currentTravelers) => {
  const newTravelers = [...currentTravelers, { name: '', city: '' }];

  trackTravelerModified('added', newTravelers.length);

  return newTravelers;
};

const handleRemoveTraveler = (currentTravelers, indexToRemove) => {
  const newTravelers = currentTravelers.filter((_, i) => i !== indexToRemove);

  trackTravelerModified('removed', newTravelers.length);

  return newTravelers;
};

// ============================================================================
// EVENT 9: CITY_AUTOCOMPLETE_FAILED
// Trigger: User enters city that doesn't match your mapping
// ============================================================================
const handleCityInputBlur = (cityInput, validCities) => {
  // Check if the input matches any valid city
  const isValid = validCities.some(city =>
    city.toLowerCase() === cityInput.toLowerCase()
  );

  if (!isValid && cityInput.length > 0) {
    // Track failed autocomplete
    trackCityAutocompleteFailed(cityInput);

    // Show error message to user
    showCityValidationError(cityInput);
  }
};

// ============================================================================
// EVENT 10: RESULTS_ABANDONED
// Trigger: User views results but leaves without clicking Skyscanner
// ============================================================================
let resultsStartTime = null;
let currentFairnessScore = null;
let userClickedAffiliate = false;

const startAbandonmentTimer = (fairnessScore) => {
  resultsStartTime = Date.now();
  currentFairnessScore = fairnessScore;
  userClickedAffiliate = false;
};

// Track abandonment when component unmounts or user navigates away
const trackAbandonment = () => {
  if (resultsStartTime && !userClickedAffiliate) {
    const timeOnResults = Math.floor((Date.now() - resultsStartTime) / 1000);

    trackResultsAbandoned(timeOnResults, currentFairnessScore);
  }
};

// In your Results component:
// useEffect(() => {
//   return () => {
//     trackAbandonment();
//   };
// }, []);

// When affiliate link is clicked:
const handleSkyscannerClick_WithAbandonment = (flight, travelerCity, destination, fairnessScore) => {
  userClickedAffiliate = true; // Prevent abandonment tracking

  trackAffiliateClick(travelerCity, flight.price, fairnessScore, destination);

  window.open(flight.skyscannerUrl, '_blank');
};

// ============================================================================
// COMPLETE EXAMPLE: Search Flow with All Events
// ============================================================================
const CompleteSearchFlow = () => {
  const [travelers, setTravelers] = useState([{ name: '', city: '' }]);
  const [destination, setDestination] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    // EVENT 1: Search initiated
    const uniqueCities = new Set(travelers.map(t => t.city));
    trackSearchInitiated(travelers.length, uniqueCities.size);

    // EVENT 11 & 12: Track popular origins and destination
    travelers.forEach(t => trackPopularOrigin(t.city));
    trackPopularDestination(destination);

    try {
      const data = await fetchFlights(travelers, destination);

      if (!data.flights || data.flights.length === 0) {
        // EVENT 4: Search failed - no results
        trackSearchFailed('no_results', { travelers, destination });
        return;
      }

      // EVENT 2: Results loaded
      const fairnessScore = calculateFairnessScore(data);
      trackResultsLoaded(destination, fairnessScore, data.flights.length);

      // EVENT 7: Destination compared (if multiple searches)
      trackDestinationSearch(destination);

      setResults({ ...data, fairnessScore });
      startAbandonmentTimer(fairnessScore);

    } catch (error) {
      // EVENT 4: Search failed - API error
      trackSearchFailed('api_error', { error: error.message });
    }
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
};
