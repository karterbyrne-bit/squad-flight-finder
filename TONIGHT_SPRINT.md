# Tonight's Sprint - Get Live in One Evening

**Goal:** Affiliates applied, mobile working, ready to add "Book Now" buttons tomorrow
**Time:** 3-4 hours focused work
**Timeline:** TONIGHT

---

## 🚀 Sprint Plan (3-4 hours)

### Hour 1: Affiliate Applications (60 min)

**Skyscanner (15 min)**
1. https://www.skyscanner.net/affiliates → Click "Join"
2. Fill out form (be honest about traffic, even if it's zero)
3. Description: "Group travel flight comparison with fairness algorithm"
4. Submit

**Booking.com (15 min)**
1. https://www.booking.com/affiliate-program/v2/index.html
2. Sign up (usually instant approval)
3. Save your affiliate ID

**Expedia (15 min)**
1. https://www.expediagroup.com/affiliate/
2. Apply (or skip and use CJ Affiliate later)

**Google Analytics (15 min)**
1. https://analytics.google.com/ → Create property
2. Copy tracking code
3. Add to your site's `<head>` (in `index.html` or layout component)
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
4. Deploy, verify it's tracking

**✅ Checkpoint:** Affiliates submitted, analytics tracking

---

### Hour 2: Mobile Quick Test & Fixes (60 min)

**Test (15 min)**
1. Open site on your phone (or use Chrome DevTools mobile emulator)
2. Try to complete a search:
   - Add 3 travelers
   - Enter cities
   - Pick dates
   - Search
3. Does it work? Note issues.

**Fix Critical Issues Only (45 min)**
- Can't click buttons? → Increase size
- Layout broken? → Check viewport meta tag
- Search doesn't work? → Debug console errors

**If it mostly works:** Ship it. Perfect is the enemy of done.

**✅ Checkpoint:** Search works on mobile (doesn't have to be perfect)

---

### Hour 3: Legal Basics (45 min)

**Privacy Policy (10 min)**
1. Go to https://www.privacypolicygenerator.info/
2. Fill in: Squad Flight Finder, your domain
3. Cookies: Yes (Google Analytics)
4. Third parties: Amadeus, Google Analytics
5. Copy generated policy
6. Create `src/pages/privacy.html` (or similar)
7. Add link in footer

**Terms of Service (10 min)**
1. Go to https://www.termsofservicegenerator.net/
2. Fill in details
3. Copy generated terms
4. Create `src/pages/terms.html`
5. Add link in footer

**Footer Links (10 min)**
Add to your footer component:
```jsx
<footer className="border-t p-4 text-center text-sm">
  <a href="/privacy">Privacy</a> |
  <a href="/terms">Terms</a> |
  <a href="mailto:you@gmail.com">Contact</a>
  <p className="mt-2">© 2026 Squad Flight Finder</p>
</footer>
```

**Deploy (15 min)**
```bash
git add .
git commit -m "Add privacy policy, terms, and analytics"
git push
```

**✅ Checkpoint:** Legal pages live, site looks legit

---

### Hour 4: Set Up for Tomorrow (30-45 min)

**Plan "Book Now" button placement (15 min)**
1. Open your results page
2. Sketch where buttons will go (each flight result)
3. Note which affiliate to use:
   - Flights → Skyscanner
   - Hotels → Booking.com

**Create placeholder buttons (15 min)**
```jsx
// In your FlightResult component
<button
  onClick={() => handleBooking(flight)}
  className="bg-purple-600 text-white px-6 py-2 rounded"
>
  Book on Skyscanner →
</button>
```

```javascript
const handleBooking = (flight) => {
  // TODO: Add affiliate link once approved
  window.open('https://www.skyscanner.com', '_blank');
};
```

**Check affiliate emails (5 min)**
- Skyscanner might approve same day
- Booking.com usually instant
- Save approval emails

**Commit & deploy (10 min)**
```bash
git add .
git commit -m "Add placeholder booking buttons"
git push
```

**✅ Checkpoint:** Ready to add real affiliate links tomorrow

---

## ✅ End of Tonight Checklist

- [ ] Applied to Skyscanner
- [ ] Applied to Booking.com
- [ ] Applied to Expedia (or skip for now)
- [ ] Google Analytics installed and tracking
- [ ] Mobile search works (good enough)
- [ ] Privacy policy page live
- [ ] Terms of service page live
- [ ] Footer links added
- [ ] Placeholder "Book Now" buttons added
- [ ] Everything deployed

**If you get all this done:** You're ahead of 95% of people who "want to start a side project"

---

## 🎯 Tomorrow

**Wait for affiliate approvals** (check email)

Once approved:
1. Replace placeholder URLs with real affiliate links
2. Add tracking parameters
3. Test booking flow
4. Deploy

**Then you're LIVE and earning.**

---

## What to Skip (Do Later)

- ❌ Perfect mobile UI (good enough for now)
- ❌ Custom domain email (Gmail is fine)
- ❌ Comprehensive testing (ship and iterate)
- ❌ Beautiful legal pages (ugly works)
- ❌ SEO optimization (later)

**Ship tonight. Optimize later.**

---

## If You Get Stuck

**Affiliate rejections?**
- Apply to CJ Affiliate or AWIN instead
- Or ship without them and apply once you have traffic

**Mobile completely broken?**
- Add: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Use Chrome DevTools to debug
- Ship anyway, fix over the weekend

**Don't have domain yet?**
- Buy on Namecheap (~£10)
- Point to Vercel/Netlify
- SSL is automatic

---

## Motivation

**After tonight you'll have:**
- ✅ Affiliate applications submitted
- ✅ Site tracking analytics
- ✅ Legal pages (looks professional)
- ✅ Mobile working
- ✅ Ready to earn your first commission

**90% of people never get this far. You will.** 💪

---

**START NOW. See you on the other side.** 🚀
