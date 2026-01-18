# Squad Flight Finder: Best-in-Class Project Roadmap

**Version:** 1.0
**Date:** January 2026
**Status:** Planning Phase

---

## Executive Summary

Squad Flight Finder has a **unique and valuable feature**: finding fair flight options for groups traveling from different locations. The current implementation is functionally complete with excellent test coverage, but lacks the architecture, documentation, and modern features expected of best-in-class flight search applications.

**Current State:**
- ✅ Core functionality working well
- ✅ 35+ UAT test scenarios passing
- ✅ Unique fairness algorithm
- ⚠️ 2,577-line monolithic component
- ❌ Generic documentation
- ❌ No user accounts or data persistence
- ❌ No monetization strategy

**Vision:** Transform Squad Flight Finder into the **#1 platform for group travel planning**, known for fairness, ease of use, and intelligent price discovery.

---

## Strategic Priorities

### 1. **Revenue First** 💰
Launch monetization within 3 months. Every feature decision should consider revenue impact. Target: £50K-100K Year 1, £250K-500K Year 2. See [MONETIZATION_STRATEGY.md](./MONETIZATION_STRATEGY.md) for detailed plan.

### 2. **Lean on Your Differentiator** 🎯
Your fairness algorithm is genuinely innovative and has NO competitors. Make it the centerpiece of everything and protect your competitive advantage.

### 3. **Technical Foundation First** 🏗️
Fix architecture and documentation before adding features. Technical debt compounds and slows revenue generation.

### 4. **Mobile-First** 📱
Most travel searches happen on mobile. PWA is non-negotiable for conversion optimization.

### 5. **Data-Driven Decisions** 📊
Implement analytics early to guide feature development and optimize conversion funnels.

---

## Project Phases

## Phase 1: Foundation & Documentation (Priority: CRITICAL)
**Goal:** Make the codebase maintainable and the project understandable
**Duration:** 1-2 weeks
**Effort:** ~60 hours

### 1.1 Documentation
- [ ] **Create comprehensive README.md**
  - Project description and unique value proposition
  - Screenshots/demo GIF
  - Setup instructions (Node version, npm install, env vars)
  - Architecture overview
  - Feature list
  - Development workflow
  - Deployment guide
  - Contributing guidelines
  - License

- [ ] **Create .env.example**
  - Document all required environment variables
  - Add instructions for getting Amadeus API keys
  - Security warnings

- [ ] **Create ARCHITECTURE.md**
  - System architecture diagram
  - Component hierarchy
  - Data flow
  - API integration points
  - Caching strategy
  - State management approach

- [ ] **Create DEPLOYMENT.md**
  - Deployment checklist
  - Environment setup (dev/staging/prod)
  - CI/CD pipeline setup
  - Monitoring and logging
  - Rollback procedures

- [ ] **Create USER_GUIDE.md**
  - How to plan a group trip
  - Understanding fairness scores
  - Tips for best results
  - FAQ
  - Troubleshooting

### 1.2 Security Hardening
- [ ] **Remove hardcoded secrets**
  - Move API keys to proper env var management
  - Add .env to .gitignore if not already
  - Document secrets in team password manager

- [ ] **Input sanitization**
  - Validate all user inputs (dates, city names, numbers)
  - Sanitize airport search queries
  - Add rate limiting for API calls

- [ ] **HTTP security headers**
  - Content Security Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security (for HTTPS)

- [ ] **Dependency audit**
  - Run `npm audit fix`
  - Review and update vulnerable dependencies
  - Set up automated security scanning (Dependabot/Snyk)

### 1.3 Code Quality Foundation
- [ ] **Merge pending safety improvements**
  - Review branch `claude/fix-app-issues-QAhRu`
  - Merge HTTP response validation
  - Merge array index safety checks

- [ ] **Add error boundaries**
  - Create ErrorBoundary component
  - Wrap main app sections
  - Add user-friendly error UI
  - Log errors to console (later: error tracking service)

- [ ] **Implement retry logic**
  - Add exponential backoff for failed API calls
  - Handle network timeouts gracefully
  - Queue requests during rate limiting

- [ ] **Add loading states**
  - Replace spinners with skeleton screens
  - Progressive disclosure of results
  - Loading progress indicators

### 1.4 Development Tooling
- [ ] **ESLint configuration**
  - Enforce consistent code style
  - Add React best practices rules
  - Add accessibility linting (eslint-plugin-jsx-a11y)

- [ ] **Git hooks**
  - Pre-commit: Run linter
  - Pre-push: Run tests
  - Setup with Husky

- [ ] **CI/CD Pipeline** (GitHub Actions)
  - Run tests on every PR
  - Run linter
  - Build validation
  - Preview deployments for PRs

