/**
 * Rate Limiting Utilities
 * Protects against API abuse and quota exhaustion
 */

/**
 * Token Bucket Rate Limiter
 * Implements the token bucket algorithm for rate limiting
 */
export class RateLimiter {
  constructor(maxTokens = 10, refillRate = 1, refillInterval = 1000) {
    this.maxTokens = maxTokens; // Maximum tokens in the bucket
    this.tokens = maxTokens; // Current available tokens
    this.refillRate = refillRate; // Tokens to add per interval
    this.refillInterval = refillInterval; // Interval in milliseconds
    this.lastRefill = Date.now();
    this.queue = [];
  }

  /**
   * Refills tokens based on elapsed time
   */
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor((elapsed / this.refillInterval) * this.refillRate);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Attempts to acquire a token
   * @returns {boolean} - Whether a token was acquired
   */
  tryAcquire() {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Acquires a token, waiting if necessary
   * @param {number} timeout - Maximum wait time in ms
   * @returns {Promise<boolean>} - Whether a token was acquired
   */
  async acquire(timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.tryAcquire()) {
        return true;
      }

      // Wait a bit before trying again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
  }

  /**
   * Wraps a function with rate limiting
   * @param {Function} fn - The function to rate limit
   * @returns {Function} - Rate limited function
   */
  wrap(fn) {
    return async (...args) => {
      const acquired = await this.acquire();

      if (!acquired) {
        throw new Error('Rate limit exceeded - could not acquire token');
      }

      return fn(...args);
    };
  }

  /**
   * Gets the current status
   * @returns {Object} - Status information
   */
  getStatus() {
    this.refill();
    return {
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      utilizationPercent: ((this.maxTokens - this.tokens) / this.maxTokens) * 100,
    };
  }
}

/**
 * Creates a rate limiter for API calls
 * Default: 10 calls per second
 */
export const apiRateLimiter = new RateLimiter(10, 1, 100);

/**
 * Creates a rate limiter for search operations
 * Default: 5 searches per 5 seconds
 */
export const searchRateLimiter = new RateLimiter(5, 1, 1000);

/**
 * Debounces a function
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * Throttles a function
 * @param {Function} fn - The function to throttle
 * @param {number} limit - Minimum time between calls in ms
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle;

  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Creates a simple request queue to prevent concurrent API calls
 */
export class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  /**
   * Adds a request to the queue
   * @param {Function} fn - The async function to execute
   * @returns {Promise} - The result of the function
   */
  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  /**
   * Processes the queue
   */
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }

  /**
   * Gets queue status
   * @returns {Object} - Queue status
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

/**
 * Global request queue for API calls
 */
export const apiRequestQueue = new RequestQueue(5);
