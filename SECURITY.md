# Security Architecture

## Overview

Squad Flight Finder implements a **secure backend proxy architecture** to protect API credentials and prevent unauthorized access to the Amadeus API.

## Architecture

### Before (INSECURE ❌)

```
Browser → Amadeus API (with exposed credentials)
```

**Problems:**
- API credentials visible in browser DevTools
- Credentials in compiled JavaScript bundle
- Users could extract and abuse credentials
- No way to rotate keys without redeploying

### After (SECURE ✅)

```
Browser → Netlify Functions → Amadeus API (credentials hidden)
```

**Benefits:**
- API credentials stay on the server
- Users never see credentials
- Can rotate keys without code changes
- Rate limiting and access control possible
- CORS protection

## Implementation

### Backend (Netlify Functions)

Located in `/netlify/functions/`:

1. **utils/amadeus.js** - Shared authentication and utilities
   - Token caching (reduces API calls)
   - Authenticated request wrapper
   - CORS headers

2. **search-airports.js** - Airport search endpoint
   - `GET /api/search-airports?cityName=London`

3. **search-flights.js** - Flight search endpoint
   - `GET /api/search-flights?origin=LHR&destination=CDG&departureDate=2026-02-01`

4. **search-destinations.js** - Destinations search endpoint
   - `GET /api/search-destinations?origin=LHR`

### Frontend

- Calls `/api/*` endpoints instead of Amadeus directly
- No API credentials in code or environment variables
- Automatic fallback for development (Netlify Dev on port 8888)

### Environment Variables

**Local Development (.env):**
```bash
AMADEUS_API_KEY=your_key_here
AMADEUS_API_SECRET=your_secret_here
```

**Production (Netlify Dashboard):**
1. Go to Site Settings → Environment Variables
2. Add `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`
3. Deploy

**Note:** No `VITE_` prefix! These are backend-only variables.

## Security Features

### 1. Input Validation ✅

All user inputs are sanitized:
- XSS protection (removes `<>`, `javascript:`, event handlers)
- IATA code validation (3-letter codes only)
- Date format validation (YYYY-MM-DD)
- Budget range validation (£30-£500)
- City name sanitization

### 2. CORS Protection ✅

Backend functions enforce CORS:
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
```

### 3. Security Headers ✅

Configured in `netlify.toml`:
- `X-Frame-Options: DENY` (prevents clickjacking)
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `X-XSS-Protection: 1; mode=block` (XSS filter)
- `Content-Security-Policy` (restricts resource loading)

### 4. Rate Limiting ✅

Client-side rate limiting:
- 10 API calls per second max
- 5 searches per 5 seconds max
- Request queue (max 5 concurrent)

### 5. Error Handling ✅

- No sensitive data in error messages
- Graceful degradation on API failures
- Error boundaries prevent crashes
- Retry logic with exponential backoff

## Security Checklist

Before deploying to production:

- [ ] Rotate API credentials (old ones were exposed)
- [ ] Set environment variables in Netlify dashboard
- [ ] Enable security headers
- [ ] Test all API endpoints work through backend
- [ ] Verify credentials not in compiled bundle
- [ ] Add Sentry for error tracking
- [ ] Review and test CORS configuration
- [ ] Check build logs for exposed secrets

## Credential Rotation

If credentials are ever exposed:

1. **Immediately** disable old credentials in Amadeus dashboard
2. Generate new credentials
3. Update environment variables:
   - Local: Update `.env` file
   - Netlify: Update in dashboard (Site Settings → Environment Variables)
4. Redeploy application
5. Remove credentials from git history if committed:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```

## Audit Log

- **2026-01-20**: Implemented Netlify Functions backend proxy
- **2026-01-20**: Removed VITE_ prefix from environment variables
- **2026-01-20**: Added security headers via netlify.toml
- **2026-01-20**: Fixed input validation (removed trim during typing)

## Reporting Security Issues

If you discover a security vulnerability, please email:
**[Your Security Email Here]**

Do not create a public GitHub issue for security vulnerabilities.
