/**
 * Data Constants
 * Destination mappings, airport data, and configuration constants
 */

// Major hub cities that should check ALL airports (not limited)
export const MAJOR_HUB_CITIES = [
  'London', 'Paris', 'New York', 'NYC', 'Moscow', 'Los Angeles', 'LA',
  'Tokyo', 'Manila', 'Stockholm', 'San Francisco', 'Dubai', 'Boston'
];

// Destination airport codes (primary airport per city)
export const destinationAirportMap = {
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
export const destinationTypes = {
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
export const getDestinationTypes = (cityName) => {
  return destinationTypes[cityName] || ['city']; // Default to city if not found
};

// Traveler card color schemes
export const getTravelerColor = (index) => {
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
