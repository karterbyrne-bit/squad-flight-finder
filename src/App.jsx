import React, { useState, useRef } from 'react';
import { Plane, Users, Plus, X, Search, DollarSign, Scale, Calendar, Briefcase, Palmtree, Mountain, Gem, Coffee, Share2, Copy, Check, Info, ArrowRight, ArrowLeft, Globe, ArrowUpDown, ExternalLink, TrendingDown, Clock, MapPin } from 'lucide-react';
import './App.css';

// API CALL TRACKING
const apiCallTracker = {
  totalCalls: 0,
  callsByEndpoint: {},
  cacheHits: 0,

  trackCall(endpoint) {
    this.totalCalls++;
    this.callsByEndpoint[endpoint] = (this.callsByEndpoint[endpoint] || 0) + 1;
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('apiCallUpdate', {
      detail: {
        total: this.totalCalls,
        cacheHits: this.cacheHits,
        byEndpoint: this.callsByEndpoint
      }
    }));
  },

  trackCacheHit() {
    this.cacheHits++;
    window.dispatchEvent(new CustomEvent('apiCallUpdate', {
      detail: {
        total: this.totalCalls,
        cacheHits: this.cacheHits,
        byEndpoint: this.callsByEndpoint
      }
    }));
  },

  reset() {
    this.totalCalls = 0;
    this.callsByEndpoint = {};
    this.cacheHits = 0;
    window.dispatchEvent(new CustomEvent('apiCallUpdate', {
      detail: {
        total: 0,
        cacheHits: 0,
        byEndpoint: {}
      }
    }));
  }
};