**Success Metrics:**
- [ ] README has all sections complete with screenshots
- [ ] New developer can set up project in <10 minutes
- [ ] Zero hardcoded secrets in repository
- [ ] All security audits pass
- [ ] CI/CD pipeline green on main branch

---

## Phase 2: Architecture Refactoring (Priority: HIGH)
**Goal:** Break up monolithic component, improve maintainability
**Duration:** 2-3 weeks
**Effort:** ~80 hours

### 2.1 Component Extraction
- [ ] **Traveler Management Components**
  - `TravelerCard` - Individual traveler display/edit
  - `TravelerList` - Manages multiple travelers
  - `AirportSelector` - Airport selection with exclusions
  - `TravelerColorBadge` - Reusable color indicator

- [ ] **Search & Filter Components**
  - `SearchPanel` - Trip planning controls
  - `DatePicker` - Date selection
  - `BudgetSlider` - Budget control
  - `FilterControls` - Trip type, direct flights, stops
  - `SortControls` - Sort destination list

- [ ] **Results Components**
  - `DestinationCard` - Destination with pricing
  - `DestinationList` - Grid of destinations
  - `FlightResult` - Individual flight details
  - `FlightResultsList` - All traveler results
  - `FairnessScore` - Fairness visualization
  - `FairnessBreakdown` - Detailed fairness info

- [ ] **Utility Components**
  - `LoadingState` - Skeleton screens
  - `ErrorMessage` - Error display with retry
  - `EmptyState` - No results messaging
  - `ShareButton` - Share trip link
  - `DebugPanel` - Debug mode display
  - `Modal` - Reusable modal wrapper
  - `SurveyModal` - Feedback survey

### 2.2 Custom Hooks
- [ ] **API Hooks**
  - `useAmadeusAuth` - Handle authentication token
  - `useAirportSearch` - Search airports by city
  - `useFlightSearch` - Search flights
  - `useDestinationSearch` - Discover destinations

- [ ] **Business Logic Hooks**
  - `useFairness` - Calculate fairness scores
  - `useTravelers` - Manage traveler state
  - `useFilters` - Manage filter state
  - `useBudget` - Budget calculations
  - `useCache` - Cache management

- [ ] **UI Hooks**
  - `useDebugMode` - Debug keyboard shortcut
  - `useShareTrip` - Generate shareable links
  - `useLocalStorage` - Persist state
  - `useSurvey` - Survey state management

### 2.3 Service Layer
- [ ] **Extract API service**
  - `services/amadeus-api.js` - All API calls
  - `services/cache.js` - Caching logic
  - `services/api-tracker.js` - Call tracking

- [ ] **Create utility modules**
  - `utils/fairness.js` - Fairness calculations
  - `utils/airports.js` - Airport data and utilities
  - `utils/destinations.js` - Destination data
  - `utils/scoring.js` - Flight scoring logic
  - `utils/formatting.js` - Price, date, time formatting

- [ ] **Create constants module**
  - `constants/airports.js` - Airport mappings
  - `constants/destinations.js` - Destination data
  - `constants/config.js` - App configuration

### 2.4 State Management
- [ ] **Evaluate state management approach**
  - Option A: Keep useState + Context API
  - Option B: useReducer for complex state
  - Option C: Zustand (lightweight, recommended)
  - Option D: Jotai (atomic state)

- [ ] **Implement chosen solution**
  - Create stores/contexts
  - Migrate state from monolith
  - Update components to use new state

- [ ] **Add state persistence**
  - Sync critical state to localStorage
  - Hydrate on app load
  - Handle state migration

### 2.5 TypeScript Migration (Optional but Recommended)
- [ ] **Setup TypeScript**
  - Install dependencies
  - Create tsconfig.json
  - Rename files .jsx → .tsx incrementally

- [ ] **Define types**
  - Traveler type
  - Flight type
  - Destination type
  - API response types
  - Component prop types

- [ ] **Migrate incrementally**
  - Start with utility functions
  - Then services
  - Then components
  - Enable strict mode gradually

**Success Metrics:**
- [ ] No single file >500 lines
- [ ] <10 useState calls in main App component
- [ ] All API calls in service layer
- [ ] Reusable components used 3+ times
- [ ] Build time <10 seconds
- [ ] Bundle size <250KB (gzipped)

---

## Phase 3: Core User Features (Priority: HIGH)
**Goal:** Add essential features users expect
**Duration:** 3-4 weeks
**Effort:** ~100 hours

### 3.1 User Authentication & Accounts
- [ ] **Choose auth solution**
  - Option A: Email/password (simple, custom)
  - Option B: Magic link (passwordless, better UX)
  - Option C: Social auth (Google, Apple)
  - Option D: Auth service (Supabase, Firebase, Clerk)
  - **Recommendation:** Magic link + Google OAuth via Supabase

