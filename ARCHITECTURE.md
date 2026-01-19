# Squad Flight Finder - Architecture Documentation

## Overview

Squad Flight Finder is a React-based web application designed to help groups of travelers find fair flight destinations when departing from different cities. The application uses a proprietary fairness algorithm to ensure equitable travel costs across all participants.

## Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.19
- **Icons**: Lucide React 0.562.0
- **Testing**: Vitest 4.0.17, Testing Library
- **E2E Testing**: Playwright 1.57.0
- **Linting**: ESLint 9.39.1
- **Formatting**: Prettier 3.8.0
- **Git Hooks**: Husky 9.1.7 + lint-staged

## Architecture Pattern

### Current State (v0.0.0)

The application currently follows a **monolithic single-component architecture**:

- **App.jsx** (2,757 lines) - Contains all application logic
- 38 useState hooks managing application state
- Inline service functions (API calls, caching, fairness calculation)
- No separation of concerns

**Note**: This architecture is suitable for a prototype but requires refactoring for production. See the Refactoring Roadmap section below.

## Core Components

### 1. Application Entry Point

```
src/
├── main.jsx          # React app entry point
├── App.jsx           # Main application component
├── App.css           # Application styles
└── index.css         # Global styles with Tailwind
```

### 2. Utilities

```
src/utils/
├── analytics.js      # Google Analytics tracking
├── validation.js     # Input validation & sanitization
├── retry.js          # Retry logic with exponential backoff
└── rateLimiter.js    # Rate limiting & request queue
```

### 3. Components

```
src/components/
└── ErrorBoundary.jsx # Error boundary for graceful error handling
```

### 4. Testing

```
tests/
├── 01-core-flight-search.test.jsx
├── 02-filtering-sorting.test.jsx
├── 03-traveler-management.test.jsx
└── 04-error-handling.test.jsx
```

## Data Flow

### 1. Trip Planning Flow

```
User Input → Validation → State Update → API Calls → Cache Check → Results
```

1. User enters trip details (travelers, dates, budget)
2. Input is validated and sanitized
3. State is updated via useState hooks
4. "Find Destinations" triggers API calls
5. Results are cached for performance
6. Destinations are displayed with fairness scores

### 2. Flight Search Flow

```
Destination Selection → Multi-Origin Search → Fairness Calculation → Results Display
```

1. User selects a destination
2. Flight search runs for each traveler's origin airports
3. Results are combined and analyzed
4. Fairness algorithm calculates scores
5. Flight options are displayed with booking links

## Key Systems

### 1. Caching System

**Two-tier architecture**:
- **Memory Cache**: Fast in-memory Map for frequently accessed data
- **localStorage**: Persistent cache surviving page refreshes

**Features**:
- TTL expiration (30-60 minutes based on data type)
- Automatic quota management
- Cache key generation from endpoint + parameters
- Lazy cleanup of expired entries

**Implementation**: Lines 65-167 in App.jsx

### 2. API Service (Amadeus API)

**Token Management**:
- OAuth2 client credentials flow
- Automatic token refresh before expiry
- Secure token storage in memory

**Endpoints**:
- Airport search by city
- Flight offers search
- Destination discovery

**Error Handling**:
- Graceful degradation on API errors
- Retry logic with exponential backoff
- Rate limiting to prevent quota exhaustion

**Implementation**: Lines 176-370 in App.jsx

### 3. Fairness Algorithm

**Inputs**:
- Individual flight prices for each traveler
- Airport distances from city centers
- Group size and budget constraints

**Calculation**:
1. Calculate price deviation (std deviation / mean)
2. Calculate weighted price score
3. Factor in airport accessibility
4. Normalize to 0-100 scale

**Output**: Fairness score (0-100) where higher = more equitable

### 4. Rate Limiting & Request Queue

**Rate Limiters**:
- **API Rate Limiter**: 10 calls per second (token bucket)
- **Search Rate Limiter**: 5 searches per 5 seconds
- **Request Queue**: Max 5 concurrent API calls

**Purpose**: Prevent API quota exhaustion and abuse

### 5. Validation & Security

**Input Validation**:
- XSS protection via sanitization
- IATA code validation (3-letter codes)
- Date format validation (YYYY-MM-DD)
- Budget range validation (£30-£500)
- Trip type and sort option whitelisting

**Security Measures**:
- Removal of dangerous characters (`<>`, `javascript:`)
- URL protocol validation (http/https only)
- Event handler stripping (`onclick=`, etc.)

## State Management

### Current Approach (v0.0.0)

**useState hooks** (38 total) organized by category:

**Trip Configuration**:
- `budget`, `departureDate`, `returnDate`, `tripType`
- `directFlightsOnly`, `maxStops`

**Traveler Management**:
- `travelers`, `discoveredAirportsByTraveler`

**Results & Data**:
- `availableDestinations`, `flightResults`
- `originalDestinations` (for filtering)

**UI State**:
- `loading`, `error`, `surveyModalOpen`
- `showDebugPanel`, `apiCallStats`

**Filters & Sorting**:
- `budgetFilter`, `tripTypeFilter`, `sortBy`

### Future State Management

**Recommendation**: Migrate to Context API or Zustand for:
- Reduced prop drilling
- Centralized state logic
- Better developer experience
- Easier testing

## Analytics & Tracking

**Google Analytics Events** (12 tracked):

