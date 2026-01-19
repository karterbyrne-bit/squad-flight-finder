/**
 * Input Validation and Sanitization Utilities
 * Protects against XSS, injection attacks, and malicious input
 */

/**
 * Sanitizes user input by removing potentially dangerous characters
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = input => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
};

/**
 * Validates and sanitizes traveler name
 * @param {string} name - The name to validate
 * @returns {string} - Validated and sanitized name
 */
export const validateTravelerName = name => {
  const sanitized = sanitizeInput(name);
  // Allow letters, spaces, hyphens, and apostrophes only
  return sanitized.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50);
};

/**
 * Validates city name input
 * @param {string} city - The city name to validate
 * @returns {string} - Validated and sanitized city
 */
export const validateCityName = city => {
  const sanitized = sanitizeInput(city);
  // Allow letters, spaces, hyphens, and common city name characters
  return sanitized.replace(/[^a-zA-Z\s\-',]/g, '').slice(0, 100);
};

/**
 * Validates IATA airport code
 * @param {string} code - The airport code to validate
 * @returns {string|null} - Valid code or null
 */
export const validateAirportCode = code => {
  if (typeof code !== 'string') return null;
  const upperCode = code.toUpperCase().trim();
  // IATA codes are exactly 3 letters
  return /^[A-Z]{3}$/.test(upperCode) ? upperCode : null;
};

/**
 * Validates date string in YYYY-MM-DD format
 * @param {string} dateString - The date to validate
 * @returns {boolean} - Whether the date is valid
 */
export const validateDate = dateString => {
  if (typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validates budget value
 * @param {number} budget - The budget to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Clamped budget value
 */
export const validateBudget = (budget, min = 30, max = 500) => {
  const num = Number(budget);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
};

/**
 * Validates number of adults
 * @param {number} adults - Number of adults
 * @returns {number} - Valid number (1-10)
 */
export const validateAdults = adults => {
  const num = Number(adults);
  if (isNaN(num)) return 1;
  return Math.max(1, Math.min(10, Math.floor(num)));
};

/**
 * Validates max stops filter
 * @param {number} maxStops - Maximum number of stops
 * @returns {number|null} - Valid max stops or null
 */
export const validateMaxStops = maxStops => {
  if (maxStops === null || maxStops === undefined) return null;
  const num = Number(maxStops);
  if (isNaN(num)) return null;
  return Math.max(0, Math.min(2, Math.floor(num)));
};

/**
 * Sanitizes URL to prevent XSS
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL or empty string
 */
export const sanitizeUrl = url => {
  if (typeof url !== 'string') return '';

  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (trimmed.toLowerCase().startsWith(protocol)) {
      return '';
    }
  }

  // Only allow http and https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return '';
  }

  return trimmed;
};

/**
 * Validates trip type
 * @param {string} tripType - The trip type to validate
 * @returns {string} - Valid trip type
 */
export const validateTripType = tripType => {
  const validTypes = ['city', 'beach', 'ski', 'cheap', 'luxury', 'all'];
  return validTypes.includes(tripType) ? tripType : 'all';
};

/**
 * Validates sort option
 * @param {string} sortBy - The sort option to validate
 * @returns {string} - Valid sort option
 */
export const validateSortBy = sortBy => {
  const validOptions = ['avgPrice', 'fairness', 'priceRange'];
  return validOptions.includes(sortBy) ? sortBy : 'avgPrice';
};