- [ ] **Implement authentication**
  - Sign up flow
  - Sign in flow
  - Sign out
  - Password reset (if applicable)
  - Session management

- [ ] **Create user profile**
  - Display name
  - Email
  - Saved airports (frequently used)
  - Preferences (currency, units)

### 3.2 Save & Manage Trips
- [ ] **Backend/Database setup**
  - Choose: Supabase (recommended), Firebase, or custom backend
  - Design schema: users, trips, searches
  - Set up database

- [ ] **Trip persistence**
  - Save trip to account
  - List saved trips
  - Load saved trip
  - Update trip
  - Delete trip
  - Duplicate trip

- [ ] **Trip metadata**
  - Trip name (user-defined)
  - Created/updated timestamps
  - Trip status (planning, booked, completed)
  - Notes field

### 3.3 Trip Sharing & Collaboration
- [ ] **Enhanced sharing**
  - Generate shareable link (keep current)
  - Add password protection option
  - Set expiration on shared links
  - View-only vs edit permissions

- [ ] **Group collaboration features**
  - Invite travelers by email
  - Each traveler edits own details
  - Comment on destinations
  - Vote on destinations
  - Group chat/notes

- [ ] **Notifications**
  - Email when invited to trip
  - Email when someone votes
  - Email when price drops (Phase 4)

### 3.4 Mobile Experience & PWA
- [ ] **Responsive design audit**
  - Test all screens on mobile
  - Fix layout issues
  - Optimize touch targets (44×44px minimum)
  - Improve mobile navigation

- [ ] **Progressive Web App**
  - Create manifest.json
  - Add service worker
  - Offline fallback page
  - Add to home screen prompt
  - App icon (multiple sizes)

- [ ] **Mobile optimizations**
  - Reduce bundle size
  - Lazy load components
  - Optimize images
  - Touch gestures (swipe to delete traveler)

### 3.5 Booking Integration ⭐ PRIMARY REVENUE STREAM

**Target Revenue Year 1:** £36,000 (affiliate commissions)
**Target Revenue Year 2:** £126,000

**Expected Commission:** £15 average per traveler booked
**Target Conversion:** 5% free users, 15% Pro users book

- [ ] **Choose booking approach**
  - Option A: Deep links to airlines (easiest, affiliate revenue) ✅ START HERE
  - Option B: Deep links to OTAs (Expedia, Booking.com) ✅ PARALLEL
  - Option C: Amadeus booking API (complex, full control) - Year 2
  - **Recommendation:** Start with A+B for maximum revenue

- [ ] **Implement booking flow**
  - Prominent "Book Now" buttons (test colors/placement)
  - Track referrals (affiliate links with attribution)
  - Booking confirmation page
  - Add to trip history
  - Email confirmation with details
  - Follow-up: "Did you book successfully?"

- [ ] **Affiliate partnerships** (Apply ASAP)
  - Skyscanner Affiliate Program (30-day cookie, good rates) - PRIORITY 1
  - Booking.com Partner Program (25% on hotels too) - PRIORITY 2
  - Expedia Affiliate Network (package deals) - PRIORITY 3
  - CJ Affiliate (multiple airlines)
  - AWIN (European airlines)
  - Direct airline programs (BA, Ryanair, EasyJet)
  - Implement tracking codes
  - Revenue dashboard (track by partner)
  - A/B test CTAs and messaging

- [ ] **Conversion Optimization**
  - Price guarantees ("We'll refund if you find cheaper")
  - Urgency indicators ("Price may increase")
  - Trust signals (secure booking, ATOL protected)
  - Clear value prop ("Book directly, we just help you compare")
  - Mobile-optimized booking flow

### 3.6 Itinerary Management
- [ ] **Export features**
  - Email itinerary to all travelers
  - Generate PDF itinerary
  - Export to calendar (.ics file)
  - Print-friendly view

- [ ] **Itinerary details**
  - Flight details for all travelers
  - Airport information
  - Booking confirmation numbers (if available)
  - Trip timeline
  - Cost breakdown

- [ ] **Expand beyond flights**
  - Add hotel search (Amadeus Hotels API)
  - Add activities/tours
  - Add car rental
  - Add travel insurance options
  - Package deals (flight + hotel discounts)

**Success Metrics:**
- [ ] User signup conversion >20%
- [ ] Saved trips per user >2
- [ ] Shared trip click-through >15%
- [ ] Mobile responsive scores 100/100 (Lighthouse)
- [ ] PWA installable on iOS and Android
- [ ] Booking referrals tracked (baseline metric)

---

## Phase 4: Differentiation & Intelligence (Priority: MEDIUM)
**Goal:** Leverage fairness algorithm and add smart features
**Duration:** 4-6 weeks
**Effort:** ~120 hours

