# Google Analytics - Squad Flight Finder

Complete event tracking guide for the 12 core analytics events.

## Setup Complete ✓

- **Measurement ID:** `G-3L99Y7WVRJ`
- **Tracking Code:** Loaded in `index.html`
- **Utility:** `src/utils/analytics.js`

## The 12 Core Events

### Critical Conversion Funnel (Track These First!)

| # | Event | When to Fire | Why It Matters |
|---|-------|--------------|----------------|
| 1 | `search_initiated` | User clicks "Find Flights" | Funnel entry point |
| 2 | `results_loaded` | Results successfully displayed | Successful search rate |
| 3 | **`affiliate_click`** | User clicks to Skyscanner | **💰 YOUR MONEY EVENT** |
| 10 | `results_abandoned` | User leaves without clicking | Conversion blocker identification |

### Error & Quality Tracking

| # | Event | When to Fire | Why It Matters |
|---|-------|--------------|----------------|
| 4 | `search_failed` | API error or no results | Fix broken searches |
| 9 | `city_autocomplete_failed` | City input doesn't match | Improve city mapping |

### User Behavior Insights

| # | Event | When to Fire | Why It Matters |
|---|-------|--------------|----------------|
| 7 | `destination_compared` | Multiple destinations searched | Power user behavior |
| 8 | `traveler_modified` | Add/remove travelers mid-flow | UX friction points |
| 11 | `popular_origin` | Track search FROM cities | Origin patterns |
| 12 | `popular_destination` | Track search TO cities | Destination trends |

### Growth & Feedback

| # | Event | When to Fire | Why It Matters |
|---|-------|--------------|----------------|
| 5 | `survey_submitted` | Feedback form submitted | User satisfaction |
| 6 | `email_collected` | Newsletter signup | Growth metric |

## Quick Implementation Guide

### 1. Import the Functions

```javascript
import {
  trackSearchInitiated,
  trackResultsLoaded,
  trackAffiliateClick,
  trackSearchFailed,
  // ... import others as needed
} from './utils/analytics';
```

### 2. Add to Your Search Handler

```javascript
const handleFindFlights = (travelers, destination) => {
  // Track search
  const uniqueCities = new Set(travelers.map(t => t.city));
  trackSearchInitiated(travelers.length, uniqueCities.size);

  // Track popular origins/destinations
  travelers.forEach(t => trackPopularOrigin(t.city));
  trackPopularDestination(destination);

  // Your search logic...
  performSearch(travelers, destination);
};
```

### 3. Add to Results Display

```javascript
const displayResults = (results, destination) => {
  const fairnessScore = calculateFairnessScore(results);

  // Track successful results
  trackResultsLoaded(
    destination,
    fairnessScore,
    results.flights.length
  );

  // Show results...
};
```

### 4. Add to Skyscanner Links (MOST IMPORTANT!)

```javascript
const FlightCard = ({ flight, travelerCity, destination, fairnessScore }) => {
  const handleBookClick = () => {
    // THIS IS YOUR MONEY EVENT!
    trackAffiliateClick(
      travelerCity,
      flight.price,
      fairnessScore,
      destination
    );

    window.open(flight.skyscannerUrl, '_blank');
  };

  return (
    <button onClick={handleBookClick}>
      Book on Skyscanner - ${flight.price}
    </button>
  );
};
```

### 5. Add Error Tracking

```javascript
const performSearch = async (travelers, destination) => {
  try {
    const data = await fetchFlights(travelers, destination);

    if (!data.flights || data.flights.length === 0) {
      trackSearchFailed('no_results', { travelers, destination });
      return;
    }

    displayResults(data, destination);

  } catch (error) {
    trackSearchFailed('api_error', { error: error.message });
  }
};
```

## Event Reference

### 1. search_initiated

**When:** User clicks "Find Flights" button

```javascript
trackSearchInitiated(
  numTravelers,  // e.g., 3
  numCities      // e.g., 2
);
```

**Parameters:**
- `num_travelers` - Total number of travelers
- `num_cities` - Number of unique origin cities

---

### 2. results_loaded

**When:** Flight results successfully displayed to user

```javascript
trackResultsLoaded(
  'Paris',      // destination
  87,           // fairnessScore (0-100)
  12            // numFlightOptions
);
```

**Parameters:**
- `destination` - Where they're going
- `fairness_score` - Your calculated fairness metric
- `num_flight_options` - How many flight options shown

---

### 3. affiliate_click 💰

**When:** User clicks ANY Skyscanner link

```javascript
trackAffiliateClick(
  'New York',   // travelerCity
  450.00,       // price
  87,           // fairnessScore
  'Paris'       // destination
);
```

**Parameters:**
- `traveler_city` - Which traveler's city this flight is from
- `price` - Flight price
- `fairness_score` - Score of this solution
- `destination` - Where they're going

**Why this matters:** This is your conversion event. Track CTR (click-through rate) from results_loaded to affiliate_click to optimize your UI.

---

### 4. search_failed

**When:** No results found OR API error

```javascript
// No results
trackSearchFailed('no_results', {
  travelers: ['NYC', 'LA'],
  destination: 'Tokyo'
});

// API error
trackSearchFailed('api_error', {
  error: 'Network timeout',
  endpoint: '/api/search'
});
```

