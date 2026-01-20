/**
 * Shared Amadeus API utilities for Netlify Functions
 * Handles token management and API calls securely on the server
 */

// Token cache (in-memory, shared across function invocations)
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Amadeus access token (with caching)
 * @returns {Promise<string>} Access token
 */
export async function getAmadeusToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('✅ Using cached Amadeus token');
    return cachedToken;
  }

  console.log('🔑 Fetching new Amadeus token...');

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Token request failed:', response.status, error);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    console.error('❌ Token error:', data.error_description);
    throw new Error(data.error_description || 'Authentication failed');
  }

  // Cache the token (expires_in is in seconds)
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

  console.log('✅ Got new Amadeus token, expires in', data.expires_in, 'seconds');
  return cachedToken;
}

/**
 * Make authenticated request to Amadeus API
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response
 */
export async function amadeusRequest(url, options = {}) {
  const token = await getAmadeusToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Amadeus API error:', response.status, errorText);
    throw new Error(`Amadeus API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Standard CORS headers for API responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Handle CORS preflight requests
 * @param {object} event - Netlify function event
 * @returns {object|null} Response object if OPTIONS, null otherwise
 */
export function handleCors(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }
  return null;
}
