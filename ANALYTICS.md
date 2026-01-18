# Google Analytics Event Tracking Guide

This guide explains how to track custom events in the Squad Flight Finder application.

## Setup

Google Analytics 4 (GA4) is already configured with measurement ID: `G-3L99Y7WVRJ`

The tracking code is loaded in `index.html` and available globally via `window.gtag()`.

## Usage

### 1. Import the Analytics Functions

```javascript
import { trackFlightSearch, trackFlightSelection, trackShare } from './utils/analytics';
```

### 2. Call Tracking Functions at Key User Interactions

```javascript
// When user searches for flights
const handleSearch = (searchData) => {
  trackFlightSearch({
    origin: searchData.origin,
    destination: searchData.destination,
    travelers: searchData.travelers,
  });

  // Your existing search logic...
};
```

## Available Tracking Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `trackFlightSearch(params)` | Track flight searches | When user submits search form |
| `trackFlightSelection(data)` | Track flight clicks | When user clicks a flight option |
| `trackAddTraveler(count)` | Track adding travelers | When + traveler button clicked |
| `trackRemoveTraveler(count)` | Track removing travelers | When X traveler button clicked |
| `trackShare(method)` | Track sharing actions | When user copies link or shares |
| `trackFilterApplied(filter)` | Track filter usage | When user applies filters |
| `trackAPIError(endpoint, msg)` | Track API errors | When API calls fail |
| `trackPageView(path)` | Track page/view changes | For SPA navigation |
| `trackEngagement(seconds, activity)` | Track time spent | For engagement metrics |
| `trackEvent(name, params)` | Generic event tracking | For custom events |

## Common Events to Track

### Essential Events (Recommended)

1. **Flight Searches**
   ```javascript
   trackFlightSearch({
     origin: 'LAX',
     destination: 'JFK',
     num_travelers: 2,
     search_type: 'multi-person'
   });
   ```

2. **Flight Selections**
   ```javascript
   trackFlightSelection({
     airline: 'United',
     price: 450.00,
     flight_number: 'UA123'
   });
   ```

3. **Share Actions**
   ```javascript
   trackShare('clipboard'); // or 'link', 'email', etc.
   ```

4. **Add/Remove Travelers**
   ```javascript
   trackAddTraveler(3); // 3 total travelers
   trackRemoveTraveler(2); // 2 remaining
   ```

### Additional Useful Events

5. **Filter Applications**
   ```javascript
   trackFilterApplied({ type: 'price', value: 500 });
   trackFilterApplied({ type: 'airline', value: 'Delta' });
   ```

6. **Sort Changes**
   ```javascript
   trackEvent('sort_results', { sort_by: 'price_low_to_high' });
   ```

7. **Currency Changes**
   ```javascript
   trackEvent('currency_change', { currency: 'EUR' });
   ```

8. **API Errors**
   ```javascript
   trackAPIError('/api/flights', 'Network timeout');
   ```

## Integration Examples

### Example 1: Track Search Button Click

```javascript
const SearchButton = ({ onSearch, searchParams }) => {
  const handleClick = () => {
    // Track the search
    trackFlightSearch({
      origin: searchParams.origin,
      destination: searchParams.destination,
      num_travelers: searchParams.travelers.length
    });

    // Execute search
    onSearch(searchParams);
  };

  return <button onClick={handleClick}>Search Flights</button>;
};
```

### Example 2: Track Flight Card Clicks

```javascript
const FlightCard = ({ flight }) => {
  const handleFlightClick = () => {
    trackFlightSelection({
      airline: flight.airline,
      price: flight.price,
      flight_number: flight.flightNumber
    });

    // Your existing click handler...
  };

  return (
    <div onClick={handleFlightClick}>
      {/* Flight details */}
    </div>
  );
};
```

### Example 3: Track Share Button

```javascript
const ShareButton = () => {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      trackShare('clipboard');
      alert('Link copied!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return <button onClick={handleShare}>Share Results</button>;
};
```

### Example 4: Track Engagement Time

```javascript
import { useEffect } from 'react';
import { trackEngagement } from './utils/analytics';

const ResultsPage = () => {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const timeInSeconds = Math.floor((endTime - startTime) / 1000);

      if (timeInSeconds > 3) {
        trackEngagement(timeInSeconds, 'viewing_results');
      }
    };
  }, []);

  return <div>{/* Your results */}</div>;
};
```

## Viewing Your Events in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (G-3L99Y7WVRJ)
3. Navigate to **Reports** → **Engagement** → **Events**
4. You'll see all tracked events listed with their counts

### Real-time Testing

To verify events are working:
1. Go to **Reports** → **Realtime** → **Event count by Event name**
2. Perform actions in your app (search, click, share, etc.)
3. Events should appear within seconds

## Event Naming Best Practices

- Use **snake_case** for event names (e.g., `search_flights`, not `searchFlights`)
- Be descriptive but concise
- Group related events with prefixes (e.g., `filter_price`, `filter_airline`)
- Avoid PII (Personally Identifiable Information) in event parameters

## Custom Events

For events not covered by the utility functions, use `trackEvent()`:

```javascript
import { trackEvent } from './utils/analytics';

trackEvent('custom_event_name', {
  parameter1: 'value1',
  parameter2: 'value2',
  parameter3: 123
});
```

## Performance Considerations

- Events are sent asynchronously and don't block the UI
- Failed events are automatically retried by GA
- Events are batched by GA for efficiency
- No need to worry about rate limiting for normal usage

## Privacy & Compliance

- GA4 is GDPR compliant when configured properly
- No PII should be sent in events
- Consider implementing a cookie consent banner
- Users can opt out via browser settings or extensions

## Testing Checklist

Before deploying to production, test these events:

- [ ] Flight search submissions
- [ ] Flight card clicks
- [ ] Add traveler button
- [ ] Remove traveler button
- [ ] Share/copy link button
- [ ] Filter applications
- [ ] Sort changes
- [ ] API error tracking

## Next Steps

1. Review `src/utils/analytics.examples.js` for implementation examples
2. Integrate tracking calls into your components
3. Test in development using GA Realtime view
4. Monitor event data in GA dashboard after deployment

For questions or issues, refer to [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9267735).
