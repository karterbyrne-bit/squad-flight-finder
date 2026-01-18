# Squad Flight Finder - Critical Tasks TODO

**Date:** 2026-01-18  
**Status:** Code review completed, critical security issues identified

---

## 🚨 IMMEDIATE ACTIONS REQUIRED (DO TOMORROW)

### 1. Rotate Exposed API Keys ⚠️ CRITICAL
**Priority:** HIGHEST  
**Why:** API credentials are committed to git repository and exposed client-side

**Steps:**
1. Log into Amadeus Developer Portal: https://developers.amadeus.com/
2. Navigate to your app settings
3. **Regenerate both API Key and API Secret**
4. Update your local `.env` file with new credentials
5. **DO NOT commit .env** (already added to .gitignore)
6. If deployed, update environment variables in your hosting platform

**Verification:**
- [ ] New API keys generated
- [ ] Local `.env` updated with new keys
- [ ] Production environment variables updated
- [ ] Old keys revoked/deleted in Amadeus dashboard

---

### 2. Remove .env from Git History ⚠️ CRITICAL
**Priority:** HIGHEST  
**Why:** Old credentials are still visible in git history

**Steps:**
```bash
# Option 1: Simple removal (keeps history)
git rm --cached .env
git commit -m "chore: remove .env from version control (already in .gitignore)"
git push origin claude/review-codebase-quality-yjPQf

# Option 2: Complete history rewrite (more secure but complex)
# WARNING: Only do this if you understand the implications
# This rewrites git history and requires force push
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

**Recommendation:** Use Option 1 if this is a private repo. The old keys will be invalidated anyway once you rotate them.

**Verification:**
- [ ] `.env` removed from current git tracking
- [ ] `.env` is in `.gitignore` (✅ already done)
- [ ] Changes committed and pushed

---

### 3. Verify Security Changes ✅ COMPLETED TODAY
**Priority:** HIGH  
**Status:** ✅ Done

Changes made:
- [x] Added `.env` to `.gitignore`
- [x] Updated `.env.example` with security warnings
- [x] All 58 console statements now only log in development mode
- [x] Added cleanup for setTimeout to prevent memory leaks
- [x] Documented security issues in `.env.example`

---

## 🔴 HIGH PRIORITY (THIS WEEK)

### 4. Move API Calls to Backend
**Priority:** HIGH  
**Why:** Client-side API secrets are a severe security vulnerability

**Current Issue:**
- `VITE_` prefix exposes environment variables to browser
- Users can extract API credentials from compiled JavaScript
- No way to secure client-side secrets in production

**Recommended Solutions:**

**Option A: Serverless Functions (Easiest)**
```javascript
// Example: Netlify Function at /netlify/functions/search-flights.js
export async function handler(event) {
  const { origin, destination, date } = JSON.parse(event.body);
  
  // API credentials stay server-side only
  const token = await getAmadeusToken(
    process.env.AMADEUS_API_KEY,
    process.env.AMADEUS_API_SECRET
  );
  
  const flights = await searchFlights(token, { origin, destination, date });
  
  return {
    statusCode: 200,
    body: JSON.stringify(flights)
  };
}
```

**Option B: Cloudflare Workers**
- Fastest edge deployment
- Free tier: 100,000 requests/day
- Tutorial: https://developers.cloudflare.com/workers/

**Option C: Express Backend**
- Full control
- Can add rate limiting, caching, etc.
- Requires deployment (Heroku, Railway, etc.)

**Steps:**
1. Choose a backend solution (recommend Netlify/Vercel functions if already using those platforms)
2. Create backend endpoints for each Amadeus API call
3. Move `AMADEUS_API_KEY` and `AMADEUS_API_SECRET` to server-side env vars (remove `VITE_` prefix)
4. Update frontend to call your backend instead of Amadeus directly
5. Test thoroughly
6. Deploy

**Verification:**
- [ ] Backend endpoints created
- [ ] API secrets are server-side only (no `VITE_` prefix)
- [ ] Frontend calls backend instead of Amadeus
- [ ] Tested in production environment
- [ ] Old client-side API code removed

---

### 5. Component Refactoring
**Priority:** MEDIUM-HIGH  
**Why:** 2,627-line monolithic component is unmaintainable

**Current Stats:**
- 2,627 lines in one component
- 35 React hooks in one place
- Mixing UI, API logic, state, caching, analytics

**Recommended Component Structure:**
```
src/
├── components/
│   ├── TravelerForm/
│   │   ├── TravelerForm.jsx
│   │   ├── TravelerCard.jsx
│   │   └── AirportSearch.jsx
│   ├── SearchFilters/
│   │   ├── BudgetSelector.jsx
│   │   ├── DateSelector.jsx
│   │   └── TripTypeSelector.jsx
│   ├── FlightResults/
│   │   ├── FlightResults.jsx
│   │   ├── FlightCard.jsx
│   │   └── FlightComparison.jsx
│   └── DestinationPicker/
│       ├── DestinationPicker.jsx
│       └── DestinationCard.jsx
├── services/
│   ├── amadeus.js (or backend client)
│   ├── cache.js
│   └── analytics.js (already exists ✅)
├── hooks/
│   ├── useFlightSearch.js
│   ├── useAirportSearch.js
│   └── useCache.js
└── App.jsx (orchestrator only)
```

**Benefits:**
- Easier to test individual components
- Reusable components
- Better code organization
- Easier to maintain
- Faster development

**Steps:**
1. Create `src/components/` directory
2. Start with smallest components (BudgetSelector, DateSelector)
3. Extract services (amadeus.js, cache.js)
4. Create custom hooks (useFlightSearch, etc.)
5. Gradually move logic out of App.jsx
6. Test after each extraction
7. Update tests

**Verification:**
- [ ] Component structure created
- [ ] Services extracted
- [ ] Custom hooks created
- [ ] App.jsx under 300 lines
- [ ] All tests still passing

---

## 🟡 MEDIUM PRIORITY (THIS MONTH)

### 6. Performance Optimization
**Issues:**
- 100+ inline arrow functions creating new references on every render
- No memoization (useCallback, useMemo)
- No code splitting
- Large initial bundle

**Tasks:**
- [ ] Wrap event handlers in `useCallback`
- [ ] Memoize expensive calculations with `useMemo`
- [ ] Implement React.lazy for code splitting
- [ ] Extract airport/destination data to JSON files
- [ ] Add bundle size monitoring

### 7. Add Error Boundaries
**Current Issue:** No error boundaries, React errors crash entire app

**Tasks:**
- [ ] Create `ErrorBoundary` component
- [ ] Wrap major sections (TravelerForm, FlightResults, etc.)
- [ ] Add error tracking (Sentry, LogRocket, etc.)
- [ ] User-friendly error messages

### 8. Testing Improvements
**Current:** 2,213 lines of tests ✅  
**Improvements:**
- [ ] Add integration tests for API mocking
- [ ] Add E2E tests with Playwright (already installed)
- [ ] Test error scenarios
- [ ] Add accessibility tests

### 9. Code Quality
**Tasks:**
- [ ] Add TypeScript (or PropTypes at minimum)
- [ ] Set up Prettier for consistent formatting
- [ ] Add Husky pre-commit hooks
- [ ] Add lint-staged for automatic fixes

---

## 📊 Progress Tracking

### Completed Today (2026-01-18)
- [x] Code quality review completed
- [x] `.env` added to `.gitignore`
- [x] `.env.example` updated with security warnings
- [x] All console statements wrapped in development-only checks (58 total)
- [x] Memory leak prevention added (setTimeout cleanup)
- [x] Code review documentation created

### Tomorrow (2026-01-19)
- [ ] Rotate Amadeus API keys
- [ ] Remove .env from git
- [ ] Plan backend migration strategy

### This Week
- [ ] Implement backend API proxy
- [ ] Start component refactoring
- [ ] Add error boundaries

### This Month
- [ ] Complete component refactoring
- [ ] Performance optimizations
- [ ] Add TypeScript/PropTypes
- [ ] Improve test coverage

---

## 📝 Notes

### Current Site Rating: 4.5/10
**Breakdown:**
- Security: 2/10 ⚠️ (exposed API keys)
- Architecture: 3/10 (monolithic component)
- Code Quality: 4/10 (works but has anti-patterns)
- Testing: 8/10 ✅ (excellent test coverage)
- Features: 7/10 (good functionality)
- Performance: 5/10 (room for improvement)

### After Recommended Fixes: 7-8/10 projected
With security fixes, component refactoring, and backend migration, this could be a solid 7-8/10 codebase.

---

## 🆘 Questions?

If you need help with any of these tasks, I can assist with:
- Writing backend serverless functions
- Component refactoring strategy
- Setting up error boundaries
- Performance optimization
- TypeScript migration

Just ask!

---

**Last Updated:** 2026-01-18  
**Next Review:** After backend migration and component refactoring
