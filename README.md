# ✈️ Squad Flight Finder

**Find fair flights for groups traveling from different locations.**

Squad Flight Finder solves a real problem: when friends or family want to travel together from different cities, finding a destination that's fair for everyone is hard. We use a unique fairness algorithm to ensure nobody pays significantly more than others.

![Squad Flight Finder](https://via.placeholder.com/800x400/6366f1/ffffff?text=Squad+Flight+Finder+Screenshot)
*Screenshot coming soon*

---

## 🌟 Why Squad Flight Finder?

- **🎯 Fairness First**: Our proprietary algorithm calculates price fairness across all travelers
- **🔍 Smart Search**: Automatically finds nearby airports and optimizes search strategy
- **💰 Budget-Aware**: Set per-person budgets and find destinations that work for everyone
- **🗺️ Destination Discovery**: Suggests destinations based on your group's locations
- **📊 Transparent Pricing**: See exactly why one destination is fairer than another
- **🔗 Easy Sharing**: Generate shareable links for group decision-making

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- **API Provider** (choose one):
  - **Travelpayouts API** (recommended) - Free with affiliate commissions
  - **Amadeus API** - Paid API with test environment

### Installation

```bash
# Clone the repository
git clone https://github.com/karterbyrne-bit/squad-flight-finder.git
cd squad-flight-finder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API credentials (see below)

# Start development server with Vercel Functions
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Choosing Your Flight API Provider

Squad Flight Finder supports two flight APIs. Choose the one that fits your needs:

#### Option 1: Travelpayouts API (Recommended) 💚

**Why choose Travelpayouts:**
- ✅ **Completely FREE** - No API costs
- ✅ **Earn commissions** - Get paid when users book flights
- ✅ **Unlimited cached searches** - Fast destination discovery
- ✅ **Real-time prices** - 200 searches/hour for final bookings
- ⚠️ **30-60 second search** - Real-time searches take longer

**Perfect for:** Production use, low-traffic apps, earning revenue

**Setup Instructions:**

1. Go to [Travelpayouts](https://www.travelpayouts.com/)
2. Sign up for a free account
3. Go to **Tools → API** in the dashboard
4. Copy your **API Token**
5. Go to **Tools → Deeplinks** to get your **Marker ID** (for commissions)
6. Add to your `.env`:

```env
# Flight API Selection
VITE_FLIGHT_API_PROVIDER=travelpayouts

# Travelpayouts Credentials
TRAVELPAYOUTS_TOKEN=your_api_token_here
TRAVELPAYOUTS_MARKER=your_marker_id_here
```

**Expected Performance:**
- Step 2 (Destinations): Instant results (cached data)
- Step 3 (Flight Search): 30-60 seconds (real-time search)
- Rate Limit: 200 searches/hour (sufficient for 5,000+ sessions/month)

#### Option 2: Amadeus API (Paid) 💰

**Why choose Amadeus:**
- ✅ **Fast searches** - Real-time results in 3-5 seconds
- ✅ **Comprehensive data** - More airlines and routes
- ⚠️ **Expensive** - ~€1,400/month @ 5,000 sessions
- ⚠️ **Test environment** - Free tier has limited data

**Perfect for:** Development/testing, high-budget production

**Setup Instructions:**

1. Go to [Amadeus for Developers](https://developers.amadeus.com/)
2. Sign up for a free account
3. Create a new app in the dashboard
4. Copy your API Key and API Secret
5. Add to your `.env`:

```env
# Flight API Selection
VITE_FLIGHT_API_PROVIDER=amadeus

# Amadeus Credentials
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
```

**Note:** The free test environment has limited flight data. Production requires a paid plan.

#### Switching Between APIs

Simply change `VITE_FLIGHT_API_PROVIDER` in your `.env` file:

```env
# Use Travelpayouts (free, earns commission)
VITE_FLIGHT_API_PROVIDER=travelpayouts

# OR use Amadeus (paid, faster)
VITE_FLIGHT_API_PROVIDER=amadeus
```

The app automatically adapts - no code changes needed!

---

## 📖 How It Works

### Step 1: Add Your Group
Add travelers with their origin cities. We automatically discover nearby airports.

### Step 2: Set Preferences
- Set budget per person
- Choose travel dates
- Select filters (direct flights, max stops, etc.)

### Step 3: Discover Destinations
We analyze 30+ destinations and calculate:
- Average price for your group
- Price range (min to max)
- **Fairness score** (how evenly distributed costs are)

### Step 4: View Fair Options
See flights for each traveler with:
- Individual costs
- Fairness breakdown
- Flight details (times, carriers, stops)

### Step 5: Share & Book
Generate a shareable link for your group and book via partner links.

---

## 🎨 Features

### Core Features
- ✅ Multi-traveler search (up to 10 people)
- ✅ Smart airport discovery and selection
- ✅ Fairness calculation and visualization
- ✅ Budget management
- ✅ Flexible filtering (trip type, direct flights, stops)
- ✅ Round-trip and one-way support
- ✅ Intelligent caching (reduces API calls)
- ✅ Shareable trip links

### Coming Soon (See [Roadmap](./PROJECT_ROADMAP.md))
- 🔜 User accounts and saved trips
- 🔜 Price tracking and alerts
- 🔜 Mobile app (PWA)
- 🔜 Fairness optimization suggestions
- 🔜 Multi-city trips
- 🔜 Group collaboration features

---

## 💰 Monetization

Squad Flight Finder supports multiple revenue streams:

### Travelpayouts Affiliate Commissions
When using Travelpayouts API, the app automatically generates affiliate links. Users book through Aviasales, and you earn commission on completed bookings - typically **0.5-1.5% of ticket price**.

**Expected Revenue (5,000 sessions/month):**
- Conversion rate: 2%
- Bookings per month: 100
- Average ticket: €300
- Commission rate: 1%
- **Monthly revenue: €60-€150**

### Google AdSense (Optional)
Display ads in the flight results page. Configure in `.env`:

```env
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_RESULTS=1234567890
```

**Expected Revenue (5,000 sessions/month):**
- Budget travel audience
- Ad placements: 1 per search
- **Monthly revenue: €50-€150**

### Combined Revenue Model
With Travelpayouts (free) + AdSense:
- API costs: **€0**
- Revenue: **€110-€300/month** @ 5,000 sessions
- **Net profit: €110-€300/month**

Compare to Amadeus:
- API costs: **€1,400/month** @ 5,000 sessions
- Revenue: €110-€300/month
- **Net loss: €1,100-€1,290/month**

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19.2, Tailwind CSS, Vite
- **Backend**: Vercel Functions (serverless)
- **APIs**:
  - Travelpayouts Flight API (free, affiliate model)
  - Amadeus Flight Search API (paid)
  - Switchable via environment variable
- **Monetization**: Google AdSense, affiliate commissions
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel

### Security Architecture
```
Browser → Vercel Functions → Flight API (Travelpayouts or Amadeus)
```

API credentials are **never** exposed to the browser. All flight API calls go through secure backend functions with server-side authentication. See [SECURITY.md](./SECURITY.md) for details.

### Project Structure
```
squad-flight-finder/
├── src/
│   ├── hooks/            # Custom React hooks
│   │   ├── useAmadeusAPI.js
│   │   ├── useTravelpayoutsAPI.js
│   │   └── useFlightAPI.js (provider wrapper)
│   ├── utils/            # Utility functions
│   ├── components/       # React components
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Entry point
├── api/                  # Backend API (Vercel serverless)
│   ├── _utils/           # Shared utilities
│   │   ├── amadeus.js    # Amadeus authentication & helpers
│   │   └── travelpayouts.js  # Travelpayouts auth & data mapping
│   ├── travelpayouts/    # Travelpayouts endpoints
│   │   ├── search-destinations-cached.js
│   │   └── search-flights-realtime.js
│   ├── search-airports.js
│   ├── search-flights.js
│   └── search-destinations.js
├── tests/
│   ├── 01-core-flight-search.test.jsx
│   ├── 02-filtering-sorting.test.jsx
│   ├── 03-traveler-management.test.jsx
│   ├── 04-error-handling.test.jsx
│   └── utils/            # Test helpers and mocks
├── .env                  # Environment variables (create from .env.example)
├── vercel.json           # Vercel configuration
├── package.json
└── vite.config.js
```

**Note:** We're planning a major refactoring to extract more components and services. See [Architecture Roadmap](./PROJECT_ROADMAP.md#phase-2-architecture-refactoring).

---

## 🧪 Testing

We have comprehensive test coverage with 35+ User Acceptance Test scenarios.

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

See [UAT Test Guide](./UAT_TEST_GUIDE.md) for detailed test documentation.

---

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint
- `npm test` - Run tests in watch mode

### Environment Variables

Create a `.env` file based on your chosen API provider:

#### For Travelpayouts (Recommended):
```env
# ============================================================================
# FLIGHT API SELECTION
# ============================================================================
VITE_FLIGHT_API_PROVIDER=travelpayouts

# ============================================================================
# TRAVELPAYOUTS API CREDENTIALS
# ============================================================================
TRAVELPAYOUTS_TOKEN=your_api_token_here
TRAVELPAYOUTS_MARKER=your_marker_id_here

# ============================================================================
# OPTIONAL: GOOGLE ADSENSE (MONETIZATION)
# ============================================================================
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_RESULTS=1234567890
```

#### For Amadeus:
```env
# ============================================================================
# FLIGHT API SELECTION
# ============================================================================
VITE_FLIGHT_API_PROVIDER=amadeus

# ============================================================================
# AMADEUS API CREDENTIALS
# ============================================================================
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
```

**⚠️ Security Note:** Never commit `.env` to version control. The repository includes `.env.example` as a template with all options documented.

### Debug Mode

Press `Ctrl+Shift+D` to toggle debug mode and see:
- API call statistics
- Cache hit rates
- Airport search logs
- Traveler data

---

## 📊 Project Status

**Current Version:** 0.1.0 (Alpha)
**Status:** Feature-complete prototype, planning production improvements

See our [Project Roadmap](./PROJECT_ROADMAP.md) for detailed plans to become best-in-class.

### Recent Updates
- ✅ **Dual API support** - Travelpayouts (free) + Amadeus (paid)
- ✅ **Affiliate monetization** - Earn commissions on bookings
- ✅ **API cost optimization** - Reduced costs by 20-25%
- ✅ Google AdSense integration
- ✅ Comprehensive UAT test suite (35+ scenarios)
- ✅ Advanced caching system
- ✅ Fairness calculation algorithm
- ✅ Smart airport limiting

### Next Priorities
1. Documentation improvements
2. Component refactoring
3. User authentication
4. Mobile PWA

---

## 💼 Commercial Project

Squad Flight Finder is a **commercial product** under active development. This repository is private and proprietary.

### For Team Members
See internal documentation for development workflows and contribution guidelines.

---

## 📜 License

**Proprietary and Confidential**

Copyright © 2026 Squad Flight Finder. All rights reserved.

This software and associated documentation files are proprietary. Unauthorized copying, distribution, modification, or use is strictly prohibited.

---

## 🙏 Acknowledgments

- [Travelpayouts API](https://www.travelpayouts.com/) - Free flight search with affiliate commissions
- [Amadeus API](https://developers.amadeus.com/) - Premium flight search data
- [Google AdSense](https://www.google.com/adsense/) - Monetization platform
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 📧 Contact

- **Business Inquiries**: contact@squadflightfinder.com *(coming soon)*
- **Internal Issues**: Use GitHub Issues (team access only)

---

## 🗺️ Roadmap

For our detailed roadmap to becoming best-in-class, see [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md).

**Key Milestones:**
- **Phase 1** (Q1 2026): Documentation & Architecture
- **Phase 2** (Q2 2026): Core User Features (Auth, Save Trips, PWA)
- **Phase 3** (Q2 2026): Differentiation (Enhanced Fairness, Price Intelligence)
- **Phase 4** (Q3 2026): Scale & Polish
- **Phase 5** (Q4 2026): Internationalization & Growth

---

## 💡 Philosophy

We believe group travel should be fair and accessible. Our mission is to remove the friction of coordinating group trips and ensure everyone feels the destination choice is equitable.

**Built with ❤️ for travelers everywhere.**

---

⭐ **Star this repo** if you find it useful!
