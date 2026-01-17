# UAT Test Suite Documentation

## Overview

This directory contains a comprehensive User Acceptance Testing (UAT) suite for the Squad Flight Finder application. The tests verify that all user-facing features work correctly and meet the acceptance criteria.

## Test Structure

```
tests/
├── setup.js                    # Global test configuration and mocks
├── mocks/
│   └── amadeus-api.js         # API response mocks for Amadeus
├── utils/
│   └── test-helpers.js        # Reusable test utilities
└── uat/
    ├── 01-core-flight-search.test.jsx       # Core functionality (UAT-001 to UAT-010)
    ├── 02-filtering-sorting.test.jsx        # Filters and sorting (UAT-011 to UAT-020)
    ├── 03-traveler-management.test.jsx      # Travelers and budget (UAT-021 to UAT-027)
    └── 04-error-handling.test.jsx           # Error handling (UAT-028 to UAT-035)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Coverage

### Test Suite 1: Core Flight Search (UAT-001 to UAT-010)

**File**: `tests/uat/01-core-flight-search.test.jsx`

Tests the fundamental flight search functionality:

- **UAT-001**: Initial Application Load
  - Main heading display
  - Traveler input form visibility
  - Default traveler form

- **UAT-002**: Adding Travelers
  - Add traveler with name and origin
  - Add multiple travelers
  - Traveler color indicators

- **UAT-003**: Airport Search and Selection
  - Airport suggestions on city input
  - Autocomplete functionality
  - City input handling

- **UAT-004**: Date Selection
  - Set departure date
  - Set return date for round trips

- **UAT-005**: Budget Configuration
  - Budget slider display
  - Adjust budget value
  - Display current budget

- **UAT-006**: Search Execution
  - Search button availability
  - Search button click handling

- **UAT-007**: Results Display
  - Loading state during search
  - Data persistence in localStorage

- **UAT-008**: Error Prevention
  - Empty form submission handling
  - Special characters in names
  - Long traveler names

- **UAT-009**: Responsive Behavior
  - Layout rendering
  - State maintenance on resize

- **UAT-010**: Application Stability
  - No console errors on render
  - Resource cleanup on unmount

### Test Suite 2: Filtering and Sorting (UAT-011 to UAT-020)

**File**: `tests/uat/02-filtering-sorting.test.jsx`

Tests all filtering and sorting capabilities:

- **UAT-011**: Trip Type Filtering
  - Trip type filter options (Beach, City, Ski, etc.)
  - Select different trip types
  - Filter to specific destinations
  - Toggle back to "All Destinations"

- **UAT-012**: Direct Flights Filter
  - Direct flights toggle display
  - Toggle direct flights filter

- **UAT-013**: Maximum Stops Filter
  - Maximum stops selector
  - Select number of stops
  - Unlimited stops option

- **UAT-014**: Nearby Airports Option
  - "Check all nearby airports" option
  - Toggle nearby airports

- **UAT-015**: Sorting Options
  - Sorting controls display
  - Sort by average price
  - Sort by fairness/deviation
  - Sort by cheapest option
  - Maintain sort selection

- **UAT-016**: Filter Combinations
  - Apply multiple filters simultaneously
  - Clear filters independently

- **UAT-017**: Filter Persistence
  - Remember filter settings in session

- **UAT-018**: Budget-Based Filtering
  - Filter results based on budget
  - Show all destinations with high budget

- **UAT-019**: Visual Feedback
  - Highlight active filter buttons
  - Show filter count indicator

- **UAT-020**: Filter Reset
  - Reset all filters

### Test Suite 3: Traveler and Budget Management (UAT-021 to UAT-027)

**File**: `tests/uat/03-traveler-management.test.jsx`

Tests traveler management and budget configuration:

- **UAT-021**: Adding Multiple Travelers
  - Add up to 10 travelers
  - Assign unique colors
  - Maintain traveler order

- **UAT-022**: Removing Travelers
  - Remove a traveler
  - Prevent removing last traveler
  - Update fairness calculation after removal

- **UAT-023**: Traveler Details Configuration
  - Set traveler name
  - Select origin city
  - Select luggage type
  - Validate required fields

- **UAT-024**: Budget Configuration
  - Display current budget value
  - Set minimum budget (£30)
  - Set maximum budget (£500)
  - Real-time budget display updates
  - Apply budget filter to destinations
  - Persist budget settings

- **UAT-025**: Traveler Color Coding
  - Display unique color per traveler
  - Use consistent colors for same traveler

- **UAT-026**: Traveler Data Persistence
  - Save traveler data to localStorage
  - Maintain traveler count after refresh

- **UAT-027**: Edge Cases
  - Handle maximum number of travelers
  - Handle duplicate traveler names
  - Handle budget at boundaries

### Test Suite 4: Error Handling and Edge Cases (UAT-028 to UAT-035)

**File**: `tests/uat/04-error-handling.test.jsx`

Tests error handling and edge cases:

- **UAT-028**: Network Error Handling
  - Handle network failures gracefully
  - Display error message on API failure
  - Allow retry after network error
  - No state corruption on network error

- **UAT-029**: Invalid Input Handling
  - Handle invalid date formats
  - Return date before departure date
  - Empty traveler name
  - Special characters in city search
  - SQL injection attempts

- **UAT-030**: API Error Responses
  - Handle 401 unauthorized errors
  - Handle rate limit errors (429)
  - Handle empty API responses

- **UAT-031**: Edge Cases in Search
  - Search with only one traveler
  - Same origin city for all travelers
  - Search on current date
  - Search far in the future

- **UAT-032**: Browser Compatibility
  - Work without localStorage
  - Handle missing fetch API

- **UAT-033**: Memory and Performance
  - No memory leaks when adding/removing travelers
  - Handle rapid filter changes

- **UAT-034**: Data Integrity
  - Preserve traveler data during search
  - No duplicate traveler IDs

- **UAT-035**: Accessibility
  - Proper ARIA labels
  - Keyboard navigation

## Mock Data

### Amadeus API Mocks

The test suite uses comprehensive mocks for the Amadeus API:

- **Authentication**: Mock OAuth token responses
- **Airport Search**: Mock airport data for London, Manchester, Paris
- **Flight Offers**: Mock flight offers for various routes (LHR-BCN, MAN-BCN, etc.)
- **Error Responses**: Mock 401, 404, and 429 errors
- **Network Failures**: Simulate network request failures

### Test Helpers

Utility functions for common test operations:

- `renderWithUser()`: Render component with userEvent setup
- `waitForCondition()`: Wait for a condition with timeout
- `addTraveler()`: Helper to fill in traveler details
- `setDate()`: Helper to set date inputs
- `setBudget()`: Helper to set budget slider
- `waitForLoadingToFinish()`: Wait for loading indicators
- `getButtonByText()`: Find buttons by text content
- `simulateApiDelay()`: Mock API delays

## Writing New Tests

### Basic Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import App from '../../src/App'
import { renderWithUser } from '../utils/test-helpers'
import { setupAmadeusApiMocks } from '../mocks/amadeus-api'

describe('UAT: Feature Name', () => {
  let restoreFetch

  beforeEach(() => {
    restoreFetch = setupAmadeusApiMocks()
    localStorage.clear()
  })

  afterEach(() => {
    if (restoreFetch) restoreFetch()
  })

  it('should do something', async () => {
    const { user } = renderWithUser(<App />)

    // Your test code here

    expect(something).toBe(expected)
  })
})
```

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clear localStorage and mocks between tests
3. **Wait for Updates**: Use `waitFor` for async operations
4. **User Interactions**: Use `userEvent` for realistic user interactions
5. **Accessibility**: Use accessible queries (getByRole, getByLabelText)
6. **Descriptive Names**: Use clear, descriptive test names
7. **Error Handling**: Test both success and failure paths