1. `search_initiated` - User starts search
2. `results_loaded` - Results successfully loaded
3. `affiliate_click` - Revenue tracking for bookings
4. `search_failed` - Error analytics
5. `survey_submitted` - User feedback
6. `email_collected` - Lead generation
7. `destination_compared` - User engagement
8. `traveler_modified` - UX analytics
9. `city_autocomplete_failed` - Error tracking
10. `results_abandoned` - Funnel optimization
11. `popular_origin` - Data insights
12. `popular_destination` - Data insights

**Implementation**: `/src/utils/analytics.js`

## Error Handling

### Strategy

1. **Error Boundaries** - Catch React component errors
2. **Try-Catch Blocks** - API and async operations
3. **Graceful Degradation** - Show partial results when possible
4. **User-Friendly Messages** - Avoid technical jargon
5. **Retry Logic** - Automatic retries for transient failures

### Error Boundary

**Location**: `/src/components/ErrorBoundary.jsx`

**Features**:
- Catches unhandled component errors
- Displays user-friendly fallback UI
- Shows technical details in development mode
- Provides "Try Again" and "Refresh" actions
- Logs errors to console (extensible to error services)

## Performance Optimizations

### Current Optimizations

1. **Caching** - Reduce API calls by 70-80%
2. **Smart Airport Limiting** - Only search all airports for major hubs
3. **Development-Only Logging** - No console.log in production
4. **Memoization** - useMemo for expensive calculations
5. **Lazy State Updates** - Batch updates where possible

### Future Optimizations

1. **Code Splitting** - Dynamic imports for routes
2. **Component Memoization** - React.memo for pure components
3. **Virtual Scrolling** - For large destination lists
4. **Service Worker** - PWA with offline support
5. **Image Optimization** - Lazy loading and compression

## Security Considerations

### Current Implementation

✅ **Input Validation** - All user inputs sanitized
✅ **XSS Protection** - Dangerous characters stripped
✅ **Rate Limiting** - Prevents API abuse
✅ **URL Validation** - Only http/https allowed

### Known Issues

⚠️ **API Keys Exposed** - Client-side environment variables
⚠️ **No Backend** - All logic runs on client
⚠️ **No Authentication** - No user accounts
⚠️ **CORS Limitations** - Direct API calls from browser

### Recommendations

1. **Backend API Proxy** - Hide API credentials server-side
2. **Environment Variable Security** - Move secrets to backend
3. **HTTPS Only** - Enforce secure connections
4. **Content Security Policy** - Add CSP headers
5. **Rate Limiting** - Server-side enforcement

## Testing Strategy

### Unit Tests

- Component rendering
- User interactions
- State management
- Utility functions

### Integration Tests

- Multi-component workflows
- API integration
- Cache behavior
- Error handling

### E2E Tests (Playwright)

- Complete user journeys
- Cross-browser testing
- Performance testing
- Mobile responsiveness

**Test Coverage**: 35+ User Acceptance Test scenarios

## Deployment

**Current**: Manual deployment
**Build Command**: `npm run build`
**Output**: `/dist` directory
**Hosting**: Static site hosting (Vercel, Netlify, etc.)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Refactoring Roadmap

### Phase 1: Component Extraction (Priority: High)

**Goal**: Break down monolithic App.jsx into smaller components

**Proposed Structure**:
```
src/components/
├── TripPlanning/
│   ├── TripPlanner.jsx
│   ├── TravelerInput.jsx
│   ├── BudgetSelector.jsx
│   └── DateSelector.jsx
├── DestinationSelection/
│   ├── DestinationList.jsx
│   ├── DestinationCard.jsx
│   └── DestinationFilters.jsx
├── FlightResults/
│   ├── FlightResults.jsx
│   ├── FlightCard.jsx
│   └── FairnessBreakdown.jsx
└── shared/
    ├── ErrorBoundary.jsx
    ├── LoadingSpinner.jsx
    └── Modal.jsx
```

### Phase 2: Custom Hooks (Priority: High)

**Goal**: Extract business logic into reusable hooks

**Proposed Hooks**:
```
src/hooks/
├── useFlightSearch.js    # Flight search logic
├── useFairness.js        # Fairness calculation
├── useCache.js           # Caching logic
├── useTravelers.js       # Traveler management
├── useAmadeusAPI.js      # API integration
└── useFilters.js         # Filtering & sorting
```

### Phase 3: State Management (Priority: Medium)

**Options**:
1. **Context API** - Built-in, no dependencies
2. **Zustand** - Lightweight, simple API
3. **Redux Toolkit** - Full-featured, opinionated

**Recommendation**: Start with Context API, migrate to Zustand if needed

### Phase 4: Backend Integration (Priority: High)

**Goal**: Secure API credentials and add persistence

**Requirements**:
- Backend API proxy for Amadeus API
- User authentication (NextAuth, Clerk, etc.)
- Database for trip history (PostgreSQL, MongoDB)
- Session management

### Phase 5: TypeScript Migration (Priority: Medium)

**Goal**: Add type safety and improve DX

**Approach**:
1. Rename files to .tsx
2. Add type definitions incrementally
3. Start with utility functions
4. Move to components
5. Enable strict mode

### Phase 6: PWA Implementation (Priority: Medium)

**Goal**: Enable offline support and installability

**Features**:
- Service worker for caching
- Offline fallback page
- Add to home screen
- Push notifications (future)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

This project is private and proprietary.

---

**Last Updated**: 2026-01-18
**Version**: 0.0.0
**Author**: Squad Flight Finder Team