### 4.1 Enhanced Fairness Features
- [ ] **Fairness Optimization Mode**
  - Analyze fairness across date ranges
  - Suggest alternative dates with better fairness
  - "If you leave 2 days earlier, fairness improves by 23%"
  - Visual calendar heatmap of fairness scores

- [ ] **Cost-Sharing Calculator**
  - When fairness is low, suggest splitting costs
  - "Alice pays £300, Bob pays £450, Charlie pays £300 = Fair split"
  - Venmo/PayPal integration for payment requests
  - Split by fairness weight vs equal split

- [ ] **Group Budget Pooling**
  - Alternative to per-person budgets
  - "We have £1500 total, optimize fairness"
  - Show savings: "Pooling saves £120 vs individual budgets"

- [ ] **Fairness History & Trends**
  - Compare fairness across destinations
  - "Paris has 15% better fairness than Rome for your group"
  - Show fairness over time (seasonal trends)

- [ ] **Fairness Report Export**
  - PDF summary for group
  - Why this destination is fair
  - Cost breakdown with charts
  - Alternative scenarios

### 4.2 Price Intelligence
- [ ] **Price Tracking & Alerts**
  - "Watch this trip" button
  - Daily/weekly price checks
  - Email/push notifications on price drops
  - Price drop threshold (5%, 10%, 15%)
  - Dashboard of watched trips

- [ ] **Price History**
  - 30/60/90-day price charts
  - Historical average for route
  - Price trend indicator (↑ rising, ↓ falling, → stable)
  - Data source: Track own searches + external APIs

- [ ] **Price Predictions**
  - ML model or heuristics for predictions
  - "Book now" vs "Wait, likely to drop"
  - Confidence levels
  - Historical accuracy tracking
  - Use Amadeus Flight Price Analysis API

- [ ] **Flexible Dates Grid**
  - Calendar view with prices per day
  - Heatmap: green (cheap) to red (expensive)
  - Click date to search
  - Date range suggestions
  - "Cheapest week" indicator

- [ ] **Price Freeze** (Partnership feature)
  - Hold price for 24-48 hours
  - Small fee or premium feature
  - Integration with Hopper or similar
  - Clear expiration countdown

### 4.3 Advanced Search Capabilities
- [ ] **Multi-city Trips**
  - Add multiple destination legs
  - London → Paris → Rome → London
  - Optimize route order
  - Price comparison: multi-city vs separate bookings

- [ ] **Open-jaw Flights**
  - Fly into City A, return from City B
  - "Fly into London, return from Paris"
  - Surface travel between (train, bus, car)

- [ ] **Flexible Destinations**
  - "Anywhere under £200"
  - "Any beach destination"
  - "Somewhere warm in February"
  - Interactive map to explore options

- [ ] **Trip Length Flexibility**
  - ±1, ±2, ±3 days
  - Show savings: "2 days longer saves £80"
  - Weekend vs weekday analysis

- [ ] **Nearby Airports Comparison**
  - Visual map of all airports
  - Distance and price for each
  - Total travel time (flight + ground transport)
  - Recommend best balance

- [ ] **Stopover Exploration**
  - Long layover? Show things to do
  - "8-hour layover in Dubai: Visit Burj Khalifa"
  - Book stopover as mini-trip
  - Partner with tour operators

### 4.4 Sustainability Features
- [ ] **Carbon Footprint Calculator**
  - CO2 emissions per flight
  - Per traveler impact
  - Compare to driving, train
  - Visual impact (trees needed to offset)

- [ ] **Eco-friendly Filters**
  - Sort by lowest emissions
  - Show "green" badge on efficient flights
  - Prefer direct flights (lower emissions)
  - Highlight newer aircraft (more efficient)

- [ ] **Carbon Offset Integration**
  - Partner with offset providers
  - One-click offset purchase
  - Track total offsets over time
  - Certificates and impact reports

- [ ] **Alternative Transport**
  - Suggest train if <500 miles
  - "Train to Paris: 3hrs, saves 80% CO2"
  - Bus options (FlixBus, Megabus)
  - Compare price + time + environmental impact

### 4.5 Personalization & AI
- [ ] **Learning from Past Searches**
  - Remember frequently searched routes
  - Quick access to "Your usual searches"
  - Predict destination based on time of year

- [ ] **Smart Recommendations**
  - "Based on your searches, you might like..."
  - Seasonal suggestions
  - Similar destinations
  - "Users like you also searched for..."

- [ ] **Preference Learning**
  - Remember direct flight preference
  - Remember airline preferences
  - Remember time of day preferences
  - Budget patterns

