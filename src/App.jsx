import React, { useState, useRef } from 'react';
import { Plane, Users, Plus, X, Search, DollarSign, Scale, Calendar, Briefcase, Palmtree, Mountain, Gem, Coffee, Share2, Copy, Check, Info, ArrowRight, ArrowLeft, Globe, ArrowUpDown, ExternalLink, TrendingDown, Clock, MapPin } from 'lucide-react';

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
    
    if (field === 'origin' && value.length >= 3) {
      debouncedAirportSearch(id, value);
    }
  };

  const goToDestinations = () => {
    if (travelers.every(t => t.selectedAirport) && dateFrom && dateTo) {
      setStep(2);
    }
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
        const destLocations = await AmadeusAPI.searchAirports(destinationCity);

        // Prefer CITY code over individual airports (PAR vs CDG) for broader results
        const cityCode = destLocations.find(a => a.subType === 'CITY');
        if (cityCode) {
          destinationCode = cityCode.iataCode;
          console.log('🏙️ Using city code for destination:', destinationCode);
        } else {
          // Fallback to first airport if no city code available
          const airportOnly = destLocations.filter(a => a.subType === 'AIRPORT');
          if (airportOnly.length === 0) {
            throw new Error(`No airports found for ${destinationCity}`);
          }
          destinationCode = airportOnly[0].iataCode;
          console.log('✈️ Using airport code for destination:', destinationCode);
        }
      }

      console.log('🎯 Destination code:', destinationCode);

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

  const filtered = popularDestinations.filter(d => tripType === 'all' || d.types.includes(tripType));

  const destination = selectedDestination || customDestination;
  const fairness = getFairnessDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 sm:p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 pt-4 sm:pt-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Plane className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Squad Flight Finder</h1>
          </div>
          <p className="text-white/90 text-xs sm:text-sm">Find the fairest meeting spot • Searches ALL nearby airports</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-start gap-2">
            <X className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5">
            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Budget per Person</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="30"
                    max="500"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="30"
                    max="500"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Math.min(500, Math.max(30, parseInt(e.target.value) || 30)))}
                    className="w-16 sm:w-20 px-2 py-1.5 border-2 rounded-lg text-sm font-bold text-purple-600 text-center"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Dates</h2>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    value={dateFrom} 
                    min={new Date().toISOString().split('T')[0]} 
                    onChange={(e) => setDateFrom(e.target.value)} 
                    className="px-2 py-2 border-2 rounded-lg text-xs sm:text-sm" 
                  />
                  <input 
                    type="date" 
                    value={dateTo} 
                    min={dateFrom || new Date().toISOString().split('T')[0]} 
                    onChange={(e) => setDateTo(e.target.value)} 
                    className="px-2 py-2 border-2 rounded-lg text-xs sm:text-sm" 
                  />
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Your Squad</h2>
                {travelers.map((t, i) => (
                  <div key={t.id} className="space-y-2 mb-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={`Person ${i + 1}`} 
                        value={t.name} 
                        onChange={(e) => updateTraveler(t.id, 'name', e.target.value)} 
                        className="w-24 sm:w-32 px-2 py-2 border-2 rounded-lg text-xs sm:text-sm" 
                      />
                      <input 
                        type="text" 
                        placeholder="From city" 
                        value={t.origin} 
                        onChange={(e) => updateTraveler(t.id, 'origin', e.target.value)} 
                        className="flex-1 px-2 py-2 border-2 rounded-lg text-xs sm:text-sm" 
                      />
                      {travelers.length > 1 && (
                        <button onClick={() => removeTraveler(t.id)} className="p-2 text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {searchingAirports[t.id] && (
                      <p className="text-xs text-gray-500">🔍 Finding nearby airports...</p>
                    )}
                    
                    {t.airports && t.airports.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t.airports.length} airport{t.airports.length > 1 ? 's' : ''} found - we'll check them all!
                        </p>
                        <div className="text-xs text-gray-600">
                          {t.airports.slice(0, 3).map((a, idx) => (
                            <span key={a.code}>
                              {a.name} ({a.distance}mi)
                              {idx < Math.min(2, t.airports.length - 1) && ', '}
                            </span>
                          ))}
                          {t.airports.length > 3 && ` +${t.airports.length - 3} more`}
                        </div>
                      </div>
                    )}
                    
                    <select 
                      value={t.luggage} 
                      onChange={(e) => updateTraveler(t.id, 'luggage', e.target.value)} 
                      className="w-full px-2 py-2 border-2 rounded-lg text-xs sm:text-sm"
                    >
                      <option value="hand">Hand bag only</option>
                      <option value="cabin">Cabin bag (10kg)</option>
                      <option value="checked">Checked baggage</option>
                    </select>
                  </div>
                ))}
                {travelers.length < 10 && (
                  <button onClick={addTraveler} className="text-sm text-purple-600 font-semibold">
                    <Plus className="w-4 h-4 inline" /> Add Person
                  </button>
                )}
              </div>

              <div className="pt-3 border-t">
                <h2 className="text-sm font-bold mb-2">Preferences (Optional)</h2>
                <div className="grid grid-cols-5 gap-1.5">
                  {tripTypes.map(t => {
                    const Icon = t.icon;
                    return (
                      <button 
                        key={t.id} 
                        onClick={() => setTripType(t.id)} 
                        className={`p-1.5 rounded border-2 ${tripType === t.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                      >
                        <Icon className="w-3.5 mx-auto text-purple-600" />
                        <p className="text-[10px] font-semibold">{t.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <button 
              onClick={goToDestinations} 
              disabled={travelers.some(t => !t.selectedAirport) || !dateFrom || !dateTo} 
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Find Destinations <ArrowRight className="w-4 inline" />
            </button>
          </div>
        )}

        {step === 2 && (
          <>
            <button 
              onClick={() => { setStep(1); setShowResults(false); setFlightData({}); }} 
              className="mb-4 px-3 py-2 text-white bg-white/20 rounded-lg text-sm hover:bg-white/30"
            >
              <ArrowLeft className="w-4 inline" /> Back
            </button>
            
            {!showResults && (
              <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5">
                <h2 className="text-lg font-bold mb-3">Where do you want to go?</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {filtered.map(d => (
                    <button 
                      key={d.city} 
                      onClick={() => setSelectedDestination(d.city)} 
                      className={`p-3 rounded-lg border-2 text-left transition-all ${selectedDestination === d.city ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <p className="font-bold text-sm">{d.city}</p>
                      <p className="text-xs text-gray-500">{d.region}</p>
                    </button>
                  ))}
                </div>
                
                <input 
                  type="text" 
                  placeholder="Or enter custom destination" 
                  value={customDestination} 
                  onChange={(e) => { setCustomDestination(e.target.value); setSelectedDestination(''); }} 
                  className="w-full px-3 py-2 border-2 rounded-lg text-sm mb-3" 
                />

                <button 
                  onClick={searchTrips} 
                  disabled={!destination || loading} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>🔍 Checking all airports for best prices...</>
                  ) : (
                    <><Search className="w-4 inline" /> Search Flights</>
                  )}
                </button>
              </div>
            )}

            {showResults && (
              <>
                {fairness ? (
                  <>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="mb-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:opacity-90"
                    >
                      <Share2 className="w-4 inline" /> Share Booking Links
                    </button>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Scale className="w-5 text-purple-600" />
                        <h2 className="text-xl font-bold">Fairness Score</h2>
                        <div className={`ml-auto px-3 py-1 rounded font-bold ${fairness.score >= 80 ? 'bg-green-100 text-green-700' : fairness.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {fairness.score}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">✨ Balanced by distance - closer airports save you travel time!</p>
                      {fairness.travelers.map((t, i) => (
                        <div key={i} className="flex justify-between p-3 bg-purple-50 rounded-lg mb-2">
                          <div>
                            <p className="font-bold text-sm">{t.name}</p>
                            <p className="text-xs text-gray-600">{t.airport}</p>
                            <p className="text-xs text-gray-500">{t.distance} miles away</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">£{Math.round(t.cost)}</p>
                            {t.diffFromAvg !== 0 && (
                              <p className={`text-xs ${t.diffFromAvg > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {t.diffFromAvg > 0 ? '+' : ''}£{Math.round(t.diffFromAvg)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5">
                      <h2 className="text-xl font-bold mb-3">Best Flights to {destination}</h2>
                      {travelers.filter(t => t.selectedAirport).map(t => {
                        const data = flightData[t.id];
                        if (!data || !data.cheapest) return null;

                        const flight = data.cheapest;
                        const price = parseFloat(flight.price.total);
                        const segment = flight.itineraries[0].segments[0];
                        const airport = flight.departureAirport;

                        return (
                          <div key={t.id} className="mb-4">
                            <p className="font-bold mb-2">{t.name || `From ${t.origin}`}</p>
                            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold">{airport.name} ({airport.code}) → {segment.arrival.iataCode}</p>
                                  <p className="text-xs text-gray-600">{segment.carrierCode} {segment.number}</p>
                                  <p className="text-xs text-gray-500">Duration: {segment.duration.replace('PT', '').toLowerCase()}</p>
                                  <p className="text-xs text-green-600 mt-1">✓ Best option from {data.allAirportOptions} nearby airports</p>
                                </div>
                                <p className="text-2xl font-bold text-green-600">£{Math.round(price)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
