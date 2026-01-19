# Refactoring TODO - Squad Flight Finder

## Overview

This document outlines the remaining refactoring work needed to transform the monolithic `App.jsx` (2,757 lines, 38 useState hooks) into a maintainable, scalable codebase.

**Status**: Phase 1 of refactoring completed (utilities, error boundaries, documentation)
**Next Phase**: Component extraction and custom hooks

## Completed ✅

### Phase 1: Foundation & Utilities (Completed)

- ✅ **Prettier configuration** - Code formatting standardized
- ✅ **Husky + lint-staged** - Pre-commit hooks enforce quality
- ✅ **Input validation utilities** (`src/utils/validation.js`)
- ✅ **Retry logic with exponential backoff** (`src/utils/retry.js`)
- ✅ **Rate limiting & request queue** (`src/utils/rateLimiter.js`)
- ✅ **Error boundary component** (`src/components/ErrorBoundary.jsx`)
- ✅ **Documentation** (ARCHITECTURE.md, DEPLOYMENT.md, USER_GUIDE.md)
- ✅ **Error boundary integration** in main.jsx

## Remaining Work 🚧

### Phase 2: Extract Custom Hooks (HIGH PRIORITY)

**Goal**: Move business logic out of App.jsx into reusable hooks

#### 2.1 Create `src/hooks/useAmadeusAPI.js`

**Extract from App.jsx lines 176-370**

```javascript
// src/hooks/useAmadeusAPI.js
export const useAmadeusAPI = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  const getAccessToken = async () => { /* ... */ };
  const searchAirports = async (cityName) => { /* ... */ };
  const searchFlights = async (origin, destination, ...) => { /* ... */ };
  const searchDestinations = async (origin) => { /* ... */ };

  return {
    searchAirports,
    searchFlights,
    searchDestinations
  };
};
```

**Benefits**:
- Reusable across components
- Easier to test
- Separates API logic from UI

#### 2.2 Create `src/hooks/useCache.js`

**Extract from App.jsx lines 65-167**

```javascript
// src/hooks/useCache.js
export const useCache = () => {
  const get = (endpoint, params) => { /* ... */ };
  const set = (endpoint, params, data, ttl) => { /* ... */ };
  const clear = () => { /* ... */ };
  const clearOldItems = () => { /* ... */ };

  return { get, set, clear, clearOldItems };
};
```

#### 2.3 Create `src/hooks/useTravelers.js`

**Extract traveler management state and logic**

```javascript
// src/hooks/useTravelers.js
export const useTravelers = () => {
  const [travelers, setTravelers] = useState([...]);
  const [discoveredAirports, setDiscoveredAirports] = useState({});

  const addTraveler = () => { /* ... */ };
  const removeTraveler = (index) => { /* ... */ };
  const updateTraveler = (index, field, value) => { /* ... */ };
  const duplicateTraveler = (index) => { /* ... */ };
  const searchAirportsForTraveler = async (index, city) => { /* ... */ };

  return {
    travelers,
    discoveredAirports,
    addTraveler,
    removeTraveler,
    updateTraveler,
    duplicateTraveler,
    searchAirportsForTraveler
  };
};
```

#### 2.4 Create `src/hooks/useFairness.js`

**Extract fairness calculation logic**

```javascript
// src/hooks/useFairness.js
export const useFairness = () => {
  const calculateFairnessScore = (prices, airports) => {
    // Fairness algorithm implementation
    /* ... */
  };

  const sortByFairness = (destinations) => { /* ... */ };

  return {
    calculateFairnessScore,
    sortByFairness
  };
};
```

#### 2.5 Create `src/hooks/useFlightSearch.js`

**Extract flight search orchestration**

```javascript
// src/hooks/useFlightSearch.js
export const useFlightSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const searchFlights = async (travelers, destination, dates, filters) => {
    // Multi-traveler search logic
    /* ... */
  };

  const findDestinations = async (travelers, filters) => {
    // Destination discovery logic
    /* ... */
  };

  return {
    loading,
    error,
    results,
    searchFlights,
    findDestinations
  };
};
```

### Phase 3: Extract Components (HIGH PRIORITY)

**Goal**: Break down monolithic JSX into focused components

#### 3.1 Create Trip Planning Components