- [ ] **AI-Powered Suggestions**
  - "Why not try Prague? Similar to Budapest but 20% cheaper"
  - "Peak season in Greece, consider Croatia instead"
  - Natural language search: "Beach holiday for 4, under £500, next month"

**Success Metrics:**
- [ ] Price alert signup rate >30%
- [ ] Fairness optimization used in >40% of searches
- [ ] Flexible dates usage >25%
- [ ] Carbon offset conversion >5%
- [ ] Personalized suggestions click-through >20%
- [ ] Multi-city feature adoption >10%

---

## Phase 5: Scale & Polish (Priority: MEDIUM)
**Goal:** Performance, reliability, and professional polish
**Duration:** 3-4 weeks
**Effort:** ~80 hours

### 5.1 Performance Optimization
- [ ] **Code Splitting**
  - Split by route (if using React Router)
  - Lazy load results page
  - Lazy load modals
  - Lazy load large libraries

- [ ] **Bundle Optimization**
  - Analyze with Webpack Bundle Analyzer
  - Tree-shake unused code
  - Replace large dependencies with smaller alternatives
  - Target: <200KB initial bundle (gzipped)

- [ ] **Image Optimization**
  - Use WebP format
  - Lazy load images
  - Responsive images (srcset)
  - CDN delivery

- [ ] **Caching Strategy**
  - Service worker caching
  - CDN caching (CloudFlare, Vercel)
  - API response caching (already have, optimize)
  - Browser caching headers

- [ ] **Virtual Scrolling**
  - If >50 destinations, use virtual list
  - React-window or react-virtualized
  - Improves render performance

- [ ] **Web Vitals Optimization**
  - LCP (Largest Contentful Paint) <2.5s
  - FID (First Input Delay) <100ms
  - CLS (Cumulative Layout Shift) <0.1
  - Monitor with Lighthouse CI

### 5.2 Reliability & Error Handling
- [ ] **Comprehensive Error Boundaries**
  - Catch errors at component level
  - Graceful degradation
  - Error reporting to service
  - User-friendly error messages

- [ ] **API Error Handling**
  - Retry with exponential backoff
  - Queue requests during rate limiting
  - Fallback to cached data
  - Clear error messages to user

- [ ] **Offline Support**
  - Service worker caching
  - Offline indicator
  - Queue actions for when online
  - Cached search results

- [ ] **Edge Case Handling**
  - No results found (suggest alternatives)
  - API timeout (retry + helpful message)
  - Invalid dates (validation + helpful error)
  - Network failures (retry + offline mode)

### 5.3 Monitoring & Analytics
- [ ] **Error Tracking**
  - Integrate Sentry or Rollbar
  - Track JavaScript errors
  - Track API failures
  - Set up alerts for critical errors

- [ ] **Performance Monitoring**
  - Real User Monitoring (RUM)
  - Track Web Vitals
  - API response times
  - Page load times by route

- [ ] **User Analytics**
  - Privacy-friendly: Plausible or Fathom
  - Track key user journeys
  - Funnel analysis (search → results → share)
  - Conversion tracking (booking referrals)
  - Heatmaps and session recordings (Hotjar)

- [ ] **A/B Testing Framework**
  - Feature flags (LaunchDarkly, Flagsmith, or custom)
  - Test different UI variations
  - Test fairness algorithm tweaks
  - Measure conversion impact

- [ ] **API Monitoring Dashboard**
  - Track API usage (approaching limits?)
  - Cache hit rates
  - Response times
  - Error rates
  - Cost tracking

### 5.4 Testing Expansion
- [ ] **Visual Regression Tests**
  - Chromatic or Percy
  - Catch UI regressions
  - Test responsive layouts
  - Component visual tests

- [ ] **E2E Tests in CI**
  - Playwright tests (already installed)
  - Critical user paths
  - Run on every PR
  - Parallel execution for speed

- [ ] **Performance Testing**
  - Lighthouse CI
  - Bundle size budgets
  - API load testing (artillery, k6)
  - Fail CI if budgets exceeded

- [ ] **Accessibility Testing**
  - Axe-core automated tests
  - Manual screen reader testing
  - Keyboard navigation testing
  - WCAG 2.1 AA compliance
  - Color contrast validation

- [ ] **Cross-browser Testing**
  - Test on Safari, Chrome, Firefox, Edge
  - iOS Safari (often has issues)
  - Android Chrome
  - BrowserStack or LambdaTest

### 5.5 User Experience Polish
- [ ] **Animations & Transitions**
  - Framer Motion or React Spring
  - Page transitions
  - Component entrance/exit
  - Loading state transitions
  - Micro-interactions (button hover, etc.)

- [ ] **Keyboard Shortcuts**
  - / to focus search
  - Esc to close modals
  - Cmd+S to save trip
  - Cmd+K for command palette
  - Arrow keys for navigation