// CACHING SYSTEM
const apiCache = {
  memory: new Map(),

  generateKey(endpoint, params) {
    return `${endpoint}_${JSON.stringify(params)}`;
  },

  get(endpoint, params) {
    const key = this.generateKey(endpoint, params);

    // Check memory cache first
    const memoryItem = this.memory.get(key);
    if (memoryItem && memoryItem.expiry > Date.now()) {
      console.log('✅ Cache HIT (memory):', key);
      apiCallTracker.trackCacheHit();
      return memoryItem.data;
    }

    // Check localStorage cache
    try {
      const lsItem = localStorage.getItem(key);
      if (lsItem) {
        const parsed = JSON.parse(lsItem);
        if (parsed.expiry > Date.now()) {
          console.log('✅ Cache HIT (localStorage):', key);
          // Promote to memory cache
          this.memory.set(key, parsed);
          apiCallTracker.trackCacheHit();
          return parsed.data;
        } else {
          // Expired, remove it
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    console.log('❌ Cache MISS:', key);
    return null;
  },

  set(endpoint, params, data, ttlMinutes = 30) {
    const key = this.generateKey(endpoint, params);
    const item = {
      data,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };

    // Store in memory
    this.memory.set(key, item);

    // Store in localStorage (with error handling for quota)
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache write error (quota?):', e);
      // If quota exceeded, clear old cache items
      this.clearOldItems();
    }
  },

  clearOldItems() {
    const now = Date.now();
    // Clear expired memory cache
    for (const [key, value] of this.memory.entries()) {
      if (value.expiry <= now) {
        this.memory.delete(key);
      }
    }

    // Clear expired localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item.expiry <= now) {
            keysToRemove.push(key);
          }
        } catch (e) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  clear() {
    this.memory.clear();
    // Clear only API cache from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('flight') || key.includes('destination') || key.includes('airport'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Major hub cities that should check ALL airports (not limited)
const MAJOR_HUB_CITIES = [
  'London', 'Paris', 'New York', 'NYC', 'Moscow', 'Los Angeles', 'LA',
  'Tokyo', 'Manila', 'Stockholm', 'San Francisco', 'Dubai', 'Boston'
];

// AMADEUS API SERVICE
const AmadeusAPI = {
  accessToken: null,
  tokenExpiry: null,

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: import.meta.env.VITE_AMADEUS_API_KEY,
        client_secret: import.meta.env.VITE_AMADEUS_API_SECRET,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || 'Authentication failed');
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken;
  },

  async searchAirports(cityName) {
    try {
      // Check cache first
      const cacheParams = { cityName };
      const cached = apiCache.get('airports', cacheParams);
      if (cached) return cached;

      apiCallTracker.trackCall('airports');

      const token = await this.getAccessToken();
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error('❌ API returned error status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      const result = data.data || [];

      // Cache for 60 minutes (airports don't change often)
      apiCache.set('airports', cacheParams, result, 60);

      return result;
    } catch (err) {
      console.error('Airport search error:', err);
      return [];
    }
  },

  async searchFlights(origin, destination, departureDate, adults = 1, returnDate = null, filters = {}) {
    try {
      // Check cache first
      const cacheParams = { origin, destination, departureDate, adults, returnDate, filters };
      const cached = apiCache.get('flights', cacheParams);
      if (cached) return cached;

      apiCallTracker.trackCall('flights');

      const token = await this.getAccessToken();
      let url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&max=5`;

      // Add returnDate for round-trip searches
      if (returnDate) {
        url += `&returnDate=${returnDate}`;
      }

      // Add filter parameters
      if (filters.nonStop) {
        url += '&nonStop=true';
      }

      if (filters.maxStops !== undefined && filters.maxStops !== null) {
        // maxStops filter: 0 = direct only, 1 = max 1 stop, 2 = max 2 stops
        if (filters.maxStops === 0) {
          url += '&nonStop=true';
        }
        // Note: Amadeus API doesn't have a native maxStops parameter,
        // so we'll filter results after fetching for maxStops > 0
      }

      console.log('🔍 Searching flights:', { origin, destination, departureDate, returnDate, filters, tripType: returnDate ? 'round-trip' : 'one-way', url });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('❌ API returned error status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log(`✈️ API Response for ${origin}->${destination} (${returnDate ? 'round-trip' : 'one-way'}):`, data);

      // Log itinerary structure for debugging
      if (data.data && data.data.length > 0) {
        const firstFlight = data.data[0];
        console.log(`   Itineraries: ${firstFlight.itineraries.length} (${firstFlight.itineraries.length > 1 ? 'round-trip' : 'one-way'})`);
      }

      if (data.errors) {
        console.error('❌ API returned errors:', data.errors);
        return [];
      }

      let results = data.data || [];

      // Apply client-side filtering for maxStops (when not using nonStop)
      if (filters.maxStops !== undefined && filters.maxStops !== null && filters.maxStops > 0) {
        results = results.filter(flight => {
          // Check all itineraries (outbound and return)
          return flight.itineraries.every(itinerary => {
            const stops = itinerary.segments.length - 1; // Number of segments - 1 = stops
            return stops <= filters.maxStops;
          });
        });
        console.log(`   Filtered to ${results.length} flights with max ${filters.maxStops} stops`);
      }

      // Cache for 30 minutes
      apiCache.set('flights', cacheParams, results, 30);

      return results;
    } catch (err) {
      console.error('❌ Flight search error:', err);
      return [];
    }
  },

  async searchDestinations(origin) {
    try {
      // Check cache first
      const cacheParams = { origin };
      const cached = apiCache.get('destinations', cacheParams);
      if (cached) return cached;

      apiCallTracker.trackCall('destinations');

      const token = await this.getAccessToken();
      const url = `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${origin}&max=50`;
      console.log('🌍 Searching destinations from:', origin);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('❌ API returned error status:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log(`🗺️ Available destinations from ${origin}:`, data);

      if (data.errors) {
        console.error('❌ API returned errors:', data.errors);
        return [];
      }

      const result = data.data || [];

      // Cache for 60 minutes (destinations don't change often)
      apiCache.set('destinations', cacheParams, result, 60);

      return result;
    } catch (err) {
      console.error('❌ Destination search error:', err);
      return [];
    }
  },
};

// Map cities to nearby airports with distances (in miles)
const cityToAirportsMap = {
  'Leicester': [
    { code: 'EMA', name: 'East Midlands', distance: 20 },
    { code: 'BHX', name: 'Birmingham', distance: 35 },
    { code: 'LHR', name: 'London Heathrow', distance: 100 },
    { code: 'LGW', name: 'London Gatwick', distance: 110 },
    { code: 'MAN', name: 'Manchester', distance: 75 }
  ],
  'London': [
    { code: 'LHR', name: 'Heathrow', distance: 15 },
    { code: 'LGW', name: 'Gatwick', distance: 28 },
    { code: 'STN', name: 'Stansted', distance: 35 },
    { code: 'LTN', name: 'Luton', distance: 30 },
    { code: 'LCY', name: 'City', distance: 6 }
  ],
  'Manchester': [
    { code: 'MAN', name: 'Manchester', distance: 10 },
    { code: 'LPL', name: 'Liverpool', distance: 35 },
    { code: 'LBA', name: 'Leeds Bradford', distance: 45 }
  ],
  'Birmingham': [
    { code: 'BHX', name: 'Birmingham', distance: 8 },
    { code: 'EMA', name: 'East Midlands', distance: 40 },
    { code: 'BRS', name: 'Bristol', distance: 85 }
  ],
  'Leeds': [
    { code: 'LBA', name: 'Leeds Bradford', distance: 8 },
    { code: 'MAN', name: 'Manchester', distance: 45 },
    { code: 'EMA', name: 'East Midlands', distance: 75 }
  ],
  'Liverpool': [
    { code: 'LPL', name: 'Liverpool', distance: 8 },
    { code: 'MAN', name: 'Manchester', distance: 35 }
  ],
  'Bristol': [
    { code: 'BRS', name: 'Bristol', distance: 8 },
    { code: 'CWL', name: 'Cardiff', distance: 45 },
    { code: 'BHX', name: 'Birmingham', distance: 85 }
  ],
  'Newcastle': [
    { code: 'NCL', name: 'Newcastle', distance: 8 },
    { code: 'EDI', name: 'Edinburgh', distance: 105 }
  ],
  'Glasgow': [
    { code: 'GLA', name: 'Glasgow', distance: 8 },
    { code: 'PIK', name: 'Prestwick', distance: 30 },
    { code: 'EDI', name: 'Edinburgh', distance: 45 }
  ],
  'Edinburgh': [
    { code: 'EDI', name: 'Edinburgh', distance: 8 },
    { code: 'GLA', name: 'Glasgow', distance: 45 }
  ],
  'Belfast': [
    { code: 'BFS', name: 'Belfast International', distance: 13 },
    { code: 'BHD', name: 'Belfast City', distance: 3 }
  ],
  'Cardiff': [
    { code: 'CWL', name: 'Cardiff', distance: 12 },
    { code: 'BRS', name: 'Bristol', distance: 45 }
  ],
  'Nottingham': [
    { code: 'EMA', name: 'East Midlands', distance: 14 },
    { code: 'BHX', name: 'Birmingham', distance: 50 },
    { code: 'MAN', name: 'Manchester', distance: 70 }
  ],
  'Sheffield': [
    { code: 'LBA', name: 'Leeds Bradford', distance: 35 },
    { code: 'EMA', name: 'East Midlands', distance: 40 },
    { code: 'MAN', name: 'Manchester', distance: 38 }
  ],
  'Oxford': [
    { code: 'LHR', name: 'Heathrow', distance: 40 },
    { code: 'LGW', name: 'Gatwick', distance: 80 },
    { code: 'BHX', name: 'Birmingham', distance: 60 }
  ],
  'Cambridge': [
    { code: 'STN', name: 'Stansted', distance: 28 },
    { code: 'LTN', name: 'Luton', distance: 40 },
    { code: 'LHR', name: 'Heathrow', distance: 60 }
  ],
  'Brighton': [
    { code: 'LGW', name: 'Gatwick', distance: 25 },
    { code: 'LHR', name: 'Heathrow', distance: 55 }
  ],
  'Southampton': [
    { code: 'SOU', name: 'Southampton', distance: 5 },
    { code: 'LHR', name: 'Heathrow', distance: 65 },
    { code: 'LGW', name: 'Gatwick', distance: 70 }
  ]
};

// Destination airport codes (primary airport per city)
const destinationAirportMap = {
  // Major Cities - Western Europe
  'Barcelona': 'BCN',
  'Amsterdam': 'AMS',
  'Prague': 'PRG',
  'Berlin': 'BER',
  'Budapest': 'BUD',
  'Lisbon': 'LIS',
  'Paris': 'CDG',
  'Rome': 'FCO',
  'Dublin': 'DUB',
  'Edinburgh': 'EDI',
  'Madrid': 'MAD',
  'Vienna': 'VIE',
  'Brussels': 'BRU',
  'Copenhagen': 'CPH',
  'Stockholm': 'ARN',
  'Oslo': 'OSL',
  'Helsinki': 'HEL',
  'Reykjavik': 'KEF',

  // Spanish Cities & Beach Destinations
  'Palma': 'PMI',
  'Mallorca': 'PMI',
  'Ibiza': 'IBZ',
  'Menorca': 'MAH',
  'Alicante': 'ALC',
  'Benidorm': 'ALC',
  'Malaga': 'AGP',
  'Tenerife': 'TFS',
  'Gran Canaria': 'LPA',
  'Lanzarote': 'ACE',
  'Fuerteventura': 'FUE',
  'Seville': 'SVQ',
  'Valencia': 'VLC',
  'Bilbao': 'BIO',
  'Granada': 'GRX',
  'Santiago de Compostela': 'SCQ',

  // Portuguese Destinations
  'Porto': 'OPO',
  'Faro': 'FAO',
  'Algarve': 'FAO',

  // Greek Destinations
  'Athens': 'ATH',
  'Santorini': 'JTR',
  'Mykonos': 'JMK',
  'Rhodes': 'RHO',
  'Corfu': 'CFU',
  'Heraklion': 'HER',
  'Crete': 'HER',
  'Chania': 'CHQ',
  'Kos': 'KGS',
  'Zakynthos': 'ZTH',
  'Thessaloniki': 'SKG',

  // Italian Cities & Islands
  'Venice': 'VCE',
  'Milan': 'MXP',
  'Florence': 'FLR',
  'Naples': 'NAP',
  'Bologna': 'BLQ',
  'Turin': 'TRN',
  'Verona': 'VRN',
  'Genoa': 'GOA',
  'Pisa': 'PSA',
  'Bergamo': 'BGY',
  'Catania': 'CTA',
  'Palermo': 'PMO',
  'Cagliari': 'CAG',
  'Olbia': 'OLB',
  'Bari': 'BRI',
  'Brindisi': 'BDS',

  // French Cities
  'Nice': 'NCE',
  'Lyon': 'LYS',
  'Marseille': 'MRS',
  'Bordeaux': 'BOD',
  'Toulouse': 'TLS',
  'Strasbourg': 'SXB',
  'Nantes': 'NTE',
  'Montpellier': 'MPL',

  // German Cities
  'Munich': 'MUC',
  'Hamburg': 'HAM',
  'Frankfurt': 'FRA',
  'Cologne': 'CGN',
  'Dusseldorf': 'DUS',
  'Stuttgart': 'STR',
  'Dresden': 'DRS',
  'Nuremberg': 'NUE',
  'Bremen': 'BRE',
  'Hannover': 'HAJ',
  'Leipzig': 'LEJ',

  // Eastern European Cities (Budget)
  'Warsaw': 'WAW',
  'Krakow': 'KRK',
  'Gdansk': 'GDN',
  'Wroclaw': 'WRO',
  'Poznan': 'POZ',
  'Zagreb': 'ZAG',
  'Belgrade': 'BEG',
  'Bucharest': 'OTP',
  'Sofia': 'SOF',
  'Riga': 'RIX',
  'Tallinn': 'TLL',
  'Vilnius': 'VNO',
  'Bratislava': 'BTS',
  'Ljubljana': 'LJU',
  'Sarajevo': 'SJJ',
  'Skopje': 'SKP',
  'Tirana': 'TIA',

  // Croatian Coast
  'Dubrovnik': 'DBV',
  'Split': 'SPU',
  'Zadar': 'ZAD',
  'Pula': 'PUY',

  // Ski Destinations
  'Zurich': 'ZRH',
  'Geneva': 'GVA',
  'Innsbruck': 'INN',
  'Salzburg': 'SZG',
  'Grenoble': 'GNB',
  'Chambery': 'CMF',

  // Scandinavia
  'Bergen': 'BGO',
  'Tromso': 'TOS',
  'Gothenburg': 'GOT',
  'Aarhus': 'AAR',
  'Turku': 'TKU',

  // Other
  'Luxembourg': 'LUX',
  'Malta': 'MLA',
  'Eindhoven': 'EIN',
  'Rotterdam': 'RTM',
  'Antalya': 'AYT',
  'Bodrum': 'BJV'
};

// Destination types mapping - categorize destinations by trip type
const destinationTypes = {
  // Major Western European Cities
  'Barcelona': ['city', 'beach'],
  'Amsterdam': ['city'],
  'Prague': ['city', 'cheap'],
  'Berlin': ['city'],
  'Budapest': ['city', 'cheap'],
  'Lisbon': ['city', 'beach'],
  'Paris': ['city', 'luxury'],
  'Rome': ['city'],
  'Dublin': ['city'],
  'Edinburgh': ['city'],
  'Madrid': ['city'],
  'Vienna': ['city', 'luxury'],
  'Brussels': ['city'],
  'Copenhagen': ['city'],
  'Stockholm': ['city'],
  'Oslo': ['city'],
  'Helsinki': ['city'],

  // Spanish Beach Destinations (very popular from UK)
  'Palma': ['beach', 'cheap'],
  'Mallorca': ['beach', 'cheap'],
  'Ibiza': ['beach', 'luxury'],
  'Menorca': ['beach', 'cheap'],
  'Alicante': ['beach', 'cheap'],
  'Benidorm': ['beach', 'cheap'],
  'Malaga': ['beach', 'cheap'],
  'Tenerife': ['beach', 'cheap'],
  'Gran Canaria': ['beach', 'cheap'],
  'Lanzarote': ['beach', 'cheap'],
  'Fuerteventura': ['beach', 'cheap'],

  // Spanish Cities
  'Seville': ['city', 'cheap'],
  'Valencia': ['city', 'beach', 'cheap'],
  'Bilbao': ['city'],
  'Granada': ['city', 'cheap'],
  'Santiago de Compostela': ['city'],

  // Portuguese Destinations
  'Porto': ['city', 'cheap'],
  'Faro': ['beach', 'cheap'],
  'Algarve': ['beach', 'cheap'],

  // Greek Destinations (popular & cheap)
  'Athens': ['city', 'beach', 'cheap'],
  'Santorini': ['beach', 'luxury'],
  'Mykonos': ['beach', 'luxury'],
  'Rhodes': ['beach', 'cheap'],
  'Corfu': ['beach', 'cheap'],
  'Heraklion': ['beach', 'cheap'],
  'Crete': ['beach', 'cheap'],
  'Chania': ['beach', 'cheap'],
  'Kos': ['beach', 'cheap'],
  'Zakynthos': ['beach', 'cheap'],
  'Thessaloniki': ['city', 'beach', 'cheap'],

  // Italian Cities
  'Venice': ['city', 'luxury'],
  'Milan': ['city', 'luxury'],
  'Florence': ['city'],
  'Naples': ['city', 'beach', 'cheap'],
  'Bologna': ['city'],
  'Turin': ['city', 'ski'],
  'Verona': ['city'],
  'Genoa': ['city'],
  'Pisa': ['city'],
  'Bergamo': ['city'],

  // Italian Islands
  'Catania': ['beach', 'cheap'],
  'Palermo': ['city', 'beach', 'cheap'],
  'Cagliari': ['beach', 'cheap'],
  'Olbia': ['beach', 'cheap'],
  'Bari': ['city', 'beach', 'cheap'],
  'Brindisi': ['beach', 'cheap'],

  // French Cities
  'Nice': ['beach', 'luxury'],
  'Lyon': ['city'],
  'Marseille': ['city', 'beach'],
  'Bordeaux': ['city'],
  'Toulouse': ['city'],
  'Strasbourg': ['city'],
  'Nantes': ['city'],
  'Montpellier': ['city', 'beach'],

  // German Cities
  'Munich': ['city'],
  'Hamburg': ['city'],
  'Frankfurt': ['city'],
  'Cologne': ['city'],
  'Dusseldorf': ['city'],
  'Stuttgart': ['city'],
  'Dresden': ['city'],
  'Nuremberg': ['city'],
  'Bremen': ['city'],
  'Hannover': ['city'],
  'Leipzig': ['city'],

  // Eastern European Budget Cities
  'Warsaw': ['city', 'cheap'],
  'Krakow': ['city', 'cheap'],
  'Gdansk': ['city', 'cheap'],
  'Wroclaw': ['city', 'cheap'],
  'Poznan': ['city', 'cheap'],
  'Zagreb': ['city', 'cheap'],
  'Belgrade': ['city', 'cheap'],
  'Bucharest': ['city', 'cheap'],
  'Sofia': ['city', 'cheap'],
  'Riga': ['city', 'cheap'],
  'Tallinn': ['city', 'cheap'],
  'Vilnius': ['city', 'cheap'],
  'Bratislava': ['city', 'cheap'],
  'Ljubljana': ['city', 'cheap'],
  'Sarajevo': ['city', 'cheap'],
  'Skopje': ['city', 'cheap'],
  'Tirana': ['city', 'cheap'],

  // Croatian Coast (beach + budget)
  'Dubrovnik': ['beach', 'city'],
  'Split': ['beach', 'cheap'],
  'Zadar': ['beach', 'cheap'],
  'Pula': ['beach', 'cheap'],

  // Ski Destinations
  'Zurich': ['city', 'luxury', 'ski'],
  'Geneva': ['city', 'luxury', 'ski'],
  'Innsbruck': ['ski', 'city'],
  'Salzburg': ['ski', 'city'],
  'Grenoble': ['ski'],
  'Chambery': ['ski'],
  'Reykjavik': ['ski', 'luxury'],

  // Scandinavia
  'Bergen': ['city', 'ski'],
  'Tromso': ['ski'],
  'Gothenburg': ['city'],
  'Aarhus': ['city'],
  'Turku': ['city'],

  // Other Popular Destinations
  'Luxembourg': ['city'],
  'Malta': ['beach', 'cheap'],
  'Eindhoven': ['city', 'cheap'],
  'Rotterdam': ['city'],
  'Antalya': ['beach', 'cheap'],
  'Bodrum': ['beach', 'cheap'],
};

// Get destination types for a city
const getDestinationTypes = (cityName) => {
  return destinationTypes[cityName] || ['city']; // Default to city if not found
};

export default function HolidayPlanner() {
  const [step, setStep] = useState(1);
  const [travelers, setTravelers] = useState([{ id: 1, name: '', origin: '', luggage: 'hand', airports: [], selectedAirport: '', excludedAirports: [] }]);
  const [tripType, setTripType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [maxBudget, setMaxBudget] = useState(150);
  const [customDestination, setCustomDestination] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [sortBy, setSortBy] = useState('avgPrice');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyShown, setSurveyShown] = useState(false);
  const [surveyData, setSurveyData] = useState({ wouldUse: '', wouldBook: '', email: '', feedback: '' });
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAnywhere, setShowAnywhere] = useState(false);

  // API integration state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightData, setFlightData] = useState({});
  const [searchingAirports, setSearchingAirports] = useState({});
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [airportSearchLog, setAirportSearchLog] = useState([]);

  // New filter states
  const [directFlightsOnly, setDirectFlightsOnly] = useState(false);
  const [maxStops, setMaxStops] = useState(null); // null = any, 0 = direct, 1 = max 1 stop, 2 = max 2 stops
  const [checkAllAirports, setCheckAllAirports] = useState(false); // Toggle for smart airport limiting
  const [apiCallStats, setApiCallStats] = useState({ total: 0, cacheHits: 0, byEndpoint: {} });

  // Debug mode state - hidden by default, toggle with Ctrl+Shift+D
  const [debugMode, setDebugMode] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null); // Store traveler id to confirm removal
  const [showDuplicateModal, setShowDuplicateModal] = useState(null); // Store traveler to duplicate
  const [duplicateName, setDuplicateName] = useState(''); // Name for duplicated traveler

  // Refs for debouncing
  const searchTimeoutRef = useRef({});

  // Listen for API call updates
  React.useEffect(() => {
    const handleApiCallUpdate = (event) => {
      setApiCallStats(event.detail);
    };

    window.addEventListener('apiCallUpdate', handleApiCallUpdate);
    return () => window.removeEventListener('apiCallUpdate', handleApiCallUpdate);
  }, []);

  // Debug mode keyboard shortcut (Ctrl+Shift+D)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugMode(prev => {
          const newMode = !prev;
          console.log(`🔧 Debug mode ${newMode ? 'ENABLED' : 'DISABLED'}`);
          return newMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate weighted score (lower is better)
  const calculateWeightedScore = (price, distanceMiles) => {
    const distancePenalty = distanceMiles * 0.5; // 50p per mile
    return price + distancePenalty;
  };

  // Debounced airport search
  const searchAirportsForCity = async (travelerId, cityName) => {
    console.log('🔍 searchAirportsForCity called:', { travelerId, cityName });

    const logEntry = { travelerId, cityName, timestamp: new Date().toISOString() };

    if (!cityName || cityName.length < 3) {
      console.log('⚠️ cityName too short or empty:', cityName);
      logEntry.result = 'City name too short';
      setAirportSearchLog(prev => [...prev, logEntry]);
      return;
    }

    setSearchingAirports(prev => ({ ...prev, [travelerId]: true }));

    try {
      // Check if we have predefined airports for this city (trim spaces and lowercase)
      const cityKey = Object.keys(cityToAirportsMap).find(
        key => key.toLowerCase() === cityName.toLowerCase().trim()
      );

      console.log('🗺️ Looking for city:', cityName.toLowerCase().trim(), 'Found match:', cityKey);

      if (cityKey) {
        // Use predefined airport list with distances
        const airports = cityToAirportsMap[cityKey];
        console.log('✅ Using predefined airports for', cityKey, ':', airports);
        logEntry.result = `Found in predefined list: ${airports.length} airports`;
        logEntry.airports = airports.map(a => a.code).join(', ');
        updateTraveler(travelerId, 'airports', airports);
        updateTraveler(travelerId, 'selectedAirport', airports[0].code);
      } else {
        // Fall back to API search - ONLY get AIRPORT codes, not city codes
        console.log('🌐 Falling back to API search for:', cityName);
        const airports = await AmadeusAPI.searchAirports(cityName);
        console.log('📡 API returned:', airports);
        const formatted = airports
          .filter(airport => airport.subType === 'AIRPORT') // Only airports!
          .slice(0, 5)
          .map(airport => ({
            code: airport.iataCode,
            name: airport.name,
            distance: 15, // Default distance if unknown
          }));

        console.log('✈️ Formatted airports:', formatted);

        if (formatted.length > 0) {
          logEntry.result = `API search: ${formatted.length} airports`;
          logEntry.airports = formatted.map(a => a.code).join(', ');
          updateTraveler(travelerId, 'airports', formatted);
          updateTraveler(travelerId, 'selectedAirport', formatted[0].code);
        } else {
          console.log('❌ No airports found after filtering');
          logEntry.result = 'API search found 0 airports';
        }
      }
    } catch (err) {
      console.error('❌ Airport search failed:', err);
      logEntry.result = `Error: ${err.message}`;
    } finally {
      setSearchingAirports(prev => ({ ...prev, [travelerId]: false }));
      setAirportSearchLog(prev => [...prev, logEntry]);
    }
  };

  const debouncedAirportSearch = (travelerId, cityName) => {
    if (searchTimeoutRef.current[travelerId]) {
      clearTimeout(searchTimeoutRef.current[travelerId]);
    }
    
    searchTimeoutRef.current[travelerId] = setTimeout(() => {
      searchAirportsForCity(travelerId, cityName);
    }, 800);
  };

  const addTraveler = () => {
    setTravelers([...travelers, { id: Date.now(), name: '', origin: '', luggage: 'hand', airports: [], selectedAirport: '', excludedAirports: [] }]);
  };

  const duplicateTraveler = (travelerToDuplicate) => {
    // Show modal to get name for duplicated traveler
    setDuplicateName(travelerToDuplicate.name ? `${travelerToDuplicate.name} (copy)` : '');
    setShowDuplicateModal(travelerToDuplicate);
  };

  const confirmDuplicateTraveler = () => {
    if (showDuplicateModal) {
      // Create a copy of the traveler with a new ID and the entered name
      const newTraveler = {
        ...showDuplicateModal,
        id: Date.now(),
        name: duplicateName
      };
      setTravelers([...travelers, newTraveler]);
      setShowDuplicateModal(null);
      setDuplicateName('');
    }
  };

  const removeTraveler = (id) => {
    if (travelers.length > 1) {
      setShowRemoveConfirm(id);
    }
  };

  const confirmRemoveTraveler = (id) => {
    setTravelers(travelers.filter(t => t.id !== id));
    setShowRemoveConfirm(null);
  };

  const updateTraveler = (id, field, value) => {
    setTravelers(prevTravelers => prevTravelers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleOriginChange = (id, value) => {
    updateTraveler(id, 'origin', value);
    if (value.length >= 3) {
      debouncedAirportSearch(id, value);
    }
  };

  // Smart airport limiting: decide which airports to check for a traveler
  const getAirportsToCheck = (traveler) => {
    let airportsToCheck = traveler.airports || [];

    // Filter out excluded airports
    if (traveler.excludedAirports && traveler.excludedAirports.length > 0) {
      airportsToCheck = airportsToCheck.filter(
        airport => !traveler.excludedAirports.includes(airport.code)
      );
    }

    // If checkAllAirports is enabled, return all non-excluded airports
    if (checkAllAirports) {
      return airportsToCheck;
    }

    // Check if this is a major hub city (check all airports for these)
    const isMajorHub = MAJOR_HUB_CITIES.some(
      hubCity => traveler.origin && traveler.origin.toLowerCase().includes(hubCity.toLowerCase())
    );

    if (isMajorHub) {
      console.log(`    🏙️ ${traveler.origin} is a major hub - checking all ${airportsToCheck.length} airports`);
      return airportsToCheck;
    }

    // For non-hub cities, limit to 2-3 closest airports
    const limitedAirports = airportsToCheck
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    if (limitedAirports.length < airportsToCheck.length) {
      console.log(`    ✂️ Smart limiting: ${traveler.origin} - checking ${limitedAirports.length}/${airportsToCheck.length} airports`);
    }

    return limitedAirports;
  };

  // Get current flight filters
  const getFlightFilters = () => {
    const filters = {};

    if (directFlightsOnly) {
      filters.nonStop = true;
    } else if (maxStops !== null && maxStops !== undefined) {
      filters.maxStops = maxStops;
    }

    return filters;
  };

  // Calculate price metrics for a destination across all travelers
  const calculateDestinationPrices = async (destinationCode) => {
    try {
      console.log(`  💵 Calculating prices for ${destinationCode}...`);
      const pricePromises = travelers.map(async (traveler) => {
        const airportsToCheck = getAirportsToCheck(traveler);
        if (airportsToCheck.length === 0) {
          console.log(`    ⚠️ ${traveler.name || traveler.origin}: No airports available`);
          return null;
        }

        const filters = getFlightFilters();

        // Search from selected airports for this traveler
        const flightSearches = airportsToCheck.map(async (airport) => {
          const flights = await AmadeusAPI.searchFlights(airport.code, destinationCode, dateFrom, 1, dateTo, filters);
          console.log(`    ${airport.code} -> ${destinationCode}: ${flights.length} flights`);
          if (flights.length === 0) return null;

          // Get cheapest flight from this airport
          const cheapest = flights.reduce((min, flight) => {
            const price = parseFloat(flight.price.total);
            return price < parseFloat(min.price.total) ? flight : min;
          }, flights[0]);

          return {
            price: parseFloat(cheapest.price.total),
            weightedScore: calculateWeightedScore(parseFloat(cheapest.price.total), airport.distance)
          };
        });

        const results = await Promise.all(flightSearches);
        const validResults = results.filter(r => r !== null);

        if (validResults.length === 0) {
          console.log(`    ❌ ${traveler.name || traveler.origin}: No flights found from any airport`);
          return null;
        }

        // Get best option (lowest weighted score)
        const best = validResults.reduce((best, current) =>
          current.weightedScore < best.weightedScore ? current : best
        );
        console.log(`    ✓ ${traveler.name || traveler.origin}: Best price £${best.price}`);
        return best;
      });

      const prices = await Promise.all(pricePromises);
      const validPrices = prices.filter(p => p !== null).map(p => p.price);

      if (validPrices.length === 0) {
        console.log(`  ❌ ${destinationCode}: No valid prices found for any traveler`);
        return null;
      }

      const result = {
        avgPrice: Math.round(validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length),
        minPrice: Math.round(Math.min(...validPrices)),
        maxPrice: Math.round(Math.max(...validPrices)),
        deviation: Math.round(Math.max(...validPrices) - Math.min(...validPrices))
      };

      console.log(`  ✅ ${destinationCode}: avg £${result.avgPrice}, range £${result.minPrice}-£${result.maxPrice}`);
      return result;
    } catch (err) {
      console.error(`❌ Error calculating prices for ${destinationCode}:`, err);
      return null;
    }
  };

  const goToDestinations = async () => {
    if (travelers.every(t => t.selectedAirport) && dateFrom) {
      setStep(2);

      // Fetch available destinations from all travelers' airports
      setLoadingDestinations(true);
      try {
        const uniqueAirports = [...new Set(travelers.map(t => t.selectedAirport))];
        console.log('🔍 Fetching destinations from airports:', uniqueAirports);

        // Fetch destinations from each unique airport
        const destinationPromises = uniqueAirports.map(airport =>
          AmadeusAPI.searchDestinations(airport)
        );

        const results = await Promise.all(destinationPromises);

        // Combine and deduplicate destinations
        const allDestinations = results.flat();
        const destinationMap = new Map();

        allDestinations.forEach(dest => {
          const iataCode = dest.destination;
          if (!destinationMap.has(iataCode)) {
            destinationMap.set(iataCode, {
              code: iataCode,
              count: 1,
            });
          } else {
            const existing = destinationMap.get(iataCode);
            existing.count++;
          }
        });

        // Convert to array - include ALL unique destinations, not just top 30
        // Previously: sorted by count and took only top 30, which filtered out destinations
        // unique to minority airports (e.g., Birmingham when most travelers are from London)
        const topDestinations = Array.from(destinationMap.entries())
          .sort((a, b) => b[1].count - a[1].count)
          // Removed .slice(0, 30) to show ALL destinations from ALL origin airports
          .map(([code, data]) => ({
            code,
            ...data
          }));

        console.log('✅ Found destinations:', topDestinations);

        // Get city names and calculate price metrics for each destination
        console.log('💰 Calculating price metrics for destinations...');
        const destinationsWithPrices = await Promise.all(
          topDestinations.map(async (dest) => {
            const cityName = Object.entries(destinationAirportMap).find(([city, code]) => code === dest.code)?.[0];
            const priceMetrics = await calculateDestinationPrices(dest.code);

            if (!priceMetrics) return null;

            return {
              city: cityName || dest.code,
              code: dest.code,
              count: dest.count,
              types: cityName ? getDestinationTypes(cityName) : ['city'],
              ...priceMetrics
            };
          })
        );

        const validDestinations = destinationsWithPrices.filter(d => d !== null);
        console.log('✅ Price metrics calculated for', validDestinations.length, 'destinations');

        setAvailableDestinations(validDestinations);
      } catch (err) {
        console.error('❌ Failed to fetch destinations:', err);
        setAvailableDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    }
  };

  // Get color scheme for traveler cards
  const getTravelerColor = (index) => {
    const colors = [
      { border: 'border-purple-400', bg: 'bg-purple-50', gradient: 'from-purple-400 to-purple-600' },
      { border: 'border-pink-400', bg: 'bg-pink-50', gradient: 'from-pink-400 to-pink-600' },
      { border: 'border-blue-400', bg: 'bg-blue-50', gradient: 'from-blue-400 to-blue-600' },
      { border: 'border-green-400', bg: 'bg-green-50', gradient: 'from-green-400 to-green-600' },
      { border: 'border-orange-400', bg: 'bg-orange-50', gradient: 'from-orange-400 to-orange-600' },
      { border: 'border-teal-400', bg: 'bg-teal-50', gradient: 'from-teal-400 to-teal-600' },
    ];
    return colors[index % colors.length];
  };

  const searchFlightsForDestination = async (destinationCity) => {
    setLoading(true);
    setError(null);
    setSurveyShown(false); // Reset survey state for new search

    try {
      console.log('🚀 Starting flight search for:', destinationCity);
      console.log('📅 Date:', dateFrom);
      console.log('👥 Travelers:', travelers);

      // Get destination airport code
      let destinationCode = destinationAirportMap[destinationCity];

      if (!destinationCode) {
        const destAirports = await AmadeusAPI.searchAirports(destinationCity);
        const airportOnly = destAirports.filter(a => a.subType === 'AIRPORT');
        if (airportOnly.length === 0) {
          throw new Error(`No airports found for ${destinationCity}`);
        }
        destinationCode = airportOnly[0].iataCode;
      }

      console.log('🎯 Destination airport code:', destinationCode);

      const filters = getFlightFilters();

      // Search flights for each traveler from selected nearby airports
      const flightPromises = travelers.map(async (traveler) => {
        const airportsToCheck = getAirportsToCheck(traveler);
        console.log(`👤 ${traveler.name || traveler.origin}: Checking ${airportsToCheck.length} airports`, airportsToCheck);

        if (airportsToCheck.length === 0) {
          console.warn(`⚠️ No airports available for ${traveler.name || traveler.origin}`);
          return null;
        }

        // Search from selected airports
        const allFlightSearches = airportsToCheck.map(async (airport) => {
          const flights = await AmadeusAPI.searchFlights(airport.code, destinationCode, dateFrom, 1, dateTo, filters);
          console.log(`  ✈️ ${airport.code} -> ${destinationCode}: ${flights.length} flights found`);

          // Add airport info and weighted score to each flight
          return flights.map(flight => ({
            ...flight,
            departureAirport: airport,
            weightedScore: calculateWeightedScore(parseFloat(flight.price.total), airport.distance)
          }));
        });

        const allResults = await Promise.all(allFlightSearches);
        const allFlights = allResults.flat().filter(f => f);

        console.log(`  📊 Total flights for ${traveler.name || traveler.origin}:`, allFlights.length);

        if (allFlights.length === 0) {
          console.warn(`  ⚠️ No flights found for ${traveler.name || traveler.origin}`);
          return null;
        }

        // Sort by weighted score (price + distance penalty)
        const sortedFlights = allFlights.sort((a, b) => a.weightedScore - b.weightedScore);

        return {
          travelerId: traveler.id,
          flights: sortedFlights.slice(0, 5), // Top 5 options
          cheapest: sortedFlights[0], // Best weighted option
          allAirportOptions: airportsToCheck.length
        };
      });

      const results = await Promise.all(flightPromises);
      const flightMap = {};
      let foundFlights = 0;
      results.forEach(result => {
        if (result) {
          flightMap[result.travelerId] = result;
          foundFlights++;
        }
      });

      console.log('✅ Flight search complete. Found flights for', foundFlights, 'out of', travelers.length, 'travelers');
      console.log('📦 Flight data:', flightMap);

      // Collect debug information
      const debug = {
        timestamp: new Date().toISOString(),
        destination: destinationCity,
        destinationCode,
        dateFrom,
        dateTo,
        tripType: dateTo ? 'round-trip' : 'one-way',
        totalTravelers: travelers.length,
        foundFlights,
        travelers: travelers.map(t => ({
          name: t.name || t.origin,
          origin: t.origin,
          airportsCount: t.airports?.length || 0,
          airports: t.airports?.map(a => a.code).join(', ') || 'None',
          hasFlights: !!flightMap[t.id],
          flightCount: flightMap[t.id]?.flights?.length || 0,
          cheapestPrice: flightMap[t.id]?.cheapest?.price?.total || 'N/A',
          itineraries: flightMap[t.id]?.cheapest?.itineraries?.length || 0
        }))
      };
      setDebugInfo(debug);

      if (foundFlights === 0) {
        setError('No flights found for the selected date and destination. Try a different date or destination.');
      }

      setFlightData(flightMap);
      setShowResults(true);

      // UX Improvement: Removed auto-opening survey modal - it was intrusive
      // Survey is still available, but user must click "Share Booking Links" to access it
      // if (!surveyShown && foundFlights > 0) {
      //   setTimeout(() => {
      //     setShowSurveyModal(true);
      //     setSurveyShown(true);
      //   }, 5000);
      // }
    } catch (err) {
      setError(err.message);
      console.error('❌ Flight search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = () => {
    const dest = selectedDestination || customDestination;
    if (dest) {
      searchFlightsForDestination(dest);
    }
  };

  const calculateFairnessScore = () => {
    const costs = travelers.map(t => {
      const data = flightData[t.id];
      if (data && data.cheapest) {
        return parseFloat(data.cheapest.price.total);
      }
      return 0;
    }).filter(c => c > 0);

    if (costs.length === 0) return 0;

    const avg = costs.reduce((s, c) => s + c, 0) / costs.length;
    const maxDiff = Math.max(...costs.map(c => Math.abs(c - avg)));
    return Math.round(Math.max(0, 100 - (maxDiff / avg * 100)));
  };

  const getFairnessDetails = () => {
    const dest = selectedDestination || customDestination;
    if (!showResults || !dest) return null;

    const costs = travelers.map(t => {
      const data = flightData[t.id];
      if (!data || !data.cheapest) return null;
      
      const price = parseFloat(data.cheapest.price.total);
      const airport = data.cheapest.departureAirport;
      
      return {
        name: t.name || `From ${t.origin}`,
        cost: price,
        airport: `${airport.name} (${airport.code})`,
        distance: airport.distance
      };
    }).filter(c => c !== null);

    if (costs.length === 0) return null;

    const avg = costs.reduce((s, c) => s + c.cost, 0) / costs.length;

    return {
      score: calculateFairnessScore(),
      travelers: costs.map(c => ({ ...c, diffFromAvg: c.cost - avg })),
      avgCost: Math.round(avg)
    };
  };

  const generateShareLink = () => {
    const dest = selectedDestination || customDestination;
    const data = { travelers, tripType, dateFrom, dateTo, maxBudget, destination: dest };
    return `${window.location.origin}${window.location.pathname}?trip=${btoa(JSON.stringify(data))}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(generateShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sort and filter destinations based on selected sorting method and trip type
  const getSortedDestinations = () => {
    if (availableDestinations.length === 0) return [];

    // First filter by trip type
    let filtered = [...availableDestinations];
    if (tripType !== 'all') {
      filtered = filtered.filter(d => d.types && d.types.includes(tripType));
    }

    // Then sort
    if (sortBy === 'avgPrice') {
      filtered.sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sortBy === 'deviation') {
      filtered.sort((a, b) => a.deviation - b.deviation);
    } else if (sortBy === 'minPrice') {
      filtered.sort((a, b) => a.minPrice - b.minPrice);
    }

    return filtered;
  };

  const destinationsToShow = getSortedDestinations();

  const destination = selectedDestination || customDestination;
  const fairness = getFairnessDetails();

  const canProceed = travelers.every(t => t.selectedAirport) && dateFrom;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 sm:p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-float" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Squad Flight Finder</h1>
          </div>
          <p className="text-white/90 text-xs sm:text-sm">Find the fairest meeting spot</p>
          {debugMode && (
            <div className="mt-3 inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
              🔧 Debug Mode Active (Ctrl+Shift+D to toggle)
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <X className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Step Indicator */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
              <p className="text-white text-sm font-semibold text-center">
                Step 1 of 2: Plan Your Trip
              </p>
            </div>
            <div className="p-4 sm:p-5 space-y-6">
              {/* Budget Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Budget per Person
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  This is a guide for destination filtering. Flight prices within your budget will be prioritized.
                </p>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-purple-600">£{maxBudget}</span>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(parseInt(e.target.value) || 30)}
                      min="30"
                      max="500"
                      className="w-20 px-2 py-1 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 text-center focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="500"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>£30</span>
                    <span>£500</span>
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Travel Dates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Departure Date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Return Date <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500">
                      {dateTo ? '✓ Prices will show total round-trip cost' : 'Leave empty for one-way flights'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight Filters Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  Flight Filters
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
                  {/* Direct Flights */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={directFlightsOnly}
                      onChange={(e) => {
                        setDirectFlightsOnly(e.target.checked);
                        if (e.target.checked) setMaxStops(null);
                      }}
                      className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        Direct flights only
                      </span>
                      <p className="text-xs text-gray-500">No layovers or connections</p>
                    </div>
                  </label>

                  {/* Max Stops */}
                  {!directFlightsOnly && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Maximum Stops</label>
                      <select
                        value={maxStops === null ? 'any' : maxStops}
                        onChange={(e) => setMaxStops(e.target.value === 'any' ? null : parseInt(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all bg-white"
                      >
                        <option value="any">Any number of stops</option>
                        <option value="0">Direct only</option>
                        <option value="1">Max 1 stop</option>
                        <option value="2">Max 2 stops</option>
                      </select>
                    </div>
                  )}

                  {/* Check All Airports */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checkAllAirports}
                      onChange={(e) => setCheckAllAirports(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        Check all nearby airports
                      </span>
                      <p className="text-xs text-gray-500">
                        {checkAllAirports
                          ? 'Checking all airports (more API calls, better prices)'
                          : 'Smart limiting: checks 2-3 closest airports (fewer API calls)'}
                      </p>
                    </div>
                  </label>

                  {/* API Call Counter - Debug Mode Only */}
                  {debugMode && (
                    <div className="mt-4 pt-3 border-t border-blue-200/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">API Calls:</span>
                        <div className="flex gap-3">
                          <span className="text-blue-600 font-bold">{apiCallStats.total} total</span>
                          {apiCallStats.cacheHits > 0 && (
                            <span className="text-green-600 font-bold">✓ {apiCallStats.cacheHits} cached</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Squad Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Your Squad
                  </h2>
                  {travelers.length < 10 && (
                    <button
                      onClick={addTraveler}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Person
                    </button>
                  )}
                </div>

                {/* Traveler Cards - Simple Stacked */}
                <div className="space-y-2">
                  {travelers.map((t, i) => {
                    const colors = getTravelerColor(i);
                    return (
                      <div
                        key={t.id}
                        className={`relative p-4 rounded-2xl border-2 ${colors.border} ${colors.bg} shadow-md hover:shadow-lg transition-all`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.gradient} text-white font-bold text-xs`}>
                            {t.name || `Person ${i + 1}`}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => duplicateTraveler(t)}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-all font-semibold flex items-center gap-1"
                              title="Duplicate this traveler"
                            >
                              <Copy className="w-3 h-3" />
                              Duplicate
                            </button>
                            {travelers.length > 1 && (
                              <button
                                onClick={() => removeTraveler(t.id)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-all"
                                title="Remove this traveler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Name (optional)"
                            value={t.name}
                            onChange={(e) => updateTraveler(t.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                          />
                          <div>
                            <input
                              type="text"
                              placeholder="City name (e.g., London, Paris, New York)"
                              value={t.origin}
                              onChange={(e) => handleOriginChange(t.id, e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                            />
                            {!t.origin && (
                              <p className="text-xs text-gray-500 mt-1">
                                We'll automatically find nearby airports
                              </p>
                            )}
                          </div>

                          {/* Airport Search Status */}
                          {searchingAirports[t.id] && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded-lg">
                              <div className="animate-spin w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full" />
                              Finding nearby airports...
                            </div>
                          )}

                          {/* Found Airports with Include Options */}
                          {t.airports && t.airports.length > 0 && (
                            <div className="bg-white border-2 border-green-300 rounded-xl p-2">
                              <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {t.airports.length} airport{t.airports.length > 1 ? 's' : ''} found - Check to include:
                              </p>
                              <div className="text-xs text-gray-700 space-y-1.5">
                                {t.airports.map((a) => {
                                  const isExcluded = t.excludedAirports && t.excludedAirports.includes(a.code);
                                  return (
                                    <label key={a.code} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={!isExcluded}
                                        onChange={(e) => {
                                          const excluded = t.excludedAirports || [];
                                          if (e.target.checked) {
                                            // Remove from excluded list
                                            updateTraveler(t.id, 'excludedAirports', excluded.filter(code => code !== a.code));
                                          } else {
                                            // Add to excluded list
                                            updateTraveler(t.id, 'excludedAirports', [...excluded, a.code]);
                                          }
                                        }}
                                        className="w-3.5 h-3.5 text-green-600 rounded border-gray-300"
                                      />
                                      <span className="flex-1">{a.name} ({a.code})</span>
                                      <span className="text-gray-500">{a.distance}mi</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Luggage <span className="text-gray-500 font-normal">(affects price)</span>
                            </label>
                            <select
                              value={t.luggage}
                              onChange={(e) => updateTraveler(t.id, 'luggage', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all bg-white"
                            >
                              <option value="hand">Hand bag only (cheapest)</option>
                              <option value="cabin">Cabin bag 10kg</option>
                              <option value="checked">Checked baggage</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trip Preferences */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Trip Preferences
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    onClick={() => setTripType('all')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      tripType === 'all'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Globe className={`w-5 h-5 mx-auto mb-1 ${tripType === 'all' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${tripType === 'all' ? 'text-purple-600' : 'text-gray-600'}`}>
                      All
                    </p>
                  </button>
                  <button
                    onClick={() => setTripType('city')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      tripType === 'city'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 mx-auto mb-1 ${tripType === 'city' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${tripType === 'city' ? 'text-purple-600' : 'text-gray-600'}`}>
                      City
                    </p>
                  </button>
                  <button
                    onClick={() => setTripType('beach')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      tripType === 'beach'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Palmtree className={`w-5 h-5 mx-auto mb-1 ${tripType === 'beach' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${tripType === 'beach' ? 'text-purple-600' : 'text-gray-600'}`}>
                      Beach
                    </p>
                  </button>
                  <button
                    onClick={() => setTripType('ski')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      tripType === 'ski'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Mountain className={`w-5 h-5 mx-auto mb-1 ${tripType === 'ski' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${tripType === 'ski' ? 'text-purple-600' : 'text-gray-600'}`}>
                      Ski
                    </p>
                  </button>
                  <button
                    onClick={() => setTripType('cheap')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      tripType === 'cheap'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Coffee className={`w-5 h-5 mx-auto mb-1 ${tripType === 'cheap' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${tripType === 'cheap' ? 'text-purple-600' : 'text-gray-600'}`}>
                      Budget
                    </p>
                  </button>
                  <button
                    onClick={() => setTripType('luxury')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      tripType === 'luxury'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Gem className={`w-5 h-5 mx-auto mb-1 ${tripType === 'luxury' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-xs font-bold ${tripType === 'luxury' ? 'text-purple-600' : 'text-gray-600'}`}>
                      Luxury
                    </p>
                  </button>
                </div>
              </div>

              {/* Airport Search Debug Panel - Debug Mode Only */}
              {debugMode && airportSearchLog.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4" />
                    Airport Search Log ({airportSearchLog.length} searches)
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {airportSearchLog.map((log, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 text-xs">
                        <p className="font-semibold text-gray-800">City: "{log.cityName}"</p>
                        <p className={`${log.airports ? 'text-green-700' : 'text-red-700'} font-medium`}>
                          {log.result}
                        </p>
                        {log.airports && (
                          <p className="text-gray-600 mt-1">Airports: {log.airports}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Find Destinations Button */}
              <div className="pt-4">
                <button
                  onClick={goToDestinations}
                  disabled={!canProceed}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Find Destinations
                  <ArrowRight className="w-5 h-5" />
                </button>
                {!canProceed && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Please fill in all traveler cities and select dates to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            {/* Step Indicator */}
            <div className="bg-white rounded-2xl shadow-lg p-3 mb-4">
              <p className="text-gray-700 text-sm font-semibold text-center">
                Step 2 of 2: Choose Your Destination
              </p>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setShowResults(false);
                setFlightData({});
                setSurveyShown(false); // Reset survey state when going back
              }}
              className="mb-6 w-full sm:w-auto px-6 py-4 text-white bg-white/20 backdrop-blur-sm rounded-xl text-base font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Setup
            </button>

            {!showResults && (
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      Choose Your Destination
                    </h2>
                    {availableDestinations.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {availableDestinations.length} Destinations
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">Ranked by price - find the best deal for your squad</p>
                  {loadingDestinations && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-600">
                      <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                      Calculating prices for all destinations...
                    </div>
                  )}
                  {!loadingDestinations && availableDestinations.length > 0 && tripType !== 'all' && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                      <span>Filtering: {tripType.charAt(0).toUpperCase() + tripType.slice(1)}</span>
                      <button
                        onClick={() => setTripType('all')}
                        className="hover:bg-purple-200 rounded-full p-1 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sorting Controls */}
                {!loadingDestinations && availableDestinations.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-purple-600" />
                        Sort by:
                      </label>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Choose how to rank destinations: average cost across all travelers, fairness (smallest price difference), or cheapest individual ticket
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSortBy('avgPrice')}
                        title="Average price across all travelers"
                        className={`p-3 rounded-xl border-2 transition-all ${
                          sortBy === 'avgPrice'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <DollarSign className={`w-5 h-5 mx-auto mb-1 ${sortBy === 'avgPrice' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className={`text-xs font-bold ${sortBy === 'avgPrice' ? 'text-purple-600' : 'text-gray-600'}`}>
                          Avg Price
                        </p>
                      </button>
                      <button
                        onClick={() => setSortBy('deviation')}
                        title="Most balanced costs - everyone pays similar amounts"
                        className={`p-3 rounded-xl border-2 transition-all ${
                          sortBy === 'deviation'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Scale className={`w-5 h-5 mx-auto mb-1 ${sortBy === 'deviation' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className={`text-xs font-bold ${sortBy === 'deviation' ? 'text-purple-600' : 'text-gray-600'}`}>
                          Fairness
                        </p>
                      </button>
                      <button
                        onClick={() => setSortBy('minPrice')}
                        title="Lowest individual ticket price"
                        className={`p-3 rounded-xl border-2 transition-all ${
                          sortBy === 'minPrice'
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <TrendingDown className={`w-5 h-5 mx-auto mb-1 ${sortBy === 'minPrice' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className={`text-xs font-bold ${sortBy === 'minPrice' ? 'text-purple-600' : 'text-gray-600'}`}>
                          Cheapest
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* "Anywhere" Option */}
                {!loadingDestinations && availableDestinations.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        setSelectedDestination('');
                        setCustomDestination('');
                        setShowAnywhere(!showAnywhere);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                        showAnywhere
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-md'
                          : 'border-gray-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-300'
                      }`}
                    >
                      <Globe className={`w-5 h-5 ${showAnywhere ? 'text-orange-600' : 'text-purple-600'}`} />
                      <span className={`font-bold ${showAnywhere ? 'text-orange-600' : 'text-purple-600'}`}>
                        {showAnywhere ? 'Showing All Destinations' : 'Show All Destinations (Anywhere)'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Destination Cards Grid */}
                {!loadingDestinations && availableDestinations.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {destinationsToShow.slice(0, showAnywhere ? destinationsToShow.length : 12).map((d) => (
                      <button
                        key={d.code}
                        onClick={() => {
                          setSelectedDestination(d.city);
                          setCustomDestination('');
                        }}
                        className={`group relative p-4 rounded-2xl border-2 text-left transition-all transform hover:scale-105 hover:shadow-2xl ${
                          selectedDestination === d.city
                            ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl'
                            : 'border-gray-200 bg-white hover:border-pink-300'
                        }`}
                      >
                        {/* City Icon */}
                        <div
                          className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center transition-all ${
                            selectedDestination === d.city
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                              : 'bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-pink-400 group-hover:to-purple-400'
                          }`}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </div>

                        {/* City Name */}
                        <p className="font-bold text-sm mb-2 text-gray-800">{d.city}</p>

                        {/* Trip Type Badge */}
                        <div className="mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                            {dateTo ? '↔ Round-trip' : '→ One-way'}
                          </span>
                        </div>

                        {/* Price Metrics */}
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Avg:</span>
                            <span className="font-bold text-purple-600">£{d.avgPrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Range:</span>
                            <span className="font-semibold text-gray-700">£{d.minPrice}-£{d.maxPrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Diff:</span>
                            <span className={`font-bold ${d.deviation < 50 ? 'text-green-600' : d.deviation < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                              £{d.deviation}
                            </span>
                          </div>
                        </div>

                        {/* Type and Fairness Badges */}
                        <div className="flex flex-wrap gap-1">
                          {d.types && d.types.slice(0, 2).map((type) => (
                            <span
                              key={type}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                selectedDestination === d.city
                                  ? 'bg-purple-200 text-purple-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {type}
                            </span>
                          ))}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              d.deviation < 50
                                ? 'bg-green-100 text-green-700'
                                : d.deviation < 100
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {d.deviation < 50 ? 'Very Fair' : d.deviation < 100 ? 'Fair' : 'Uneven'}
                          </span>
                        </div>

                        {/* Selected Checkmark */}
                        {selectedDestination === d.city && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* No destinations fallback */}
                {!loadingDestinations && availableDestinations.length === 0 && (
                  <div className="text-center py-8 bg-yellow-50 rounded-2xl border-2 border-yellow-200 mb-6">
                    <Info className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold">No destinations found with pricing data</p>
                    <p className="text-sm text-gray-600 mt-2">Try entering a custom destination below</p>
                  </div>
                )}

                {/* Custom Destination Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or enter a custom destination:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Reykjavik, Athens, Venice..."
                    value={customDestination}
                    onChange={(e) => {
                      setCustomDestination(e.target.value);
                      setSelectedDestination('');
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={searchTrips}
                  disabled={!destination || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Searching all airports for best prices...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search Flights to {destination}
                    </>
                  )}
                </button>
              </div>
            )}

            {showResults && (
              <>
                {/* Debug Panel - Debug Mode Only */}
                {debugMode && debugInfo && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 mb-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Debug Info (Tap to help diagnose issues)
                    </h3>
                    <div className="space-y-2 text-sm">
                      {airportSearchLog.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                          <p className="font-semibold text-yellow-900 mb-2">Airport Search Log ({airportSearchLog.length} searches):</p>
                          {airportSearchLog.map((log, idx) => (
                            <div key={idx} className="text-xs mb-2 pb-2 border-b border-yellow-200 last:border-0">
                              <p className="font-semibold">City: "{log.cityName}"</p>
                              <p className={log.airports ? 'text-green-700' : 'text-red-700'}>{log.result}</p>
                              {log.airports && <p className="text-gray-600">Airports: {log.airports}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-white rounded-lg p-3">
                        <p className="font-semibold text-gray-700">Search Details:</p>
                        <p className="text-gray-600">Destination: {debugInfo.destination} ({debugInfo.destinationCode})</p>
                        <p className="text-gray-600">Outbound: {debugInfo.dateFrom}</p>
                        {debugInfo.dateTo && <p className="text-gray-600">Return: {debugInfo.dateTo}</p>}
                        <p className="text-gray-600">Trip type: <span className="font-semibold">{debugInfo.tripType}</span></p>
                        <p className="text-gray-600">Found flights for: {debugInfo.foundFlights}/{debugInfo.totalTravelers} travelers</p>
                      </div>

                      {debugInfo.travelers.map((t, i) => (
                        <div key={i} className={`rounded-lg p-3 ${t.hasFlights ? 'bg-green-50' : 'bg-red-50'}`}>
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-xs">Airports found: {t.airportsCount} ({t.airports})</p>
                          <p className="text-xs">Flights found: {t.flightCount}</p>
                          {t.hasFlights && (
                            <>
                              <p className="text-xs">Cheapest: £{t.cheapestPrice}</p>
                              <p className="text-xs">Itineraries: {t.itineraries} ({t.itineraries > 1 ? 'round-trip' : 'one-way'})</p>
                            </>
                          )}
                          {!t.hasFlights && <p className="text-xs text-red-600">❌ No flights found</p>}
                          {t.airportsCount === 0 && <p className="text-xs text-red-600">⚠️ No airports assigned for "{t.origin}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fairness ? (
                  <>
                    {/* Share Button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="mb-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      Share Booking Links
                    </button>

                    {/* Fairness Score Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                            <Scale className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Fairness Score</h2>
                            <p className="text-sm text-gray-600">How balanced are the costs?</p>
                          </div>
                        </div>
                        <div
                          className={`px-6 py-3 rounded-2xl font-bold text-3xl shadow-lg ${
                            fairness.score >= 80
                              ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                              : fairness.score >= 60
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                              : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                          }`}
                        >
                          {fairness.score}%
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl mb-4">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Info className="w-4 h-4 text-purple-600" />
                          Balanced by distance - closer airports save you travel time!
                        </p>
                      </div>

                      {/* Traveler Cost Breakdown */}
                      <div className="space-y-3">
                        {fairness.travelers.map((t) => {
                          const traveler = travelers.find(traveler => (traveler.name || `From ${traveler.origin}`) === t.name);
                          const originalIndex = travelers.findIndex(traveler => (traveler.name || `From ${traveler.origin}`) === t.name);
                          const colors = getTravelerColor(originalIndex);
                          return (
                            <div
                              key={traveler?.id || t.name}
                              className={`p-4 rounded-2xl border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-lg`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="font-bold text-base text-gray-800">{t.name}</p>
                                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {t.airport}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    <Clock className="w-3 h-3 inline" /> {t.distance} miles from home
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-purple-600">£{Math.round(t.cost)}</p>
                                  {t.diffFromAvg !== 0 && (
                                    <div className="flex items-center gap-1 justify-end mt-1">
                                      {t.diffFromAvg > 0 ? (
                                        <TrendingDown className="w-4 h-4 text-red-500 rotate-180" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4 text-green-500" />
                                      )}
                                      <p
                                        className={`text-sm font-semibold ${
                                          t.diffFromAvg > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}
                                      >
                                        {t.diffFromAvg > 0 ? '+' : ''}£{Math.round(t.diffFromAvg)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Flight Details Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Plane className="w-6 h-6 text-purple-600" />
                        Best Flights to {destination}
                      </h2>

                      <div className="space-y-4">
                        {travelers.filter((t) => t.selectedAirport).map((t) => {
                          const data = flightData[t.id];
                          if (!data || !data.cheapest) return null;

                          const flight = data.cheapest;
                          const price = parseFloat(flight.price.total);
                          const outboundItinerary = flight.itineraries[0];
                          const returnItinerary = flight.itineraries[1]; // Will be undefined for one-way

                          // Debug logging
                          console.log(`📋 ${t.name || t.origin} flight details:`, {
                            totalItineraries: flight.itineraries.length,
                            hasReturn: !!returnItinerary,
                            price,
                            outboundSegments: outboundItinerary.segments.length,
                            returnSegments: returnItinerary?.segments?.length || 0
                          });

                          // Get first and last segments for proper origin/destination display
                          const outboundFirstSegment = outboundItinerary.segments[0];
                          const outboundLastSegment = outboundItinerary.segments[outboundItinerary.segments.length - 1];

                          const airport = flight.departureAirport;
                          const originalIndex = travelers.findIndex(traveler => traveler.id === t.id);
                          const colors = getTravelerColor(originalIndex);

                          return (
                            <div
                              key={t.id}
                              className={`p-5 rounded-2xl border-3 ${colors.border} bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.gradient} text-white font-bold text-sm`}>
                                  {t.name || `From ${t.origin}`}
                                </div>
                                <div className="text-right">
                                  <p className="text-3xl font-bold text-green-600">£{Math.round(price)}</p>
                                  <p className="text-xs text-gray-500">{dateTo ? 'round-trip' : 'one-way'}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {/* Outbound Flight */}
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                                  <p className="text-xs text-blue-700 font-semibold mb-2">
                                    {returnItinerary ? '→ Outbound' : '→ Flight'}
                                  </p>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="text-center">
                                        <p className="text-lg font-bold text-gray-800">{outboundFirstSegment.departure.iataCode}</p>
                                        <p className="text-xs text-gray-500">{airport.name}</p>
                                      </div>
                                      <ArrowRight className="w-5 h-5 text-purple-600" />
                                      <div className="text-center">
                                        <p className="text-lg font-bold text-gray-800">{outboundLastSegment.arrival.iataCode}</p>
                                        <p className="text-xs text-gray-500">{destination}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white p-2 rounded-lg">
                                      <p className="text-xs text-gray-500">Flight</p>
                                      <p className="text-sm font-bold text-gray-800">
                                        {outboundFirstSegment.carrierCode} {outboundFirstSegment.number}
                                        {outboundItinerary.segments.length > 1 && ` +${outboundItinerary.segments.length - 1}`}
                                      </p>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg">
                                      <p className="text-xs text-gray-500">Duration</p>
                                      <p className="text-sm font-bold text-gray-800">
                                        {outboundItinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Return Flight (if exists) */}
                                {returnItinerary && (() => {
                                  const returnFirstSegment = returnItinerary.segments[0];
                                  const returnLastSegment = returnItinerary.segments[returnItinerary.segments.length - 1];
                                  return (
                                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl">
                                      <p className="text-xs text-purple-700 font-semibold mb-2">← Return</p>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-1">
                                          <div className="text-center">
                                            <p className="text-lg font-bold text-gray-800">{returnFirstSegment.departure.iataCode}</p>
                                            <p className="text-xs text-gray-500">{destination}</p>
                                          </div>
                                          <ArrowRight className="w-5 h-5 text-purple-600" />
                                          <div className="text-center">
                                            <p className="text-lg font-bold text-gray-800">{returnLastSegment.arrival.iataCode}</p>
                                            <p className="text-xs text-gray-500">{airport.name}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white p-2 rounded-lg">
                                          <p className="text-xs text-gray-500">Flight</p>
                                          <p className="text-sm font-bold text-gray-800">
                                            {returnFirstSegment.carrierCode} {returnFirstSegment.number}
                                            {returnItinerary.segments.length > 1 && ` +${returnItinerary.segments.length - 1}`}
                                          </p>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg">
                                          <p className="text-xs text-gray-500">Duration</p>
                                          <p className="text-sm font-bold text-gray-800">
                                            {returnItinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
                                  <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Best option from {data.allAirportOptions} nearby airports
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl p-4 sm:p-5">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No Flights Found</h3>
                      <p className="text-gray-600 mb-4">We couldn't find any flights for the selected date and destination.</p>
                      <div className="text-left bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="font-bold text-sm mb-2">Try these tips:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Select a date further in the future (airlines release flights up to 11 months ahead)</li>
                          <li>• Try a different destination</li>
                          <li>• Check the browser console (F12) for detailed API responses</li>
                          <li>• Make sure you entered valid city names</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => { setShowResults(false); setFlightData({}); }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:opacity-90"
                      >
                        <ArrowLeft className="w-4 inline" /> Try Different Search
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Confirmation Dialog for Removing Traveler */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Remove Traveler?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this traveler? All their travel information will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmRemoveTraveler(showRemoveConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Traveler Modal */}
        {showDuplicateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Duplicate Traveler</h3>
              <p className="text-gray-600 mb-4">
                This will copy all details from {showDuplicateModal.name || 'this traveler'}. Enter a name for the new traveler:
              </p>
              <input
                type="text"
                placeholder="Name (optional)"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    confirmDuplicateTraveler();
                  }
                }}
                autoFocus
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateModal(null);
                    setDuplicateName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDuplicateTraveler}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
                >
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">Share Booking Links</h3>
                <button onClick={() => setShowShareModal(false)}><X className="w-5" /></button>
              </div>
              
              <p className="text-xs text-gray-600 mb-4 bg-blue-50 p-2 rounded">
                💡 We find the fairest meeting spot, then link you to trusted booking sites. We may earn a small commission if you book - at no extra cost to you.
              </p>

              {travelers.filter(t => t.selectedAirport).map((t) => {
                const data = flightData[t.id];
                if (!data || !data.cheapest) return null;

                const flight = data.cheapest;
                const price = Math.round(parseFloat(flight.price.total));
                const airport = flight.departureAirport;
                const destCode = flight.itineraries[0].segments[0].arrival.iataCode;
                const originalIndex = travelers.findIndex(traveler => traveler.id === t.id);

                return (
                  <div key={t.id} className="p-4 bg-green-50 rounded-lg mb-3">
                    <p className="font-bold">{t.name || `Person ${originalIndex + 1}`}</p>
                    <p className="text-sm text-gray-600">{airport.name} ({airport.code}) → {destination} • £{price}</p>
                    <div className="flex gap-2 mt-2">
                      <a 
                        href={`https://www.skyscanner.net/transport/flights/${airport.code}/${destCode}/${dateFrom}/?adults=1`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold text-center hover:bg-blue-700"
                      >
                        Skyscanner <ExternalLink className="w-3 inline" />
                      </a>
                      <a 
                        href={`https://www.kiwi.com/deep?from=${airport.code}&to=${destCode}&departure=${dateFrom}&return=${dateTo}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-semibold text-center hover:bg-green-700"
                      >
                        Kiwi <ExternalLink className="w-3 inline" />
                      </a>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex gap-2 mt-4">
                <input 
                  type="text" 
                  value={generateShareLink()} 
                  readOnly 
                  className="flex-1 px-3 py-2 border-2 rounded-lg bg-gray-50 text-xs" 
                />
                <button 
                  onClick={copyShareLink} 
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {copied ? <Check className="w-4" /> : <Copy className="w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSurveyModal && !surveySubmitted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">Help Us Improve! 🚀</h3>
                <button onClick={() => setShowSurveyModal(false)}><X className="w-5" /></button>
              </div>
              <p className="text-sm mb-4">Quick feedback (30 seconds):</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Did this tool help you find a fair meeting spot?</label>
                  {['Yes, exactly what I needed!', 'Somewhat helpful', 'Not really', 'No'].map(o => (
                    <label key={o} className="flex items-center gap-2 mb-1">
                      <input 
                        type="radio" 
                        name="use" 
                        value={o} 
                        checked={surveyData.wouldUse === o} 
                        onChange={(e) => setSurveyData({...surveyData, wouldUse: e.target.value})} 
                      />
                      <span className="text-sm">{o}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">What would make you MORE likely to book?</label>
                  <textarea 
                    placeholder="Features you'd need..." 
                    value={surveyData.feedback} 
                    onChange={(e) => setSurveyData({...surveyData, feedback: e.target.value})} 
                    className="w-full px-3 py-2 border-2 rounded-lg text-sm h-20" 
                  />
                </div>
                <input 
                  type="email" 
                  placeholder="your@email.com (optional)" 
                  value={surveyData.email} 
                  onChange={(e) => setSurveyData({...surveyData, email: e.target.value})} 
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm" 
                />
                <button 
                  onClick={() => { 
                    console.log('Survey:', surveyData); 
                    setSurveySubmitted(true); 
                    setTimeout(() => setShowSurveyModal(false), 2000); 
                  }} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {surveySubmitted && showSurveyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Thanks! 🎉</h3>
              <p className="text-gray-600">We'll keep you posted!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