```
src/components/TripPlanning/
├── TripPlanner.jsx           # Main container
├── BudgetSelector.jsx        # Budget slider
├── DateSelector.jsx          # Date inputs
├── TravelerList.jsx          # List of travelers
├── TravelerInput.jsx         # Single traveler input
├── AirportSelector.jsx       # Airport selection
└── SearchOptions.jsx         # Direct flights, max stops, trip type
```

**Extract from App.jsx**: Lines ~600-1200 (Trip planning UI)

#### 3.2 Create Destination Selection Components

```
src/components/DestinationSelection/
├── DestinationList.jsx       # Main container
├── DestinationCard.jsx       # Single destination card
├── DestinationFilters.jsx    # Budget, trip type filters
├── DestinationSort.jsx       # Sort options
└── EmptyState.jsx            # No results message
```

**Extract from App.jsx**: Lines ~1200-1800 (Destination display)

#### 3.3 Create Flight Results Components

```
src/components/FlightResults/
├── FlightResults.jsx         # Main container
├── FlightCard.jsx            # Single flight option
├── FlightDetails.jsx         # Itinerary details
├── FairnessBreakdown.jsx     # Fairness score display
├── BookingLinks.jsx          # Share booking links
└── PriceComparison.jsx       # Price visualization
```

**Extract from App.jsx**: Lines ~1800-2400 (Flight results display)

#### 3.4 Create Shared Components

```
src/components/shared/
├── ErrorBoundary.jsx         # ✅ Already created
├── LoadingSpinner.jsx        # Loading states
├── Modal.jsx                 # Survey, share modals
├── Button.jsx                # Reusable button
├── Badge.jsx                 # Trip type badges
└── DebugPanel.jsx            # Debug overlay
```

### Phase 4: Service Layer Refactoring (MEDIUM PRIORITY)

**Goal**: Move API and business logic to service classes

#### 4.1 Create `src/services/AmadeusService.js`

**Move API logic from hooks to service class**

```javascript
// src/services/AmadeusService.js
class AmadeusService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async authenticate() { /* ... */ }
  async searchAirports(city) { /* ... */ }
  async searchFlights(params) { /* ... */ }
  async searchDestinations(origin) { /* ... */ }
}

export default new AmadeusService();
```

#### 4.2 Create `src/services/CacheService.js`

**Move caching logic to service**

```javascript
// src/services/CacheService.js
class CacheService {
  constructor() {
    this.memory = new Map();
  }

  get(key) { /* ... */ }
  set(key, value, ttl) { /* ... */ }
  clear() { /* ... */ }
}

export default new CacheService();
```

#### 4.3 Create `src/services/FairnessService.js`

**Move fairness algorithm to service**

```javascript
// src/services/FairnessService.js
class FairnessService {
  calculateScore(prices, airports) { /* ... */ }
  compareFairness(dest1, dest2) { /* ... */ }
  optimizeFairness(destinations) { /* ... */ }
}

export default new FairnessService();
```

### Phase 5: Memory Leak Fixes (HIGH PRIORITY)

**Goal**: Ensure proper cleanup in useEffect hooks

#### 5.1 Add Cleanup Functions

Search for all `useEffect` hooks in App.jsx and ensure:

```javascript
// ❌ BAD - No cleanup
useEffect(() => {
  const timer = setInterval(() => { /* ... */ }, 1000);
}, []);

// ✅ GOOD - Proper cleanup
useEffect(() => {
  const timer = setInterval(() => { /* ... */ }, 1000);
  return () => clearInterval(timer);
}, []);
```

#### 5.2 Abort Pending API Calls

```javascript
// ✅ GOOD - AbortController for fetch
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(/* ... */)
    .catch(err => {
      if (err.name === 'AbortError') return;
      // Handle other errors
    });

  return () => controller.abort();
}, [url]);
```

#### 5.3 Check for Unmounted Component Updates

```javascript
// ✅ GOOD - Check if mounted
useEffect(() => {
  let isMounted = true;

  fetchData().then(data => {
    if (isMounted) {
      setData(data);
    }
  });

  return () => { isMounted = false; };
}, []);
```

**Files to Audit**: Search App.jsx for all `useEffect` hooks (there are many)

### Phase 6: State Management Migration (MEDIUM PRIORITY)

**Goal**: Replace 38 useState hooks with centralized state

#### Option A: Context API (Recommended for now)

```
src/context/
├── TripContext.jsx           # Trip planning state
├── TravelersContext.jsx      # Traveler management
├── FlightContext.jsx         # Flight results
└── UIContext.jsx             # Loading, modals, errors
```

