import React, { useState, useRef } from 'react';
import { Plane, Users, Plus, X, Search, DollarSign, Scale, Calendar, Briefcase, Palmtree, Mountain, Gem, Coffee, Share2, Copy, Check, Info, ArrowRight, ArrowLeft, Globe, ArrowUpDown, ExternalLink, TrendingDown, Clock, MapPin } from 'lucide-react';
import './App.css';

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
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(cityName)}&page[limit]=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error('Airport search error:', err);
      return [];
    }
  },

  async searchFlights(origin, destination, departureDate, adults = 1) {
    try {
      const token = await this.getAccessToken();
      const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&max=5`;
      console.log('🔍 Searching flights:', { origin, destination, departureDate, url });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(`✈️ API Response for ${origin}->${destination}:`, data);

      if (data.errors) {
        console.error('❌ API returned errors:', data.errors);
        return [];
      }

      return data.data || [];
    } catch (err) {
      console.error('❌ Flight search error:', err);
      return [];
    }
  },

  async searchDestinations(origin) {
    try {
      const token = await this.getAccessToken();
      const url = `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${origin}&max=50`;
      console.log('🌍 Searching destinations from:', origin);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(`🗺️ Available destinations from ${origin}:`, data);

      if (data.errors) {
        console.error('❌ API returned errors:', data.errors);
        return [];
      }

      return data.data || [];
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
  'Athens': 'ATH',
  'Venice': 'VCE',
  'Milan': 'MXP',
  'Florence': 'FLR',
  'Naples': 'NAP',
  'Nice': 'NCE',
  'Lyon': 'LYS',
  'Marseille': 'MRS',
  'Porto': 'OPO',
  'Warsaw': 'WAW',
  'Krakow': 'KRK',
  'Munich': 'MUC',
  'Hamburg': 'HAM',
  'Frankfurt': 'FRA',
  'Zurich': 'ZRH',
  'Geneva': 'GVA',
  'Zagreb': 'ZAG',
  'Belgrade': 'BEG',
  'Bucharest': 'OTP',
  'Sofia': 'SOF',
  'Dubrovnik': 'DBV',
  'Split': 'SPU',
  'Riga': 'RIX',
  'Tallinn': 'TLL',
  'Vilnius': 'VNO',
  'Luxembourg': 'LUX',
  'Malta': 'MLA'
};

export default function HolidayPlanner() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('squad');
  const [travelers, setTravelers] = useState([{ id: 1, name: '', origin: '', luggage: 'hand', airports: [], selectedAirport: '' }]);
  const [tripType, setTripType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [maxBudget, setMaxBudget] = useState(150);
  const [customDestination, setCustomDestination] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyShown, setSurveyShown] = useState(false);
  const [surveyData, setSurveyData] = useState({ wouldUse: '', wouldBook: '', email: '', feedback: '' });
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // API integration state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightData, setFlightData] = useState({});
  const [searchingAirports, setSearchingAirports] = useState({});
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  // Refs for debouncing
  const searchTimeoutRef = useRef({});

  // Calculate weighted score (lower is better)
  const calculateWeightedScore = (price, distanceMiles) => {
    const distancePenalty = distanceMiles * 0.5; // 50p per mile
    return price + distancePenalty;
  };

  // Debounced airport search
  const searchAirportsForCity = async (travelerId, cityName) => {
    if (!cityName || cityName.length < 3) return;
    
    setSearchingAirports(prev => ({ ...prev, [travelerId]: true }));
    
    try {
      // Check if we have predefined airports for this city (trim spaces and lowercase)
      const cityKey = Object.keys(cityToAirportsMap).find(
        key => key.toLowerCase() === cityName.toLowerCase().trim()
      );
      
      if (cityKey) {
        // Use predefined airport list with distances
        const airports = cityToAirportsMap[cityKey];
        updateTraveler(travelerId, 'airports', airports);
        updateTraveler(travelerId, 'selectedAirport', airports[0].code);
      } else {
        // Fall back to API search - ONLY get AIRPORT codes, not city codes
        const airports = await AmadeusAPI.searchAirports(cityName);
        const formatted = airports
          .filter(airport => airport.subType === 'AIRPORT') // Only airports!
          .slice(0, 5)
          .map(airport => ({
            code: airport.iataCode,
            name: airport.name,
            distance: 15, // Default distance if unknown
          }));
        
        if (formatted.length > 0) {
          updateTraveler(travelerId, 'airports', formatted);
          updateTraveler(travelerId, 'selectedAirport', formatted[0].code);
        }
      }
    } catch (err) {
      console.error('Airport search failed:', err);
    } finally {
      setSearchingAirports(prev => ({ ...prev, [travelerId]: false }));
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
    setTravelers([...travelers, { id: Date.now(), name: '', origin: '', luggage: 'hand', airports: [], selectedAirport: '' }]);
  };

  const removeTraveler = (id) => {
    if (travelers.length > 1) setTravelers(travelers.filter(t => t.id !== id));
  };

  const updateTraveler = (id, field, value) => {
    setTravelers(travelers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleOriginChange = (id, value) => {
    updateTraveler(id, 'origin', value);
    if (value.length >= 3) {
      debouncedAirportSearch(id, value);
    }
  };

  const goToDestinations = async () => {
    if (travelers.every(t => t.selectedAirport) && dateFrom && dateTo) {
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
              price: parseFloat(dest.price?.total || 999)
            });
          } else {
            const existing = destinationMap.get(iataCode);
            existing.count++;
            existing.price = Math.min(existing.price, parseFloat(dest.price?.total || 999));
          }
        });

        // Convert to array and get city names
        const topDestinations = Array.from(destinationMap.entries())
          .sort((a, b) => b[1].count - a[1].count) // Sort by availability
          .slice(0, 20)
          .map(([code, data]) => ({
            code,
            ...data
          }));

        console.log('✅ Found destinations:', topDestinations);

        // Get city names for these destinations
        const destinationsWithNames = await Promise.all(
          topDestinations.map(async (dest) => {
            const cityName = Object.entries(destinationAirportMap).find(([city, code]) => code === dest.code)?.[0];
            if (cityName) {
              return { city: cityName, ...dest };
            }
            // If not in our map, try to look it up
            return { city: dest.code, ...dest }; // Fallback to code
          })
        );

        setAvailableDestinations(destinationsWithNames.filter(d => d.city));
      } catch (err) {
        console.error('❌ Failed to fetch destinations:', err);
        // Fallback to empty, will use hard-coded list
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

      // Search flights for each traveler from ALL their nearby airports
      const flightPromises = travelers.map(async (traveler) => {
        const airportsToCheck = traveler.airports || [];
        console.log(`👤 ${traveler.name || traveler.origin}: Checking ${airportsToCheck.length} airports`, airportsToCheck);

        if (airportsToCheck.length === 0) {
          console.warn(`⚠️ No airports found for ${traveler.name || traveler.origin}`);
          return null;
        }

        // Search from ALL nearby airports
        const allFlightSearches = airportsToCheck.map(async (airport) => {
          const flights = await AmadeusAPI.searchFlights(airport.code, destinationCode, dateFrom, 1);
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

      if (foundFlights === 0) {
        setError('No flights found for the selected date and destination. Try a different date or destination.');
      }

      setFlightData(flightMap);
      setShowResults(true);

      if (!surveyShown && foundFlights > 0) {
        setTimeout(() => {
          setShowSurveyModal(true);
          setSurveyShown(true);
        }, 5000);
      }
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

  const popularDestinations = [
    { city: 'Barcelona', region: 'Spain', types: ['city', 'beach'] },
    { city: 'Amsterdam', region: 'Netherlands', types: ['city'] },
    { city: 'Prague', region: 'Czech Republic', types: ['city', 'cheap'] },
    { city: 'Berlin', region: 'Germany', types: ['city'] },
    { city: 'Budapest', region: 'Hungary', types: ['city', 'cheap'] },
    { city: 'Lisbon', region: 'Portugal', types: ['city'] },
    { city: 'Paris', region: 'France', types: ['city', 'luxury'] },
    { city: 'Rome', region: 'Italy', types: ['city'] },
    { city: 'Dublin', region: 'Ireland', types: ['city'] },
    { city: 'Edinburgh', region: 'Scotland', types: ['city'] },
  ];

  const tripTypes = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'city', name: 'City', icon: Briefcase },
    { id: 'beach', name: 'Beach', icon: Palmtree },
    { id: 'cheap', name: 'Budget', icon: Coffee },
    { id: 'luxury', name: 'Luxury', icon: Gem },
  ];

  // Use dynamic destinations if available, otherwise fallback to hard-coded
  const destinationsToShow = availableDestinations.length > 0
    ? availableDestinations.map(d => ({
        city: d.city,
        region: `From £${Math.round(d.price)}`,
        types: ['available']
      }))
    : popularDestinations;

  const filtered = tripType === 'all'
    ? destinationsToShow
    : destinationsToShow.filter(d => d.types.includes(tripType));

  const destination = selectedDestination || customDestination;
  const fairness = getFairnessDetails();

  const canProceed = travelers.every(t => t.selectedAirport) && dateFrom && dateTo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 sm:p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 pt-4 sm:pt-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Plane className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Squad Flight Finder</h1>
          </div>
          <p className="text-white/90 text-xs sm:text-sm">Find the fairest meeting spot</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <X className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Tabbed Navigation */}
            <div className="flex border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <button
                onClick={() => setActiveTab('squad')}
                className={`flex-1 py-4 px-6 font-bold text-sm sm:text-base transition-all relative ${
                  activeTab === 'squad'
                    ? 'text-purple-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Your Squad
                {activeTab === 'squad' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('dates')}
                className={`flex-1 py-4 px-6 font-bold text-sm sm:text-base transition-all relative ${
                  activeTab === 'dates'
                    ? 'text-purple-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Dates & Budget
                {activeTab === 'dates' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* Squad Tab */}
              {activeTab === 'squad' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <Users className="w-6 h-6 text-purple-600" />
                      Add Your Travelers
                    </h2>
                    {travelers.length < 10 && (
                      <button
                        onClick={addTraveler}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Person
                      </button>
                    )}
                  </div>

                  {/* Traveler Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {travelers.map((t, i) => {
                      const colors = getTravelerColor(i);
                      return (
                        <div
                          key={t.id}
                          className={`relative p-5 rounded-2xl border-3 ${colors.border} ${colors.bg} shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.gradient} text-white font-bold text-sm`}>
                              Person {i + 1}
                            </div>
                            {travelers.length > 1 && (
                              <button
                                onClick={() => removeTraveler(t.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                          {/* Input Fields */}
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Name (optional)"
                              value={t.name}
                              onChange={(e) => updateTraveler(t.id, 'name', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                            />
                            <input
                              type="text"
                              placeholder="From which city?"
                              value={t.origin}
                              onChange={(e) => handleOriginChange(t.id, e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                            />

                            {/* Airport Search Status */}
                            {searchingAirports[t.id] && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded-lg">
                                <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                                Finding nearby airports...
                              </div>
                            )}

                            {/* Found Airports */}
                            {t.airports && t.airports.length > 0 && (
                              <div className="bg-white border-2 border-green-300 rounded-xl p-3">
                                <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {t.airports.length} airport{t.airports.length > 1 ? 's' : ''} found!
                                </p>
                                <div className="text-xs text-gray-700 space-y-1">
                                  {t.airports.slice(0, 3).map((a) => (
                                    <div key={a.code} className="flex justify-between">
                                      <span>{a.name}</span>
                                      <span className="text-gray-500">{a.distance}mi</span>
                                    </div>
                                  ))}
                                  {t.airports.length > 3 && (
                                    <p className="text-gray-500 italic">+{t.airports.length - 3} more airports</p>
                                  )}
                                </div>
                              </div>
                            )}

                            <select
                              value={t.luggage}
                              onChange={(e) => updateTraveler(t.id, 'luggage', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all bg-white"
                            >
                              <option value="hand">Hand bag only</option>
                              <option value="cabin">Cabin bag (10kg)</option>
                              <option value="checked">Checked baggage</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dates & Budget Tab */}
              {activeTab === 'dates' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                      When are you traveling?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Departure Date</label>
                        <input
                          type="date"
                          value={dateFrom}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Return Date</label>
                        <input
                          type="date"
                          value={dateTo}
                          min={dateFrom || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                      Budget per Person
                    </h2>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-bold text-purple-600">£{maxBudget}</span>
                        <span className="text-sm text-gray-600">per person</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="500"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                        className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>£30</span>
                        <span>£500</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Globe className="w-6 h-6 text-purple-600" />
                      Trip Preferences
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {tripTypes.map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setTripType(t.id)}
                            className={`p-4 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                              tripType === t.id
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${tripType === t.id ? 'text-purple-600' : 'text-gray-400'}`} />
                            <p className={`text-xs font-bold ${tripType === t.id ? 'text-purple-600' : 'text-gray-600'}`}>
                              {t.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={goToDestinations}
                  disabled={!canProceed}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
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
            <button
              onClick={() => {
                setStep(1);
                setShowResults(false);
                setFlightData({});
              }}
              className="mb-6 px-5 py-3 text-white bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
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
                        Live Results
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">Select a city or enter a custom destination</p>
                  {loadingDestinations && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-600">
                      <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                      Finding available destinations...
                    </div>
                  )}
                </div>

                {/* Destination Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {filtered.map((d) => (
                    <button
                      key={d.city}
                      onClick={() => setSelectedDestination(d.city)}
                      className={`group relative p-5 rounded-2xl border-3 text-left transition-all transform hover:scale-105 hover:shadow-2xl ${
                        selectedDestination === d.city
                          ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl'
                          : 'border-gray-200 bg-white hover:border-pink-300'
                      }`}
                    >
                      {/* City Icon */}
                      <div
                        className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center transition-all ${
                          selectedDestination === d.city
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                            : 'bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-pink-400 group-hover:to-purple-400'
                        }`}
                      >
                        {d.types.includes('beach') && <Palmtree className="w-6 h-6 text-white" />}
                        {d.types.includes('city') && !d.types.includes('beach') && <Briefcase className="w-6 h-6 text-white" />}
                        {d.types.includes('luxury') && <Gem className="w-6 h-6 text-white" />}
                        {d.types.includes('cheap') && !d.types.includes('luxury') && <Coffee className="w-6 h-6 text-white" />}
                      </div>

                      {/* City Name */}
                      <p className="font-bold text-base mb-1 text-gray-800">{d.city}</p>
                      <p className="text-xs text-gray-500 mb-2">{d.region}</p>

                      {/* Type Badges */}
                      <div className="flex flex-wrap gap-1">
                        {d.types.map((type) => (
                          <span
                            key={type}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              selectedDestination === d.city
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {type}
                          </span>
                        ))}
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
                        {fairness.travelers.map((t, i) => {
                          const colors = getTravelerColor(i);
                          return (
                            <div
                              key={i}
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
                        {travelers.filter((t) => t.selectedAirport).map((t, i) => {
                          const data = flightData[t.id];
                          if (!data || !data.cheapest) return null;

                          const flight = data.cheapest;
                          const price = parseFloat(flight.price.total);
                          const segment = flight.itineraries[0].segments[0];
                          const airport = flight.departureAirport;
                          const colors = getTravelerColor(i);

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
                                  <p className="text-xs text-gray-500">per person</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-gray-800">{airport.code}</p>
                                      <p className="text-xs text-gray-500">{airport.name}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-purple-600" />
                                    <div className="text-center">
                                      <p className="text-lg font-bold text-gray-800">{segment.arrival.iataCode}</p>
                                      <p className="text-xs text-gray-500">{destination}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Flight</p>
                                    <p className="text-sm font-bold text-gray-800">
                                      {segment.carrierCode} {segment.number}
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                                    <p className="text-sm font-bold text-gray-800">
                                      {segment.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').toLowerCase()}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 p-3 rounded-xl mt-3">
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
              
              {travelers.filter(t => t.selectedAirport).map((t, i) => {
                const data = flightData[t.id];
                if (!data || !data.cheapest) return null;
                
                const flight = data.cheapest;
                const price = Math.round(parseFloat(flight.price.total));
                const airport = flight.departureAirport;
                const destCode = flight.itineraries[0].segments[0].arrival.iataCode;

                return (
                  <div key={i} className="p-4 bg-green-50 rounded-lg mb-3">
                    <p className="font-bold">{t.name || `Person ${i + 1}`}</p>
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
