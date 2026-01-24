import { useMemo } from 'react';

// DEVELOPMENT LOGGING HELPER
// Only logs in development mode to avoid performance impact and data leakage in production
const isDev = import.meta.env.DEV;
const devLog = (...args) => {
  if (isDev) console.log(...args);
};
const devWarn = (...args) => {
  if (isDev) console.warn(...args);
};

// API CALL TRACKING
const apiCallTracker = {
  totalCalls: 0,
  callsByEndpoint: {},
  cacheHits: 0,

  trackCall(endpoint) {
    this.totalCalls++;
    this.callsByEndpoint[endpoint] = (this.callsByEndpoint[endpoint] || 0) + 1;
    // Dispatch event for UI updates
    window.dispatchEvent(
      new CustomEvent('apiCallUpdate', {
        detail: {
          total: this.totalCalls,
          cacheHits: this.cacheHits,
          byEndpoint: this.callsByEndpoint,
        },
      })
    );
  },

  trackCacheHit() {
    this.cacheHits++;
    window.dispatchEvent(
      new CustomEvent('apiCallUpdate', {
        detail: {
          total: this.totalCalls,
          cacheHits: this.cacheHits,
          byEndpoint: this.callsByEndpoint,
        },
      })
    );
  },

  reset() {
    this.totalCalls = 0;
    this.callsByEndpoint = {};
    this.cacheHits = 0;
    window.dispatchEvent(
      new CustomEvent('apiCallUpdate', {
        detail: {
          total: 0,
          cacheHits: 0,
          byEndpoint: {},
        },
      })
    );
  },
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
      devLog('✅ Cache HIT (memory):', key);
      apiCallTracker.trackCacheHit();
      return memoryItem.data;
    }

    // Check localStorage cache
    try {
      const lsItem = localStorage.getItem(key);
      if (lsItem) {
        const parsed = JSON.parse(lsItem);
        if (parsed.expiry > Date.now()) {
          devLog('✅ Cache HIT (localStorage):', key);
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
      devWarn('Cache read error:', e);
    }

    devLog('❌ Cache MISS:', key);
    return null;
  },

  set(endpoint, params, data, ttlMinutes = 30) {
    const key = this.generateKey(endpoint, params);
    const item = {
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };

    // Store in memory
    this.memory.set(key, item);

    // Store in localStorage (with error handling for quota)
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      devWarn('Cache write error (quota?):', e);
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
        } catch {
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
      if (
        key &&
        (key.includes('flight') || key.includes('destination') || key.includes('airport'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};

/**
 * Custom hook for API caching functionality
 * Provides a two-tier cache (memory + localStorage) with TTL support
 */
export const useCache = () => {
  // Return memoized cache interface to prevent recreating on every render
  const cache = useMemo(
    () => ({
      get: (endpoint, params) => apiCache.get(endpoint, params),
      set: (endpoint, params, data, ttlMinutes) => apiCache.set(endpoint, params, data, ttlMinutes),
      clear: () => apiCache.clear(),
      clearOldItems: () => apiCache.clearOldItems(),
    }),
    []
  );

  const tracker = useMemo(
    () => ({
      trackCall: endpoint => apiCallTracker.trackCall(endpoint),
      trackCacheHit: () => apiCallTracker.trackCacheHit(),
      reset: () => apiCallTracker.reset(),
    }),
    []
  );

  return { cache, tracker };
};

// Export dev logging helpers for use in other modules
export { devLog, devWarn };
export const devError = (...args) => {
  if (isDev) console.error(...args);
};