### Common Patterns

#### Finding Elements
```javascript
// By role
const button = screen.getByRole('button', { name: /search/i })

// By label
const input = screen.getByLabelText('Name')

// By placeholder
const cityInput = screen.getByPlaceholderText(/city/i)

// Custom queries
const inputs = document.querySelectorAll('input[type="text"]')
```

#### User Interactions
```javascript
const { user } = renderWithUser(<App />)

// Type into input
await user.type(input, 'London')

// Click button
await user.click(button)

// Clear input
await user.clear(input)

// Select option
await user.selectOptions(select, 'value')
```

#### Waiting for Changes
```javascript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText(/results/i)).toBeInTheDocument()
})

// Wait for condition
await waitFor(() => {
  expect(input.value).toBe('Expected Value')
}, { timeout: 3000 })

// Wait with custom interval
await new Promise(resolve => setTimeout(resolve, 500))
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in `waitFor({ timeout: 5000 })`
   - Check for missing `await` keywords
   - Verify API mocks are set up correctly

2. **Elements not found**
   - Use `screen.debug()` to see DOM structure
   - Check if element is rendered conditionally
   - Verify query selectors match actual HTML

3. **State not updating**
   - Ensure you're using `await user.type()` not direct `.value =`
   - Add delays for debounced inputs
   - Check for missing `await` on async operations

4. **Mock data not working**
   - Verify `setupAmadeusApiMocks()` is called in `beforeEach`
   - Check URL patterns in mock match actual API calls
   - Ensure `restoreFetch()` is called in `afterEach`

### Debugging Tests

```javascript
// View current DOM
screen.debug()

// View specific element
screen.debug(element)

// Check what's in document
console.log(document.body.innerHTML)

// Check localStorage
console.log(localStorage)

// Check fetch calls
console.log(global.fetch.mock.calls)
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: UAT Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Test Metrics

Current test coverage:

- **Total Test Suites**: 4
- **Total Tests**: 100+
- **Coverage Areas**:
  - Core functionality
  - Filtering and sorting
  - Traveler management
  - Error handling
  - Edge cases
  - Accessibility

## Contributing

When adding new features to the application:

1. Write UAT tests first (TDD approach)
2. Follow the existing test structure
3. Add tests to the appropriate test suite
4. Update this README with new test cases
5. Ensure all tests pass before committing

## Support

For questions or issues with the test suite:

1. Check this README
2. Review existing tests for examples
3. Check Vitest documentation: https://vitest.dev/
4. Check React Testing Library docs: https://testing-library.com/react
