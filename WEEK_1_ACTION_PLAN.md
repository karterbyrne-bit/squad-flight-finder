# Week 1 Action Plan - Getting Started

**Goal:** Get affiliates applied, mobile working, legal basics done
**Timeline:** 7 days
**Commitment:** ~15-20 hours total

---

## Day 1-2: Affiliate Applications (3-4 hours)

### Skyscanner Affiliate Program ⭐ PRIORITY 1
**Why:** Best for flight comparison, 30-day cookie window

1. Go to: https://www.skyscanner.net/affiliates
2. Click "Join Now" or "Apply"
3. Fill out application:
   - Website: squadflightfinder.com (or your domain)
   - Traffic: Be honest about current traffic (even if it's 0-100/month)
   - Description: "Group travel flight comparison tool with fairness algorithm"
   - Revenue model: "Affiliate commissions from flight bookings"
4. Submit and wait for approval (1-3 days typically)

**Backup:** If rejected, try Skyscanner via CJ Affiliate or AWIN

### Booking.com Partner Program ⭐ PRIORITY 2
**Why:** Good commission rates (4-6%), hotels + flights

1. Go to: https://www.booking.com/affiliate-program/v2/index.html
2. Sign up for Partner Programme
3. Fill out details:
   - Company: Squad Flight Finder (or personal name)
   - Website URL
   - Expected monthly bookings: "5-10 initially"
4. Get approved (usually instant or 24 hours)
5. Note your affiliate ID

### Expedia Affiliate Network ⭐ PRIORITY 3
**Why:** Package deals, hotels, activities

1. Go to: https://www.expediagroup.com/affiliate/
2. Apply to Expedia Partner Solutions
3. Or try via CJ Affiliate: https://www.cj.com/
4. Fill out application similar to above

### Google Analytics Setup
1. Go to: https://analytics.google.com/
2. Create new property for squadflightfinder.com
3. Get tracking ID (G-XXXXXXXXXX)
4. Add to your site's `<head>` section:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**✅ End of Day 2:** Affiliate applications submitted, Google Analytics tracking installed

---

## Day 3-4: Mobile Testing & Fixes (5-6 hours)

### Test on Real Devices
**iPhone Safari:**
1. Open https://squadflightfinder.com on iPhone
2. Test search flow:
   - Add 3 travelers
   - Enter city names
   - Select dates
   - Click "Find Destinations"
   - View results
3. Document bugs in notes app

**Android Chrome:**
1. Repeat same flow on Android
2. Test landscape mode
3. Test different screen sizes if possible

### Common Mobile Issues to Check

**Layout Issues:**
- [ ] Does the site fit the screen? (no horizontal scrolling)
- [ ] Are buttons large enough? (44×44px minimum)
- [ ] Is text readable without zooming?
- [ ] Do forms work with mobile keyboard?

**Functionality Issues:**
- [ ] Does date picker work on mobile?
- [ ] Can you add/remove travelers easily?
- [ ] Do dropdowns/selects work?
- [ ] Are error messages visible?

**Performance Issues:**
- [ ] Does page load in <3 seconds on 4G?
- [ ] Are images optimized?
- [ ] Does search complete without timeout?

### Priority Fixes (Do These First)
1. **Make responsive** if not already:
   - Add viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
   - Use Tailwind's responsive classes (you already have Tailwind)
   - Test on mobile again

2. **Fix critical bugs only**:
   - Can't complete a search? Fix it.
   - Layout totally broken? Fix it.
   - Minor UI issues? Leave for later.

3. **Touch targets**:
   - Make buttons at least 44×44px
   - Add padding to clickable areas
   - Test with your thumb

**✅ End of Day 4:** Search flow works on mobile, critical bugs fixed

---

## Day 5-7: Legal & Admin (2-3 hours)

### Privacy Policy
**Option A: Use a generator (5 minutes)**
1. Go to: https://www.privacypolicygenerator.info/
2. Fill in:
   - Website name: Squad Flight Finder
   - Website URL: squadflightfinder.com
   - Type: Website
   - Cookies: Yes (Google Analytics)
   - Third parties: Amadeus API, Google Analytics
3. Generate and copy
4. Create `/privacy-policy.html` or add to site
5. Link in footer

**Option B: Use a template**
Copy from a similar site and customize

### Terms of Service
**Option A: Use a generator (5 minutes)**
1. Go to: https://www.termsofservicegenerator.net/
2. Fill in similar details
3. Generate and copy
4. Create `/terms-of-service.html`
5. Link in footer

**Important clauses to include:**
- "We are not responsible for booking errors"
- "Prices may change on airline websites"
- "We earn commission from affiliate links"
- "No guarantees on availability"

### Professional Email
**Option A: Free (Gmail)**
1. Use your@gmail.com for now
2. Create email signature with "Squad Flight Finder"

**Option B: Custom domain email (£3-5/month)**
1. If you have domain, set up via:
   - Google Workspace (£5/month)
   - Zoho Mail (free for 1 user)
   - Fastmail (£4/month)
2. Create: you@squadflightfinder.com or hello@squadflightfinder.com

### Domain Setup (If Not Done)
1. Buy domain: squadflightfinder.com or similar
   - Namecheap (~£10/year)
   - Google Domains (~£12/year)
2. Point to your Vercel/Netlify deployment
3. Add SSL certificate (automatic on Vercel/Netlify)

### Footer Links
Add to your site footer:
```html
<footer>
  <a href="/privacy-policy">Privacy Policy</a> |
  <a href="/terms-of-service">Terms of Service</a> |
  <a href="mailto:you@squadflightfinder.com">Contact</a>
</footer>
```

**✅ End of Day 7:** Legal pages live, professional email set up, ready to launch

---

## Week 1 Checklist

### Affiliate Setup
- [ ] Applied to Skyscanner affiliate program
- [ ] Applied to Booking.com partner program
- [ ] Applied to Expedia affiliate network (or CJ Affiliate)
- [ ] Google Analytics installed and tracking

### Mobile
- [ ] Tested on iPhone Safari
- [ ] Tested on Android Chrome
- [ ] Fixed critical mobile bugs
- [ ] Search flow works end-to-end on mobile

### Legal/Admin
- [ ] Privacy policy page created and linked
- [ ] Terms of service page created and linked
- [ ] Professional email address set up
- [ ] Domain purchased and configured (if needed)

### Bonus (If Time)
- [ ] Test affiliate links will work (add placeholder buttons)
- [ ] Plan where "Book Now" buttons will go
- [ ] Write draft of first Reddit post
- [ ] Screenshot app for social sharing

---

## What's Next (Week 2)

Once Week 1 is complete:
1. **Wait for affiliate approvals** (check email daily)
2. **Implement "Book Now" buttons** (Week 2-3)
3. **Soft launch** to friends/family (Week 3)
4. **Public launch** on Reddit (Week 4)

---

## Tips for Success

### Stay Focused
- Don't refactor code this week
- Don't add new features
- Don't optimize performance
- Just: affiliates, mobile, legal

### Track Progress
Update this checklist daily. It feels good to check things off.

### Ask for Help
If you get stuck on affiliate applications:
- Email their support
- Try alternative programs (CJ Affiliate, AWIN)
- Post in r/Affiliatemarketing

### Set Realistic Expectations
Week 1 is setup week. You won't make money yet. That's fine.

---

## Common Questions

**Q: What if affiliates reject me?**
A: Try alternative networks (CJ, AWIN). Or launch without them and apply later with traffic data.

**Q: Do I need a company/LLC?**
A: No, you can operate as an individual (sole trader). Consider forming company later if revenue grows.

**Q: What if I don't have a domain yet?**
A: Buy one this week (~£10/year). You need it for affiliate applications.

**Q: Should I use my real name or company name?**
A: Up to you. Either works. Company name sounds more professional.

**Q: How much traffic do I need for affiliates?**
A: Most programs accept 0 traffic if your site looks legitimate. Be honest in applications.

---

## Emergency Contacts

**If stuck on affiliate applications:**
- Skyscanner Support: https://www.skyscanner.net/help
- Booking.com Partner Support: partners@booking.com
- CJ Affiliate Support: https://www.cj.com/contact-us

**If stuck on mobile issues:**
- Chrome DevTools mobile emulator (test without device)
- BrowserStack (free trial for device testing)

**If stuck on legal templates:**
- Termly.io (free privacy policy generator)
- iubenda.com (more comprehensive, paid)

---

## Week 1 Time Budget

| Task | Time |
|------|------|
| Affiliate applications | 3-4 hours |
| Mobile testing & fixes | 5-6 hours |
| Legal pages | 2-3 hours |
| Email & domain setup | 2-3 hours |
| Admin/overhead | 2-3 hours |
| **Total** | **15-20 hours** |

**Daily pace:** 2-3 hours per day over 7 days

---

**Let's ship this! Start Day 1 today.** 🚀

Update this file with your progress as you go. Good luck!
