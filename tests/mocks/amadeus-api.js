import { vi } from 'vitest'

/**
 * Mock Amadeus API responses for UAT testing
 */

// Mock authentication token response
export const mockAuthResponse = {
  type: 'amadeusOAuth2Token',
  username: 'test@example.com',
  application_name: 'Test Application',
  client_id: 'test_client_id',
  token_type: 'Bearer',
  access_token: 'mock_access_token_12345',
  expires_in: 1799,
  state: 'approved',
}

// Mock airport search responses
export const mockAirportSearchResults = {
  london: {
    data: [
      {
        type: 'location',
        subType: 'AIRPORT',
        name: 'Heathrow',
        iataCode: 'LHR',
        address: { cityName: 'London', countryName: 'United Kingdom' },
      },
      {
        type: 'location',
        subType: 'AIRPORT',
        name: 'Gatwick',
        iataCode: 'LGW',
        address: { cityName: 'London', countryName: 'United Kingdom' },
      },
      {
        type: 'location',
        subType: 'AIRPORT',
        name: 'Stansted',
        iataCode: 'STN',
        address: { cityName: 'London', countryName: 'United Kingdom' },
      },
    ],
  },
  manchester: {
    data: [
      {
        type: 'location',
        subType: 'AIRPORT',
        name: 'Manchester Airport',
        iataCode: 'MAN',
        address: { cityName: 'Manchester', countryName: 'United Kingdom' },
      },
    ],
  },
  paris: {
    data: [
      {
        type: 'location',
        subType: 'AIRPORT',
        name: 'Charles de Gaulle',
        iataCode: 'CDG',
        address: { cityName: 'Paris', countryName: 'France' },
      },
      {
        type: 'location',
        subType: 'AIRPORT',
        name: 'Orly',
        iataCode: 'ORY',
        address: { cityName: 'Paris', countryName: 'France' },
      },
    ],
  },
}

// Mock flight offers
export const mockFlightOffers = {
  'LHR-BCN': {
    data: [
      {
        type: 'flight-offer',
        id: '1',
        source: 'GDS',
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: false,
        lastTicketingDate: '2026-02-20',
        numberOfBookableSeats: 9,
        itineraries: [
          {
            duration: 'PT2H15M',
            segments: [
              {
                departure: {
                  iataCode: 'LHR',
                  terminal: '5',
                  at: '2026-02-20T08:00:00',
                },
                arrival: {
                  iataCode: 'BCN',
                  terminal: '1',
                  at: '2026-02-20T11:15:00',
                },
                carrierCode: 'BA',
                number: '478',
                aircraft: { code: '320' },
                operating: { carrierCode: 'BA' },
                duration: 'PT2H15M',
                id: '1',
                numberOfStops: 0,
                blacklistedInEU: false,
              },
            ],
          },
        ],
        price: {
          currency: 'GBP',
          total: '89.99',
          base: '65.00',
          fees: [{ amount: '0.00', type: 'SUPPLIER' }],
          grandTotal: '89.99',
        },
        pricingOptions: {
          fareType: ['PUBLISHED'],
          includedCheckedBagsOnly: true,
        },
        validatingAirlineCodes: ['BA'],
        travelerPricings: [
          {
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: {
              currency: 'GBP',
              total: '89.99',
              base: '65.00',
            },
          },
        ],
      },
      {
        type: 'flight-offer',
        id: '2',
        source: 'GDS',
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: false,
        lastTicketingDate: '2026-02-20',
        numberOfBookableSeats: 4,
        itineraries: [
          {
            duration: 'PT2H20M',
            segments: [
              {
                departure: {
                  iataCode: 'LHR',
                  terminal: '2',
                  at: '2026-02-20T14:30:00',
                },
                arrival: {
                  iataCode: 'BCN',
                  terminal: '1',
                  at: '2026-02-20T17:50:00',
                },
                carrierCode: 'VY',
                number: '7822',
                aircraft: { code: '320' },
                operating: { carrierCode: 'VY' },
                duration: 'PT2H20M',
                id: '2',
                numberOfStops: 0,
                blacklistedInEU: false,
              },
            ],
          },
        ],
        price: {
          currency: 'GBP',
          total: '65.50',
          base: '45.00',
          fees: [{ amount: '0.00', type: 'SUPPLIER' }],
          grandTotal: '65.50',
        },
        pricingOptions: {
          fareType: ['PUBLISHED'],
          includedCheckedBagsOnly: false,
        },
        validatingAirlineCodes: ['VY'],
        travelerPricings: [
          {
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: {
              currency: 'GBP',
              total: '65.50',
              base: '45.00',
            },
          },
        ],
      },
    ],
  },
  'MAN-BCN': {
    data: [
      {
        type: 'flight-offer',
        id: '3',
        source: 'GDS',
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: false,
        lastTicketingDate: '2026-02-20',
        numberOfBookableSeats: 7,
        itineraries: [
          {
            duration: 'PT2H25M',
            segments: [
              {
                departure: {
                  iataCode: 'MAN',
                  terminal: '3',
                  at: '2026-02-20T09:15:00',
                },
                arrival: {
                  iataCode: 'BCN',
                  terminal: '1',
                  at: '2026-02-20T12:40:00',
                },
                carrierCode: 'FR',
                number: '1453',
                aircraft: { code: '738' },
                operating: { carrierCode: 'FR' },
                duration: 'PT2H25M',
                id: '3',
                numberOfStops: 0,
                blacklistedInEU: false,
              },
            ],
          },
        ],
        price: {
          currency: 'GBP',
          total: '45.99',
          base: '30.00',
          fees: [{ amount: '0.00', type: 'SUPPLIER' }],
          grandTotal: '45.99',
        },
        pricingOptions: {
          fareType: ['PUBLISHED'],
          includedCheckedBagsOnly: false,
        },
        validatingAirlineCodes: ['FR'],
        travelerPricings: [
          {
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: {
              currency: 'GBP',
              total: '45.99',
              base: '30.00',
            },
          },
        ],
      },
    ],
  },
}