- [ ] **Undo/Redo**
  - For traveler changes
  - For filter changes
  - Visual feedback
  - Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

- [ ] **Onboarding Tour**
  - First-time user guide
  - Highlight key features
  - Interactive tooltips
  - Skip option
  - Show once (localStorage flag)

- [ ] **Empty States**
  - Helpful illustrations
  - Clear next steps
  - Example scenarios
  - No results: suggest alternatives

- [ ] **Loading States**
  - Skeleton screens (not just spinners)
  - Progressive disclosure
  - Optimistic UI updates
  - Loading progress indicators

- [ ] **Contextual Help**
  - Tooltips on complex features
  - Info icons with explanations
  - Help modal with FAQs
  - Link to user guide

**Success Metrics:**
- [ ] Lighthouse score >95 (performance, accessibility, best practices)
- [ ] Page load time <2 seconds (75th percentile)
- [ ] Error rate <0.1%
- [ ] 95% of users complete search successfully
- [ ] Zero critical accessibility violations

---

## Phase 6: Internationalization & Growth (Priority: LOW)
**Goal:** Expand to new markets and drive user acquisition
**Duration:** 4-6 weeks
**Effort:** ~100 hours

### 6.1 Internationalization (i18n)
- [ ] **Setup i18n Framework**
  - React-i18next or FormatJS
  - Extract all strings to language files
  - Language switcher UI

- [ ] **Language Support**
  - Spanish (2nd largest market)
  - French
  - German
  - Italian
  - Portuguese
  - Mandarin (future)

- [ ] **Localization (L10n)**
  - Date formats by locale
  - Number formats (1,000 vs 1.000)
  - Currency display
  - Time zones handling
  - Right-to-left (RTL) support (Arabic, Hebrew)

- [ ] **Regional Features**
  - Country-specific airports
  - Local holidays awareness
  - Regional payment methods
  - Compliance (GDPR, CCPA, etc.)

### 6.2 SEO & Content Marketing
- [ ] **Technical SEO**
  - Meta tags (title, description, OG, Twitter)
  - Semantic HTML
  - Structured data (Schema.org)
  - Sitemap.xml
  - Robots.txt
  - Canonical URLs

- [ ] **Content Pages**
  - Landing pages for popular routes
  - "Best group destinations from [City]"
  - Travel guides (SEO content)
  - Blog (travel tips, fairness stories)

- [ ] **Dynamic SEO**
  - Generate pages for top routes
  - City-specific landing pages
  - Destination guides

### 6.3 User Acquisition
- [ ] **Referral Program**
  - "Invite 3 friends, get Pro free"
  - Unique referral codes
  - Track referrals
  - Rewards dashboard

- [ ] **Social Sharing**
  - Share trip on Twitter/X
  - Share on Facebook
  - Share on WhatsApp (mobile)
  - Open Graph images (auto-generated)
  - "I saved £300 with Squad Flight Finder!"

- [ ] **Email Marketing**
  - Collect emails (with consent)
  - Welcome email series
  - Price drop alerts
  - Destination inspiration emails
  - Newsletter (monthly)

- [ ] **Partnerships**
  - Travel bloggers
  - Student unions (group travel)
  - Corporate travel departments
  - University travel clubs

### 6.4 Premium Features (Monetization) ⭐ REVENUE CRITICAL

**Target Revenue Year 1:** £60,000 ARR (500 Pro users × £9.99/month)
**Target Revenue Year 2:** £440,000 ARR (3,500 Pro users × £9.99/month)

See [MONETIZATION_STRATEGY.md](./MONETIZATION_STRATEGY.md) for complete revenue plan.

- [ ] **Free Tier** (User Acquisition)
  - Up to 3 travelers (forces upgrade at 4)
  - 5 searches per month (creates scarcity)
  - Basic search only
  - No price alerts (key Pro feature)
  - No save trips (localStorage only)

- [ ] **Pro Tier** (£9.99/month or £79/year - £20 saved)
  - **Unlimited travelers** (key for groups)
  - **Unlimited searches**
  - **Price tracking & alerts** (highest value feature)
  - **Unlimited saved trips**
  - **Fairness optimization suggestions** (monetize your differentiator!)
  - **Export itineraries (PDF)**
  - **Priority support**
  - **No ads**
  - **Early access to new features**
  - Target: 5-7% conversion rate

- [ ] **Team Tier** (£29.99/month - B2B focus)
  - Everything in Pro
  - Multiple trip organizers
  - Admin dashboard
  - Team collaboration
  - Branded exports
  - API access (future)
  - Dedicated account manager
  - Volume booking discounts
  - Target: 10 teams Year 1, 50 teams Year 2

