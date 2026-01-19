/**
 * Retry Logic Utilities with Exponential Backoff
 * Handles transient failures gracefully
 */

/**
 * Delays execution for a specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
const isRetryableError = error => {
  // Network errors
  if (error.message?.includes('Failed to fetch')) return true;
  if (error.message?.includes('NetworkError')) return true;
  if (error.message?.includes('Network request failed')) return true;

  // Timeout errors
  if (error.message?.includes('timeout')) return true;

  // HTTP status codes that are retryable
  if (error.status === 408) return true; // Request Timeout
  if (error.status === 429) return true; // Too Many Requests
  if (error.status === 500) return true; // Internal Server Error
  if (error.status === 502) return true; // Bad Gateway
  if (error.status === 503) return true; // Service Unavailable
  if (error.status === 504) return true; // Gateway Timeout

  return false;
};

/**
 * Retries an async function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.backoffFactor - Backoff multiplier (default: 2)
 * @param {Function} options.onRetry - Callback on retry attempt
 * @returns {Promise} - The result of the function or throws error
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null,
  } = options;

  let lastError;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, currentDelay, error);
      }

      // Wait before retrying
      await delay(currentDelay);

      // Exponential backoff with jitter
      currentDelay = Math.min(currentDelay * backoffFactor + Math.random() * 1000, maxDelay);
    }
  }

  throw lastError;
};

/**
 * Retries a fetch request with exponential backoff
 * @param {string} url - The URL to fetch
 * @param {Object} fetchOptions - Fetch options
 * @param {Object} retryOptions - Retry options
 * @returns {Promise<Response>} - The fetch response
 */
export const retryFetch = async (url, fetchOptions = {}, retryOptions = {}) => {
  return retryWithBackoff(async () => {
    const response = await fetch(url, fetchOptions);

    // Check if response is retryable
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return response;
  }, retryOptions);
};

/**
 * Retries an API call with specific handling for authentication
 * @param {Function} apiCall - The API call function
 * @param {Object} options - Retry options
 * @returns {Promise} - The API call result
 */
export const retryApiCall = async (apiCall, options = {}) => {
  const defaultOptions = {
    maxRetries: 4,
    initialDelay: 2000,
    maxDelay: 16000,
    backoffFactor: 2,
    onRetry: (attempt, maxRetries, delay, error) => {
      if (import.meta.env.DEV) {
        console.warn(
          `Retry attempt ${attempt}/${maxRetries} after ${delay}ms due to:`,
          error.message
        );
      }
    },
  };

  return retryWithBackoff(apiCall, { ...defaultOptions, ...options });
};

/**
 * Creates a timeout wrapper for promises
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMessage - Custom timeout message
 * @returns {Promise} - Promise that rejects on timeout
 */
export const withTimeout = (promise, timeoutMs = 30000, timeoutMessage = 'Request timeout') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)),
  ]);
};
