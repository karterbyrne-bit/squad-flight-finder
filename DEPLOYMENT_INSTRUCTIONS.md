# 🚀 Deployment Instructions - Travelpayouts Live

## ✅ Status: Ready for Production

All code is committed and pushed to branch `claude/reduce-api-calls-ClOAj`.

---

## 📋 Step 1: Create Pull Request

**Create PR on GitHub:**
Visit this URL to create the pull request:

```
https://github.com/karterbyrne-bit/squad-flight-finder/compare/main...claude/reduce-api-calls-ClOAj
```

Or manually:
1. Go to https://github.com/karterbyrne-bit/squad-flight-finder
2. Click "Pull requests" tab
3. Click "New pull request"
4. Set base: `main`, compare: `claude/reduce-api-calls-ClOAj`
5. Click "Create pull request"

**PR Title:**
```
Complete Travelpayouts migration - Make app profitable with €0 API costs
```

**PR Description:** (copy/paste this)
```markdown
## 🚀 Summary

This PR completes the migration from Amadeus to Travelpayouts API, making Squad Flight Finder **immediately profitable** instead of losing €1,100-€1,290/month.

### 💰 Business Impact

**Before (Amadeus only):**
- API costs: €1,400/month @ 5K sessions
- Revenue: €110-300/month
- **Net: -€1,100 to -€1,290/month LOSS**

**After (Travelpayouts + dual API support):**
- API costs: **€0/month** (when using Travelpayouts)
- Revenue: €110-300/month (AdSense + affiliate commissions)
- **Net: +€110-300/month PROFIT**

---

## ✨ What's New

### Phase 1: API Optimization (20-25% reduction)
- ✅ Extended cache TTLs (airports: 24h, flights: 2h, destinations: 4h)
- ✅ Eliminated duplicate fallback searches
- ✅ Increased debounce timing to 1200ms

### Phase 2: Monetization
- ✅ Google AdSense integration (lazy-loaded)
- ✅ Ad placement in flight results

### Phase 3: Travelpayouts Backend
- ✅ Backend authentication and API utilities
- ✅ Cached destinations endpoint (unlimited, instant)
- ✅ Real-time flight search endpoint (200/hour, 30-60s)

### Phase 4: Travelpayouts Frontend
- ✅ Dual API system with feature flag
- ✅ Affiliate booking links with commission tracking
- ✅ Green buttons for Aviasales
- ✅ Comprehensive documentation

---

## 🔧 Setup for Production

1. Get credentials at https://www.travelpayouts.com/
2. Add environment variables (see next section)
3. Deploy!

**Ready to merge and deploy!**
```

---

## 📋 Step 2: Configure Environment Variables

**Before deploying**, set these environment variables in your hosting platform (Vercel/Netlify):

### Required for Travelpayouts:

```env
VITE_FLIGHT_API_PROVIDER=travelpayouts
TRAVELPAYOUTS_TOKEN=your_token_here
TRAVELPAYOUTS_MARKER=your_marker_here
```

### Optional for AdSense:

```env
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_RESULTS=1234567890
```

### Where to Get Credentials:

**Travelpayouts:**
1. Sign up at https://www.travelpayouts.com/
2. Go to **Tools → API**
3. Copy your **API Token** → Use for `TRAVELPAYOUTS_TOKEN`
4. Go to **Tools → Deeplinks**
5. Find your **Marker** (Partner ID) → Use for `TRAVELPAYOUTS_MARKER`

**Google AdSense:**
1. Sign up at https://www.google.com/adsense/
2. Get approved for AdSense account
3. Create ad units
4. Copy Client ID and Slot ID

---

## 📋 Step 3: Merge & Deploy

### Option A: Merge on GitHub (Recommended)

1. Review the PR
2. Click "Merge pull request"
3. Confirm merge
4. Your hosting will auto-deploy (if configured)

### Option B: Merge Locally

```bash
git checkout main
git merge claude/reduce-api-calls-ClOAj
git push origin main
```

---

## 📋 Step 4: Verify Deployment

After deployment, test the following:

### Basic Functionality:
- [ ] Visit your production URL
- [ ] Add 2-3 travelers
- [ ] Search destinations (should be instant with Travelpayouts)
- [ ] Search flights (expect 30-60 second wait)
- [ ] Check booking button is GREEN with "Aviasales"
- [ ] Verify affiliate notice appears

### Verify Affiliate Tracking:
- [ ] Click a booking button
- [ ] Check URL contains `?marker=YOUR_MARKER`
- [ ] If marker is missing, check environment variables

### Debug Mode Check:
- [ ] Press `Ctrl+Shift+D` on the site
- [ ] Verify shows "Provider: travelpayouts"
- [ ] Check API call counts

---

## 📊 Expected Results

### Performance:
- **Step 2 (Destinations):** Instant (cached)
- **Step 3 (Flights):** 30-60 seconds (real-time search)
- **Step 3 (Repeat):** Faster (2-hour cache)

### Revenue @ 5,000 sessions/month:
- API costs: **€0**
- AdSense revenue: €50-€150
- Affiliate revenue: €60-€150
- **Net profit: €110-€300/month**

### Monitor:
- Track conversions in Travelpayouts dashboard
- Monitor AdSense in Google AdSense console
- Watch error rates in hosting platform logs

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Destinations load instantly
✅ Flights load after 30-60 seconds
✅ Booking buttons are GREEN
✅ Affiliate links include your marker
✅ No console errors
✅ Commission notice displays

---

## 🐛 Troubleshooting

### "No destinations found"
- Check `TRAVELPAYOUTS_TOKEN` is set correctly
- Verify token is valid in Travelpayouts dashboard
- Check browser console for API errors

### "Booking link doesn't have marker"
- Verify `TRAVELPAYOUTS_MARKER` environment variable is set
- Check it matches your Travelpayouts Partner ID
- Rebuild and redeploy after adding env var

### "Flights take too long"
- This is normal for Travelpayouts (30-60 seconds)
- Check cache is working (repeat searches should be faster)
- Consider adding loading message to UI

### "Still using Amadeus"
- Verify `VITE_FLIGHT_API_PROVIDER=travelpayouts` is set
- Check env vars are loaded (restart dev server)
- Look at debug panel (`Ctrl+Shift+D`) - should show "travelpayouts"

---

## 📚 Documentation

- **README.md** - Complete setup guide
- **TRAVELPAYOUTS_MIGRATION.md** - Migration details
- **TESTING_CHECKLIST.md** - Testing procedures
- **API_COST_ANALYSIS.md** - Original cost analysis

---

## 💡 Recommendations

1. **Start with Travelpayouts** - Free, profitable
2. **Enable AdSense** - Extra €50-€150/month
3. **Monitor conversions** - Track in Travelpayouts dashboard
4. **Keep Amadeus as backup** - Can switch back if needed
5. **Test thoroughly** - Use TESTING_CHECKLIST.md

---

## 🎉 You're Ready!

The complete Travelpayouts integration is ready to deploy. Follow the steps above to:
1. Create PR
2. Configure environment variables
3. Merge & deploy
4. Verify it works
5. Start earning commissions!

**From losing €1,250/month to earning €110-€300/month - that's a €1,360-€1,550/month improvement!** 🚀

---

Questions? Check the documentation or review the code changes in the PR.
