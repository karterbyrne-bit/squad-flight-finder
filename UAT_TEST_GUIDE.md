# UAT Test Suite - Quick Start Guide

## Overview

This comprehensive UAT test suite validates all user-facing functionality of the Squad Flight Finder application. The tests are organized into 4 main suites covering 35+ user acceptance test scenarios.

## Quick Start

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Suites

### 1. Core Flight Search (10 UAT scenarios)
**File**: `tests/uat/01-core-flight-search.test.jsx`

Tests basic application functionality:
- Application loading and initial state
- Adding travelers and their details
- Airport search and autocomplete
- Date selection (departure and return)
- Budget configuration
- Search execution
- Results display
- Error prevention
- Responsive behavior
- Application stability

### 2. Filtering and Sorting (10 UAT scenarios)
**File**: `tests/uat/02-filtering-sorting.test.jsx`

Tests all filter and sort options:
- Trip type filtering (Beach, City, Ski, Luxury, Budget)
- Direct flights filter
- Maximum stops filter
- Nearby airports option
- Sorting by price, fairness, and cheapest option
- Filter combinations
- Filter persistence
- Budget-based filtering
- Visual feedback
- Filter reset

### 3. Traveler and Budget Management (7 UAT scenarios)
**File**: `tests/uat/03-traveler-management.test.jsx`

Tests traveler management:
- Adding multiple travelers (up to 10)
- Removing travelers
- Traveler details configuration
- Budget configuration (£30-£500)
- Traveler color coding
- Data persistence
- Edge cases (max travelers, duplicates, boundaries)

### 4. Error Handling and Edge Cases (8 UAT scenarios)
**File**: `tests/uat/04-error-handling.test.jsx`

Tests error scenarios and edge cases:
- Network error handling
- Invalid input handling
- API error responses (401, 429, empty results)
- Edge cases in search
- Browser compatibility
- Memory and performance
- Data integrity
- Accessibility

## Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Core Functionality | 10 | ✅ |
| Filtering & Sorting | 10 | ✅ |
| Traveler Management | 7 | ✅ |
| Error Handling | 8 | ✅ |
| **Total** | **35+** | **✅** |

## Key Features Tested

### User Workflows
- ✅ Adding and managing multiple travelers
- ✅ Searching for airports with autocomplete
- ✅ Setting travel dates (one-way and round-trip)
- ✅ Configuring budget constraints
- ✅ Filtering by trip type
- ✅ Filtering by flight characteristics (direct, stops)
- ✅ Sorting results by price, fairness, or cheapest
- ✅ Viewing fairness scores for group travel
- ✅ Managing traveler preferences

### Error Handling
- ✅ Network failures and retries
- ✅ API authentication errors
- ✅ Rate limiting
- ✅ Invalid inputs (dates, special characters, SQL injection)
- ✅ Empty results
- ✅ Browser compatibility issues

### Data Management
- ✅ LocalStorage persistence
- ✅ API caching (30-minute TTL)
- ✅ State management across interactions
- ✅ Data integrity during operations

### Accessibility & Performance
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Memory leak prevention
- ✅ Rapid interaction handling

## Mock Data

The test suite includes comprehensive mocks for:

### Amadeus API
- **Authentication**: OAuth token responses
- **Airport Search**: London (LHR, LGW, STN), Manchester (MAN), Paris (CDG, ORY)
- **Flight Offers**: Multiple routes with varying prices and stops
- **Round-trip Flights**: Outbound and return flight combinations
- **Error Responses**: 401 Unauthorized, 429 Rate Limit, Network Failures

### Mock Flights
- **London → Barcelona**: £89.99 (BA), £65.50 (VY)
- **Manchester → Barcelona**: £45.99 (FR)
- **Flights with stops**: Via Amsterdam
- **Round-trip options**: With return flights

## Test Utilities

### Helper Functions

Located in `tests/utils/test-helpers.js`:

- `renderWithUser()` - Render component with userEvent
- `addTraveler()` - Add traveler with details
- `setDate()` - Set date inputs
- `setBudget()` - Set budget slider
- `waitForLoadingToFinish()` - Wait for loading states
- `getButtonByText()` - Find buttons by text
- `simulateApiDelay()` - Mock API delays

### Mock Setup

Located in `tests/mocks/amadeus-api.js`:

- `setupAmadeusApiMocks()` - Setup successful API responses
- `setupAmadeusApiFailures(type)` - Setup API failures (network, unauthorized, rateLimit)

## Example Test

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import App from '../../src/App'
import { renderWithUser } from '../utils/test-helpers'
import { setupAmadeusApiMocks } from '../mocks/amadeus-api'

describe('UAT: Example', () => {
  let restoreFetch

  beforeEach(() => {
    restoreFetch = setupAmadeusApiMocks()
    localStorage.clear()
  })

  afterEach(() => {
    if (restoreFetch) restoreFetch()
  })

  it('should add a traveler', async () => {
    const { user } = renderWithUser(<App />)

    const nameInput = document.querySelector('input[placeholder*="name" i]')
    await user.type(nameInput, 'Alice')

    expect(nameInput.value).toBe('Alice')
  })
})
```

## Viewing Results

### Terminal Output
```bash
npm run test:run
```

Shows:
- Test suites passed/failed
- Individual test results
- Duration
- Coverage summary

### UI Interface
```bash
npm run test:ui
```

Opens browser with:
- Visual test explorer
- Real-time test execution
- Detailed failure messages
- Code coverage visualization

### Coverage Report
```bash
npm run test:coverage
```

Generates:
- `coverage/index.html` - Interactive HTML report
- Terminal summary
- Coverage by file

## Troubleshooting

### Tests Failing

1. **Check test output** for specific error messages
2. **Verify mocks** are set up correctly in beforeEach
3. **Check timeouts** - increase if tests are slow
4. **Review DOM** using `screen.debug()`

### Common Issues

**"Element not found"**
- Element might not be rendered yet - use `waitFor()`
- Check query selector matches actual HTML
- Use `screen.debug()` to inspect DOM

**"Timeout"**
- Increase timeout: `waitFor(() => {...}, { timeout: 5000 })`
- Check for missing `await` keywords
- Verify async operations complete

**"Mock not working"**
- Ensure `setupAmadeusApiMocks()` called in beforeEach
- Verify `restoreFetch()` called in afterEach
- Check URL patterns match actual API calls

## Best Practices

1. **Run tests before committing** - `npm run test:run`
2. **Write tests for new features** - Add to appropriate suite
3. **Keep mocks up to date** - Update when API changes
4. **Document new tests** - Update README with new scenarios
5. **Monitor coverage** - Aim for >80% coverage

## CI/CD Integration

Tests run automatically on:
- Every commit
- Pull requests
- Before deployment

To integrate with CI:

```yaml
# .github/workflows/test.yml
- run: npm ci
- run: npm run test:run
- run: npm run test:coverage
```

## Test Maintenance

### When to Update Tests

- ✅ New feature added - Add new test case
- ✅ Bug fixed - Add regression test
- ✅ API changed - Update mocks
- ✅ UI changed - Update selectors
- ✅ Behavior changed - Update assertions

### Review Checklist

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Mocks are realistic
- [ ] No flaky tests
- [ ] Documentation updated
- [ ] Coverage maintained

## Resources

- **Vitest**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **User Event**: https://testing-library.com/docs/user-event/intro
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

## Support

For help with tests:

1. Check `tests/README.md` for detailed documentation
2. Review existing tests for patterns
3. Use `screen.debug()` to inspect DOM
4. Check Vitest/RTL documentation

---

**Last Updated**: 2026-01-17
**Test Framework**: Vitest 4.0.17
**Test Library**: React Testing Library 16.3.1
**Total UAT Scenarios**: 35+