// Mock flight offers with stops
export const mockFlightOffersWithStops = {
  data: [
    {
      type: 'flight-offer',
      id: '4',
      source: 'GDS',
      itineraries: [
        {
          duration: 'PT5H30M',
          segments: [
            {
              departure: { iataCode: 'LHR', at: '2026-02-20T08:00:00' },
              arrival: { iataCode: 'AMS', at: '2026-02-20T10:00:00' },
              carrierCode: 'KL',
              number: '1234',
              numberOfStops: 0,
            },
            {
              departure: { iataCode: 'AMS', at: '2026-02-20T11:30:00' },
              arrival: { iataCode: 'BCN', at: '2026-02-20T14:30:00' },
              carrierCode: 'KL',
              number: '5678',
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: 'GBP',
        total: '120.00',
        grandTotal: '120.00',
      },
      travelerPricings: [
        {
          price: { currency: 'GBP', total: '120.00' },
        },
      ],
    },
  ],
}

// Mock round-trip flight offers
export const mockRoundTripFlightOffers = {
  data: [
    {
      type: 'flight-offer',
      id: '5',
      source: 'GDS',
      itineraries: [
        {
          duration: 'PT2H15M',
          segments: [
            {
              departure: { iataCode: 'LHR', at: '2026-02-20T08:00:00' },
              arrival: { iataCode: 'BCN', at: '2026-02-20T11:15:00' },
              carrierCode: 'BA',
              number: '478',
              numberOfStops: 0,
            },
          ],
        },
        {
          duration: 'PT2H20M',
          segments: [
            {
              departure: { iataCode: 'BCN', at: '2026-02-27T15:00:00' },
              arrival: { iataCode: 'LHR', at: '2026-02-27T16:20:00' },
              carrierCode: 'BA',
              number: '479',
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: 'GBP',
        total: '189.99',
        grandTotal: '189.99',
      },
      travelerPricings: [
        {
          price: { currency: 'GBP', total: '189.99' },
        },
      ],
    },
  ],
}

// Mock empty results
export const mockEmptyResults = {
  data: [],
}

// Mock API error responses
export const mockApiErrors = {
  unauthorized: {
    errors: [
      {
        status: 401,
        code: 38190,
        title: 'Invalid access token',
        detail: 'The access token provided in the Authorization header is invalid',
      },
    ],
  },
  notFound: {
    errors: [
      {
        status: 404,
        code: 38196,
        title: 'Resource not found',
        detail: 'The targeted resource does not exist',
      },
    ],
  },
  rateLimit: {
    errors: [
      {
        status: 429,
        code: 38194,
        title: 'Rate limit exceeded',
        detail: 'You have exceeded the rate limit',
      },
    ],
  },
}

/**
 * Setup mock fetch responses for Amadeus API
 */
export function setupAmadeusApiMocks() {
  const originalFetch = global.fetch

  global.fetch = vi.fn((url, options) => {
    const urlString = url.toString()

    // Mock authentication endpoint
    if (urlString.includes('/security/oauth2/token')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockAuthResponse,
      })
    }

    // Mock airport search endpoint
    if (urlString.includes('/reference-data/locations')) {
      const keyword = new URL(urlString).searchParams.get('keyword')?.toLowerCase()

      if (keyword === 'london') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockAirportSearchResults.london,
        })
      } else if (keyword === 'manchester') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockAirportSearchResults.manchester,
        })
      } else if (keyword === 'paris') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockAirportSearchResults.paris,
        })
      } else {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockEmptyResults,
        })
      }
    }

    // Mock flight offers endpoint
    if (urlString.includes('/shopping/flight-offers')) {
      const urlObj = new URL(urlString)
      const origin = urlObj.searchParams.get('originLocationCode')
      const destination = urlObj.searchParams.get('destinationLocationCode')
      const returnDate = urlObj.searchParams.get('returnDate')
      const key = `${origin}-${destination}`

      // Return round-trip flights if return date is specified
      if (returnDate) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockRoundTripFlightOffers,
        })
      }

      // Return appropriate flight offers based on route
      if (mockFlightOffers[key]) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockFlightOffers[key],
        })
      } else {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => mockEmptyResults,
        })
      }
    }

    // Default to original fetch for unmocked endpoints
    return originalFetch(url, options)
  })

  return () => {
    global.fetch = originalFetch
  }
}

/**
 * Setup mock for API failures
 */
export function setupAmadeusApiFailures(errorType = 'network') {
  const originalFetch = global.fetch

  global.fetch = vi.fn(() => {
    if (errorType === 'network') {
      return Promise.reject(new Error('Network request failed'))
    } else if (errorType === 'unauthorized') {
      return Promise.resolve({
        ok: false,
        status: 401,
        json: async () => mockApiErrors.unauthorized,
      })
    } else if (errorType === 'rateLimit') {
      return Promise.resolve({
        ok: false,
        status: 429,
        json: async () => mockApiErrors.rateLimit,
      })
    }
  })

  return () => {
    global.fetch = originalFetch
  }
}