- [ ] **Payment Integration**
  - Stripe (recommended - best UX)
  - Subscription management
  - 14-day free trial (increases conversion)
  - Upgrade/downgrade flows
  - Billing portal
  - Dunning (failed payment recovery)
  - Promo codes / discounts
  - Annual plan incentives

- [ ] **Conversion Optimization**
  - Contextual upgrade prompts
  - Feature gating at right moments
  - Social proof ("Join 500 Pro users")
  - Exit intent offers
  - Email nurture sequences
  - A/B test pricing and messaging

### 6.5 Community & Support
- [ ] **Support System**
  - Help center (FAQ, guides)
  - Email support
  - Live chat (Intercom, Crisp)
  - Response time SLA

- [ ] **Community Building**
  - Discord or Slack community
  - User stories showcase
  - Feature voting board
  - Beta testing program

- [ ] **Feedback Loop**
  - In-app feedback widget
  - NPS surveys
  - Feature requests
  - Bug reports
  - Product roadmap transparency

**Success Metrics:**
- [ ] Launch in 3+ languages
- [ ] Organic search traffic >1,000/month
- [ ] Referral conversion rate >15%
- [ ] Premium conversion rate >5%
- [ ] NPS score >50
- [ ] Support response time <24 hours

---

## Quick Wins (Start Today)

These high-impact, low-effort improvements can be done immediately:

1. **Write proper README.md** (2 hours)
   - What is Squad Flight Finder?
   - How to set up
   - Screenshots

2. **Create .env.example** (10 minutes)
   - Document environment variables
   - Security best practices

3. **Add error boundaries** (1 hour)
   - Catch React errors
   - User-friendly error UI

4. **Implement retry logic** (1 hour)
   - Exponential backoff for API failures
   - Better resilience

5. **Add loading skeletons** (2 hours)
   - Replace spinners with content placeholders
   - Feels faster

6. **Extract TravelerCard component** (2 hours)
   - First step toward refactoring
   - More maintainable

7. **Add PWA manifest** (30 minutes)
   - Enable "Add to Home Screen"
   - Professional feel

8. **Add meta tags for SEO** (30 minutes)
   - Better social sharing
   - Improved discoverability

9. **Set up Plausible Analytics** (1 hour)
   - Privacy-friendly analytics
   - Understand user behavior

10. **Create backup of .env** (5 minutes)
    - Store API keys securely
    - Document where they're from

**Total: ~11 hours for significant improvements**

---

## Success Metrics Dashboard

Track these KPIs to measure progress toward "best-in-class":

### Technical Health
- [ ] Lighthouse Performance Score: >95
- [ ] Lighthouse Accessibility Score: >95
- [ ] Lighthouse Best Practices Score: >95
- [ ] Bundle Size (gzipped): <200KB
- [ ] Page Load Time (P75): <2s
- [ ] Error Rate: <0.1%
- [ ] API Success Rate: >99.5%
- [ ] Test Coverage: >80%

### User Experience
- [ ] Search Completion Rate: >90%
- [ ] Share Trip Rate: >20%
- [ ] Return Visitor Rate: >40%
- [ ] Mobile Usage: >60%
- [ ] Average Searches per Session: >2
- [ ] Time to First Search: <2 minutes

### Business
- [ ] User Signup Rate: >20%
- [ ] Premium Conversion: >5%
- [ ] Booking Referral Click-through: >15%
- [ ] Affiliate Revenue: Track baseline, then >$500/month
- [ ] NPS Score: >50
- [ ] Monthly Active Users: Target 10,000 by end of year

### Growth
- [ ] Organic Search Traffic: >1,000/month
- [ ] Social Shares: >500/month
- [ ] Referral Signups: >100/month
- [ ] Email Subscribers: >5,000
- [ ] Blog Traffic: >2,000/month

---

## Risk Assessment

### Technical Risks
1. **Amadeus API Limits** (HIGH)
   - Mitigation: Aggressive caching, smart limiting, upgrade plan

2. **Monolith Refactoring** (MEDIUM)
   - Risk: Breaking existing functionality
   - Mitigation: Incremental refactoring, comprehensive tests

3. **TypeScript Migration** (LOW)
   - Risk: Time investment
   - Mitigation: Optional, incremental approach

### Business Risks
1. **No Clear Monetization** (HIGH)
   - Mitigation: Phase 4 & 6 focus on revenue

2. **Competitive Market** (MEDIUM)
   - Mitigation: Lean on unique fairness feature

3. **User Acquisition Cost** (MEDIUM)
   - Mitigation: SEO-first, viral features (sharing, referrals)

### Product Risks
1. **Feature Creep** (MEDIUM)
   - Mitigation: Stick to roadmap, validate with users

2. **Poor Mobile Experience** (HIGH)
   - Mitigation: Phase 3 prioritizes mobile + PWA

