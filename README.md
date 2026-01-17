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
- Amadeus API credentials (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/karterbyrne-bit/squad-flight-finder.git
cd squad-flight-finder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Amadeus API credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Getting Amadeus API Keys

1. Go to [Amadeus for Developers](https://developers.amadeus.com/)
2. Sign up for a free account
3. Create a new app in the dashboard
4. Copy your API Key and API Secret to `.env`

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

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19.2, Tailwind CSS, Vite
- **API**: Amadeus Flight Search API
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: [Vercel/Netlify - TBD]

### Project Structure
```
squad-flight-finder/
├── src/
│   ├── App.jsx           # Main application component
│   ├── App.css           # Styles
│   └── main.jsx          # Entry point
├── tests/
│   ├── 01-core-flight-search.test.jsx
│   ├── 02-filtering-sorting.test.jsx
│   ├── 03-traveler-management.test.jsx
│   ├── 04-error-handling.test.jsx
│   └── utils/            # Test helpers and mocks
├── .env                  # Environment variables (create from .env.example)
├── package.json
└── vite.config.js
```

**Note:** This is the current structure. We're planning a major refactoring to extract components and services. See [Architecture Roadmap](./PROJECT_ROADMAP.md#phase-2-architecture-refactoring).

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

Create a `.env` file with:

```env
VITE_AMADEUS_API_KEY=your_api_key_here
VITE_AMADEUS_API_SECRET=your_api_secret_here
```

**⚠️ Security Note:** Never commit `.env` to version control. The repository includes `.env.example` as a template.

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

- [Amadeus API](https://developers.amadeus.com/) - Flight search data
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