**Error Types:**
- `'no_results'` - Search returned zero flights
- `'api_error'` - Backend/network failure
- `'timeout'` - Request took too long

---

### 5. survey_submitted

**When:** User completes feedback form

```javascript
trackSurveySubmitted(
  true,  // wouldUseAgain
  true   // foundUseful
);
```

---

### 6. email_collected

**When:** User signs up for launch list

```javascript
trackEmailCollected('results_page');
```

**Sources:**
- `'homepage'` - Main page signup
- `'results_page'` - Post-search signup
- `'footer'` - Footer form
- `'modal'` - Popup/modal

---

### 7. destination_compared

**When:** User searches 2+ different destinations in one session

```javascript
// Track at session level
let searchedDestinations = new Set();

const trackDestinationSearch = (dest) => {
  searchedDestinations.add(dest);

  if (searchedDestinations.size >= 2) {
    trackDestinationCompared(searchedDestinations.size);
  }
};
```

---

### 8. traveler_modified

**When:** User adds/removes travelers AFTER page load

```javascript
// Adding
trackTravelerModified('added', 4); // Now 4 total

// Removing
trackTravelerModified('removed', 2); // Now 2 total
```

---

### 9. city_autocomplete_failed

**When:** User enters city that doesn't match your city mapping

```javascript
trackCityAutocompleteFailed('Chicag'); // User typo
trackCityAutocompleteFailed('Springfield'); // Ambiguous city
```

**Use this to:**
- Find common typos
- Discover missing cities
- Improve autocomplete

---

### 10. results_abandoned

**When:** User views results but leaves without clicking Skyscanner

```javascript
// Track on component unmount or navigation
useEffect(() => {
  const startTime = Date.now();

  return () => {
    if (!userClickedAffiliate) {
      const timeOnResults = Math.floor((Date.now() - startTime) / 1000);
      trackResultsAbandoned(timeOnResults, fairnessScore);
    }
  };
}, []);
```

**Key metric:** Compare time_on_results for abandoned vs converted users. If abandoned users spend < 10 seconds, your results might be confusing.

---

### 11. popular_origin

**When:** Track each origin city in a search

```javascript
travelers.forEach(traveler => {
  trackPopularOrigin(traveler.city); // 'Boston', 'Chicago', etc.
});
```

**Use case:** See where your users are traveling FROM.

---

### 12. popular_destination

**When:** Track destination on every search

```javascript
trackPopularDestination('Barcelona');
```

**Use case:** See where your users want to GO.

---

## Testing Checklist

Before going live, verify these events fire correctly:

### Critical Path (Do This First!)
- [ ] `search_initiated` fires when clicking "Find Flights"
- [ ] `results_loaded` fires when results appear
- [ ] **`affiliate_click` fires on every Skyscanner link click**
- [ ] `results_abandoned` fires when leaving results without clicking

### Error Handling
- [ ] `search_failed` with `'no_results'` when no flights found
- [ ] `search_failed` with `'api_error'` on network failure
- [ ] `city_autocomplete_failed` on invalid city input

### User Actions
- [ ] `traveler_modified` on add/remove traveler buttons
- [ ] `popular_origin` and `popular_destination` on searches
- [ ] `email_collected` on newsletter signup (if you have it)
- [ ] `survey_submitted` on feedback form (if you have it)

## Viewing Data in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select property `G-3L99Y7WVRJ`
3. **Realtime View:** Reports → Realtime → Events
4. **Historical Data:** Reports → Engagement → Events

### Key Reports to Create

**Conversion Funnel:**
1. `search_initiated` (100%)
2. `results_loaded` (% successful searches)
3. `affiliate_click` (% click-through rate) 💰
4. `results_abandoned` (% abandonment rate)

**Popular Routes:**
- Custom report: `popular_origin` + `popular_destination`
- See which origin-destination pairs are most popular

**Error Rate:**
- Track `search_failed` count vs total `search_initiated`
- Group by `error_type` to prioritize fixes

## Advanced: E-commerce Tracking

To track affiliate revenue (if Skyscanner provides conversion data), set up e-commerce events:

```javascript
trackAffiliateClick(travelerCity, price, fairnessScore, destination);

// Also send e-commerce event
window.gtag('event', 'purchase', {
  transaction_id: generateUniqueId(),
  value: price * 0.05, // Assume 5% commission
  currency: 'USD',
  items: [{
    item_name: `Flight to ${destination}`,
    price: price,
  }]
});
```

## Privacy & Compliance

- ✓ No PII collected in events (no names, emails, phone numbers)
- ✓ City names are OK (not precise location)
- ✓ Prices are OK (public information)
- Consider adding cookie consent banner for GDPR compliance

## Next Steps

1. **Implement critical path first** (events 1, 2, 3, 10)
2. **Test in Realtime view** to verify events fire
3. **Add error tracking** (events 4, 9)
4. **Add behavioral tracking** (events 7, 8, 11, 12)
5. **Monitor for 1 week** to gather baseline data
6. **Create custom reports** in GA4
7. **Optimize based on data** (improve low CTR, fix high abandonment)

## Support

- **Examples:** See `src/utils/analytics.examples.js`
- **GA4 Docs:** [Google Analytics Help](https://support.google.com/analytics)
- **Event Debugging:** Use [GA Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/) extension