---

## Resource Requirements

### Team
- **1 Full-stack Developer** (current)
- **+1 Frontend Developer** (Phase 2+)
- **+1 Backend/DevOps** (Phase 3+ for scaling)
- **+1 Designer** (Part-time, Phase 3+ for polish)
- **+1 Product Manager** (Phase 4+ to prioritize features)

### Tools & Services
- **Development:** VS Code, Git, GitHub
- **Hosting:** Vercel (recommended), Netlify, or AWS
- **Database:** Supabase (recommended), Firebase, or PostgreSQL
- **Auth:** Supabase Auth, Clerk, or Auth0
- **Monitoring:** Sentry (errors), Plausible (analytics), Vercel Analytics
- **Payments:** Stripe
- **Email:** SendGrid, Mailgun, or Resend
- **API:** Amadeus (current)

### Budget Estimate (Annual)
- Hosting: $100-500/year (Vercel Pro)
- Database: $0-250/year (Supabase)
- Auth: $0-300/year (included in Supabase)
- Monitoring: $0-500/year (Sentry, Plausible)
- Email: $100/year
- Amadeus API: $0-2,000/year (depends on usage)
- **Total: $200-3,650/year**

---

## Decision Log

Use this section to document key architectural and product decisions.

### Decision 1: State Management
- **Date:** TBD
- **Decision:** [Zustand / Context API / useReducer]
- **Rationale:**
- **Alternatives Considered:**

### Decision 2: Authentication Provider
- **Date:** TBD
- **Decision:** [Supabase / Firebase / Clerk / Custom]
- **Rationale:**
- **Alternatives Considered:**

### Decision 3: Monetization Strategy
- **Date:** TBD
- **Decision:** [Freemium / Affiliate-only / Hybrid]
- **Rationale:**
- **Alternatives Considered:**

---

## Next Steps

1. **Review this roadmap** with stakeholders
2. **Prioritize phases** based on resources
3. **Create GitHub Projects** board for tracking
4. **Break down Phase 1** into issues
5. **Start with Quick Wins** to build momentum
6. **Set up weekly reviews** to track progress

---

## Appendix

### A. Competitive Analysis

**Google Flights:**
- ✅ Price tracking, date grid, explore map
- ❌ No group search, no fairness

**Skyscanner:**
- ✅ Everywhere search, price alerts, flexible dates
- ❌ No group search, no fairness

**Hopper:**
- ✅ Price predictions, price freeze
- ❌ No group search, no fairness

**Kayak:**
- ✅ Price forecasts, hacker fares
- ❌ No group search, no fairness

**Your Advantage:** You're the ONLY app focused on group fairness

### B. User Personas

**Persona 1: The Organizer (Primary)**
- Sarah, 28, London
- Plans annual friends trip
- 6-8 people, different cities
- Wants fair prices, easy coordination
- Tech-savvy, mobile-first

**Persona 2: The Budget Traveler**
- Alex, 24, Manchester
- Student, tight budget
- Travels with university friends
- Price-sensitive, flexible dates
- Uses mobile exclusively

**Persona 3: The Family Planner**
- Rachel, 42, Birmingham
- Plans family reunions
- 10-15 people, multi-generational
- Needs simplicity, trustworthy
- Desktop and mobile

### C. Key User Journeys

**Journey 1: First-time User**
1. Lands on homepage
2. Sees explanation of fairness
3. Adds 3 travelers
4. Searches destinations
5. Sees results with fairness scores
6. Shares with group
7. Signs up to save trip

**Journey 2: Returning User**
1. Signs in
2. Views saved trips
3. Loads previous search
4. Updates dates
5. Re-runs search
6. Compares to last time
7. Books flights via affiliate link

**Journey 3: Group Collaboration**
1. User A creates trip and invites friends
2. User B receives email, clicks link
3. User B adds their origin city
4. User C does the same
5. All users vote on destinations
6. User A books based on consensus

### D. Feature Prioritization Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Documentation | High | Low | P0 (Critical) |
| Component Refactoring | High | High | P0 (Critical) |
| User Authentication | High | Medium | P1 (High) |
| Save Trips | High | Medium | P1 (High) |
| PWA | High | Low | P1 (High) |
| Price Alerts | High | High | P2 (Medium) |
| Fairness Optimization | High | High | P2 (Medium) |
| Multi-city Trips | Medium | High | P3 (Low) |
| Carbon Footprint | Medium | Low | P3 (Low) |
| Internationalization | Medium | High | P3 (Low) |

---

**Document Version:** 1.0
**Last Updated:** January 17, 2026
**Next Review:** After Phase 1 completion

---

*This roadmap is a living document. Update it as you learn from users, market changes, and implementation experiences.*
