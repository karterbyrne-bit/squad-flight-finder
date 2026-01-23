# Testing Checklist - Dual API Integration

This checklist helps verify both Amadeus and Travelpayouts APIs work correctly after configuration.

## ✅ Code Structure Tests (Completed)

- ✅ All key files exist
- ✅ Import statements are correct
- ✅ Environment variable usage is consistent
- ✅ Data mapping functions exist
- ✅ JavaScript syntax is valid

## 🧪 Manual Testing with Amadeus API

### Prerequisites
1. Copy `.env.example` to `.env`
2. Set `VITE_FLIGHT_API_PROVIDER=amadeus`
3. Add valid `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`
4. Run `npm run dev`

### Test Cases

#### Test 1: Airport Search
- [ ] Enter a city name (e.g., "London")
- [ ] Verify airports appear in dropdown
- [ ] Check console shows: `💰 Using Amadeus API`

#### Test 2: Destination Discovery
- [ ] Add 2-3 travelers from different cities
- [ ] Click "Find Destinations"
- [ ] Verify destinations load (should be fast, ~2-5 seconds)
- [ ] Check no "cached data" disclaimer appears

#### Test 3: Flight Search
- [ ] Select a destination
- [ ] Click "Search Flights"
- [ ] Verify flights load (should be fast, ~3-5 seconds)
- [ ] Check flight details are complete (airline, times, price)

#### Test 4: Booking Links
- [ ] Scroll to a flight result
- [ ] Verify "Book on Skyscanner" button is **BLUE**
- [ ] Verify no green Aviasales commission notice appears
- [ ] Click booking button - should open Skyscanner

#### Test 5: Debug Mode
- [ ] Press `Ctrl+Shift+D` to open debug panel
- [ ] Verify shows: "Provider: amadeus"
- [ ] Check API call counts are reasonable

## 🧪 Manual Testing with Travelpayouts API

### Prerequisites
1. Set `VITE_FLIGHT_API_PROVIDER=travelpayouts`
2. Add valid `TRAVELPAYOUTS_TOKEN`
3. Add valid `TRAVELPAYOUTS_MARKER` (for commission tracking)
4. Restart dev server

### Test Cases

#### Test 1: Airport Search
- [ ] Enter a city name (e.g., "Paris")
- [ ] Verify airports appear in dropdown
- [ ] Check console shows: `✅ Using Travelpayouts API (FREE - €0 costs, earn commission)`

#### Test 2: Destination Discovery (Cached)
- [ ] Add 2-3 travelers from different cities
- [ ] Click "Find Destinations"
- [ ] Verify destinations load **INSTANTLY** (cached data)
- [ ] **Check for blue disclaimer banner:** "💡 Quick Search: Prices shown are from recent searches"

#### Test 3: Flight Search (Real-Time)
- [ ] Select a destination
- [ ] Click "Search Flights"
- [ ] **Expect 30-60 second wait** - this is normal for Travelpayouts
- [ ] Verify loading spinner appears
- [ ] Check flights eventually load
- [ ] Verify flight details are present

#### Test 4: Booking Links (Affiliate)
- [ ] Scroll to a flight result
- [ ] Verify "Book on Aviasales" button is **GREEN**
- [ ] **Check for green commission notice:** "💰 We earn a small commission..."
- [ ] Click booking button - should open Aviasales with `?marker=YOUR_MARKER` in URL
- [ ] Verify marker parameter is present in URL

#### Test 5: Debug Mode
- [ ] Press `Ctrl+Shift+D` to open debug panel
- [ ] Verify shows: "Provider: travelpayouts"
- [ ] Check API call counts

## 🔄 API Switching Test

### Test: Hot-Swapping APIs

1. Start with `VITE_FLIGHT_API_PROVIDER=amadeus`
2. Run app, perform a search
3. Stop server
4. Change to `VITE_FLIGHT_API_PROVIDER=travelpayouts`
5. Restart server
6. Perform same search
7. Verify:
   - [ ] Booking button color changes (blue → green)
   - [ ] Disclaimers appear/disappear correctly
   - [ ] Console logs show correct provider
   - [ ] Debug panel shows correct provider

## 🚨 Error Scenarios

### Test: Missing Credentials

#### Amadeus
- [ ] Remove `AMADEUS_API_KEY` from `.env`
- [ ] Set provider to `amadeus`
- [ ] Verify graceful error message (not crash)

#### Travelpayouts
- [ ] Remove `TRAVELPAYOUTS_TOKEN` from `.env`
- [ ] Set provider to `travelpayouts`
- [ ] Verify graceful error message (not crash)

### Test: Invalid Credentials

#### Amadeus
- [ ] Set `AMADEUS_API_KEY=invalid_key`
- [ ] Attempt search
- [ ] Verify error handling (user-friendly message)

#### Travelpayouts
- [ ] Set `TRAVELPAYOUTS_TOKEN=invalid_token`
- [ ] Attempt search
- [ ] Verify error handling (user-friendly message)

## 📊 Performance Checks

### Amadeus Performance
- [ ] Step 2 (Destinations): < 5 seconds
- [ ] Step 3 (Flights): < 5 seconds
- [ ] No console errors
- [ ] Cache working (repeat searches are faster)

### Travelpayouts Performance
- [ ] Step 2 (Destinations): < 2 seconds (instant from cache)
- [ ] Step 3 (Flights): 30-60 seconds (expected)
- [ ] Loading spinner appears during long searches
- [ ] No console errors
- [ ] Cache working (repeat searches are faster)

## 🎯 Critical Success Criteria

Both APIs must:
- ✅ Return valid flight data
- ✅ Display prices correctly
- ✅ Show booking links
- ✅ Handle errors gracefully
- ✅ Cache results properly
- ✅ Not expose credentials to browser

Travelpayouts-specific:
- ✅ Affiliate links include marker parameter
- ✅ Commission notice displays
- ✅ Cached data disclaimer shows for destinations
- ✅ User understands 30-60s search is normal

## 📝 Notes for Testing

### Travelpayouts Rate Limits
- **Destination API (cached)**: Unlimited requests
- **Flight API (real-time)**: 200 requests/hour
- If you hit rate limit, wait 1 hour before retesting

### Test Environment
- Amadeus test environment has limited flight data
- Some destinations may not return results
- This is normal for test API

### Expected Differences

| Feature | Amadeus | Travelpayouts |
|---------|---------|---------------|
| Step 2 Speed | 2-5 seconds | Instant (cached) |
| Step 3 Speed | 3-5 seconds | 30-60 seconds |
| Data Freshness | Real-time | Last 48 hours (Step 2), Real-time (Step 3) |
| Booking Button | Blue (Skyscanner) | Green (Aviasales) |
| Commission | No | Yes |
| Cost | ~€1,400/month | €0 |

## ✅ Sign-Off

Once all tests pass, the dual API integration is production-ready.

**Tested by:** _________________
**Date:** _________________
**Both APIs working:** ☐ Yes ☐ No
**Ready for production:** ☐ Yes ☐ No

---

## 🐛 Issues Found

Document any issues during testing:

| Issue | API | Severity | Status |
|-------|-----|----------|--------|
| | | | |
| | | | |

---

**Next Steps After Testing:**
1. Choose primary API for production (Travelpayouts recommended)
2. Configure production environment variables
3. Deploy to Vercel
4. Monitor performance and error rates
5. Track affiliate commissions (if using Travelpayouts)