#### Option B: Zustand (If Context becomes unwieldy)

```javascript
// src/store/tripStore.js
import create from 'zustand';

export const useTripStore = create((set) => ({
  budget: 100,
  departureDate: '',
  returnDate: '',
  setBudget: (budget) => set({ budget }),
  setDepartureDate: (date) => set({ departureDate: date }),
  // ...
}));
```

### Phase 7: TypeScript Migration (LOW PRIORITY)

**Goal**: Add type safety

#### 7.1 Install TypeScript

```bash
npm install --save-dev typescript @types/react @types/react-dom
```

#### 7.2 Add tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  }
}
```

#### 7.3 Migrate Files Gradually

1. Rename `.jsx` → `.tsx`
2. Add type definitions
3. Fix type errors
4. Enable strict mode

**Start with**: Utility files (easiest)
**Then**: Services
**Finally**: Components

### Phase 8: Integration with Utilities (HIGH PRIORITY)

**Goal**: Use the utilities we just created

#### 8.1 Integrate Validation

**In traveler input components**:

```javascript
import { validateTravelerName, validateCityName } from '@/utils/validation';

const handleNameChange = (name) => {
  const validated = validateTravelerName(name);
  setTravelerName(validated);
};
```

#### 8.2 Integrate Retry Logic

**In Amadeus API service**:

```javascript
import { retryApiCall } from '@/utils/retry';

const searchFlights = async (params) => {
  return retryApiCall(async () => {
    const response = await fetch(/* ... */);
    if (!response.ok) throw new Error('API error');
    return response.json();
  });
};
```

#### 8.3 Integrate Rate Limiting

**In API hooks**:

```javascript
import { apiRateLimiter, searchRateLimiter } from '@/utils/rateLimiter';

const searchFlights = apiRateLimiter.wrap(async (params) => {
  // API call
});

const findDestinations = searchRateLimiter.wrap(async (travelers) => {
  // Search logic
});
```

## Implementation Order

### Week 1: Custom Hooks
1. ✅ Create utility files (validation, retry, rate limiting) - DONE
2. Extract useAmadeusAPI hook
3. Extract useCache hook
4. Extract useTravelers hook
5. Test hooks in isolation

### Week 2: Component Extraction - Part 1
1. Create shared components (Button, Badge, LoadingSpinner)
2. Extract TripPlanning components
3. Update App.jsx to use new components
4. Test trip planning flow

### Week 3: Component Extraction - Part 2
1. Extract DestinationSelection components
2. Extract FlightResults components
3. Update App.jsx to use new components
4. Test complete user flow

### Week 4: Service Layer & Memory Leaks
1. Create service classes
2. Audit all useEffect hooks
3. Add cleanup functions
4. Add AbortControllers
5. Test for memory leaks

### Week 5: State Management
1. Decide on Context vs Zustand
2. Create context providers or stores
3. Migrate useState hooks
4. Remove redundant state

### Week 6: Integration & Testing
1. Integrate validation utilities
2. Integrate retry logic
3. Integrate rate limiting
4. Update all tests
5. Manual QA testing

## Testing Strategy

For each refactored piece:

1. **Unit Tests**: Test hooks and services in isolation
2. **Integration Tests**: Test component integration
3. **E2E Tests**: Ensure user flows still work
4. **Manual Testing**: Click through all features

## Breaking Change Checklist

Before each refactoring:

- [ ] Existing tests pass
- [ ] Feature branch created
- [ ] Incremental commits
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Code review
- [ ] QA testing
- [ ] Merge to main

## Rollback Plan

If refactoring breaks something:

1. Revert to previous commit
2. Fix issue in feature branch
3. Test thoroughly
4. Try again

## Success Metrics

We'll know refactoring is successful when:

- ✅ App.jsx is under 500 lines
- ✅ No file exceeds 300 lines
- ✅ useState hooks reduced from 38 to <10 in App.jsx
- ✅ All tests pass
- ✅ No new bugs introduced
- ✅ Performance maintained or improved
- ✅ Bundle size unchanged or smaller

## Resources

- **React Hooks Best Practices**: https://react.dev/learn/reusing-logic-with-custom-hooks
- **Component Composition**: https://react.dev/learn/passing-props-to-a-component
- **Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **Context API**: https://react.dev/learn/passing-data-deeply-with-context

---

**Created**: 2026-01-18
**Status**: Phase 1 Complete
**Next**: Phase 2 - Extract Custom Hooks
