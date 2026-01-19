# Squad Flight Finder - User Guide

## Welcome! 👋

Squad Flight Finder helps groups of friends or family find fair flight destinations when everyone is traveling from different cities. Our unique fairness algorithm ensures nobody pays significantly more than others.

## Quick Start

### The Problem We Solve

Planning group travel is hard when everyone lives in different cities:
- Different flight prices from different origins
- Someone always pays way more than others
- Hard to find destinations that work for everyone

### Our Solution

We search from all your cities simultaneously and show you destinations where costs are most equitable across the group, using our proprietary fairness score (0-100).

## Step-by-Step Guide

### Step 1: Set Your Budget

1. Use the slider to set your per-person budget (£30-£500)
2. This helps filter destinations to show only affordable options

**Tip**: Start with a realistic budget. You can adjust later if needed.

### Step 2: Choose Your Dates

1. **Departure Date**: When you want to leave
2. **Return Date** (optional): When you want to come back
   - Leave empty for one-way trips
   - Add for round-trip pricing

**Tip**: Flexible with dates? Try different dates to compare prices.

### Step 3: Add Travelers

For each person in your group:

1. Click **"Add Traveler"**
2. Enter their name (optional, helps you track who's who)
3. Type their origin city
4. Select from nearby airports that appear
5. Optionally exclude airports they can't/won't use

**Features**:
- **Duplicate Traveler**: Copy details to add someone from the same city
- **Remove Traveler**: Click the X to remove
- **Color Coding**: Each traveler gets a unique color for easy tracking

**Example**:
```
Traveler 1: Alice from London
  ✓ Heathrow (15 mi)
  ✓ Gatwick (28 mi)
  ✗ Stansted (excluded)

Traveler 2: Bob from Manchester
  ✓ Manchester Airport (10 mi)
```

### Step 4: Configure Search Options

**Direct Flights Only**:
- ✓ Check for non-stop flights only
- ✗ Uncheck to include connecting flights

**Max Stops**:
- Choose maximum number of connections (0, 1, or 2)
- Lower number = faster journey, potentially higher price

**Trip Type** (Optional):
- City Break (Paris, Amsterdam, Prague)
- Beach Holiday (Barcelona, Alicante, Mallorca)
- Ski Trip (Geneva, Innsbruck, Salzburg)
- Cheap Destinations (Budget-friendly cities)
- Luxury (Premium destinations)
- All Destinations (No filter)

### Step 5: Find Destinations

Click **"Find Destinations"** to start the search.

**What Happens**:
1. We search 30+ destinations from each traveler's airports
2. Calculate fairness scores for each destination
3. Find the best flight options
4. Display results ranked by fairness or price

**Loading Time**: Usually 10-30 seconds depending on group size

### Step 6: Review Destinations

You'll see a list of destinations with:

**Destination Cards Show**:
- **City Name** with destination badges (beach, city, ski, etc.)
- **Average Price**: Mean cost across all travelers
- **Price Range**: Cheapest to most expensive traveler
- **Fairness Score**: 0-100 (higher = more equitable)
  - 90-100: Excellent - Costs very similar
  - 70-89: Good - Reasonable variation
  - 50-69: Fair - Some pay notably more
  - Below 50: Poor - Large cost differences

**Filter Results**:
- **Budget Filter**: Hide destinations over a certain price
- **Trip Type**: Show only specific types of destinations
- **Sort By**:
  - Average Price (cheapest first)
  - Fairness Score (most equitable first)
  - Price Range (most similar costs first)

### Step 7: Select a Destination

Click **"Search Flights"** on any destination card to see detailed flight options.

**Flight Results Show**:

For each traveler, you'll see:
- **Best Flight Options** (up to 5)
- **Airlines** and flight times
- **Number of stops** and layover cities
- **Individual prices**
- **Airports** used (origin and destination)

**Fairness Breakdown**:
- **Average Price**: Mean across all travelers
- **Price Range**: Min to max costs
- **Fairness Score**: Detailed calculation
- **Individual Contributions**: Who pays more/less

### Step 8: Book Flights

Click **"Share Booking Links"** to get personalized booking links for each traveler.

**What You Get**:
- Individual Skyscanner links for each person
- Pre-filled with their specific flight details
- Links are shareable (copy & paste to send)

**Booking Process**:
1. Click your personalized link
2. You'll be taken to Skyscanner/Kiwi
3. Review the flight details
4. Complete booking directly with airline or agent

**Note**: Prices may vary slightly on booking sites due to:
- Real-time availability changes
- Currency conversion
- Booking fees
- Seat selection costs

## Understanding Fairness Scores

### How It Works

Our algorithm considers:

1. **Price Variation**: How much do individual costs differ?
2. **Price Range**: What's the spread between cheapest and most expensive?
3. **Airport Distance**: Are some using far-away airports?
4. **Absolute Costs**: Are prices within budget?

### Score Interpretation

**90-100 (Excellent)**:
- Everyone pays nearly the same
- Differences under 10%
- Highly recommended for group harmony

**70-89 (Good)**:
- Reasonable variation
- Most people pay similar amounts
- One person might pay 20-30% more

**50-69 (Fair)**:
- Notable differences
- Consider if some can subsidize others
- Good for flexible groups

**Below 50 (Poor)**:
- Large cost disparities
- Someone pays 50%+ more than others
- Consider another destination or cost-sharing

### Example

```
Barcelona Trip - Fairness Score: 87 (Good)

Alice (London → Barcelona): £85
Bob (Manchester → Barcelona): £92
Carol (Edinburgh → Barcelona): £105

Average: £94
Range: £20 (24% spread)
Why Good: All within £20 of each other
```

## Advanced Features

### Share Your Search

Click **"Share Trip"** to get a shareable URL.

**Use Cases**:
- Send to group members to review
- Save your search for later
- Compare different date options

**What's Saved**:
- All travelers and their airports
- Dates and budget
- Trip type and filters

**What's NOT Saved**:
- Flight results (these update in real-time)
- Personal information

### Debug Panel (Advanced Users)

Press **Ctrl+Shift+D** (or **Cmd+Shift+D** on Mac) to toggle.

**Shows**:
- API call statistics
- Cache hit rate
- Performance metrics
- Error logs

**Use For**:
- Troubleshooting slow searches
- Understanding caching behavior
- Developer insights

### Survey & Feedback

We occasionally ask for feedback to improve the tool.

**We Ask About**:
- Ease of use
- Fairness score helpfulness
- Feature requests
- General experience

**Your Privacy**: Responses are anonymous and used only for product improvement.

## Tips & Tricks

### Getting Better Results

**1. Be Flexible with Airports**
- Include multiple airports per traveler
- Larger airports usually have better prices
- Budget airlines often use secondary airports

**2. Consider Connections**
- Direct flights are convenient but pricier
- One connection can save 30-50%
- Check layover times (avoid very short connections)

**3. Try Different Dates**
- Midweek flights are often cheaper
- Avoid peak seasons and holidays
- Tuesday/Wednesday are usually cheapest

**4. Use Budget Filters**
- Set realistic budgets
- Filter out expensive destinations early
- Adjust if no results appear

**5. Compare Trip Types**
- "All Destinations" gives maximum choice
- Filters help narrow overwhelming results
- Try removing filters if results are limited

### Common Questions

**Q: Why are there no results?**

A: Possible reasons:
- Budget too low (try increasing)
- Dates too close (book further ahead)
- Too restrictive filters (allow connections)
- API quota reached (wait 5 minutes)

**Q: Why do prices differ from booking sites?**

A: Flight prices change constantly:
- Real-time availability
- Dynamic pricing algorithms
- Currency fluctuations
- Booking site fees

**Q: Can I save my searches?**

A: Currently:
- ✓ Use "Share Trip" URL to save search
- ✗ No user accounts (coming soon)
- ✗ No trip history (coming soon)

**Q: How many travelers can I add?**

A: Up to 10 travelers per search.

**Q: Which airports are included?**

A: We include 30+ UK airports and search 150+ European destinations. More regions coming soon!

**Q: Is my data private?**

A: Yes:
- Searches are not stored server-side
- No personal information collected
- Anonymous analytics only
- No email required (unless you opt in)

## Troubleshooting

### Search Not Working

**Issue**: Click "Find Destinations" but nothing happens

**Solutions**:
1. Check you have at least 1 traveler added
2. Ensure departure date is selected
3. Verify traveler has at least one airport selected
4. Try refreshing the page
5. Check browser console for errors (F12)

### No Destinations Found

**Issue**: Search completes but shows "No destinations found"

**Solutions**:
1. Increase budget
2. Allow connecting flights
3. Try different dates
4. Remove trip type filter
5. Check if airports are correct

### Slow Loading

**Issue**: Search takes longer than 30 seconds

**Reasons**:
- Large group size (more API calls needed)
- Many airports per traveler
- First search (cache not populated)
- API rate limiting

**Solutions**:
- Wait patiently (may take up to 60s for large groups)
- Reduce number of airports
- Try again (cached results are faster)

### Booking Links Not Working

**Issue**: Links don't show correct flights on Skyscanner

**Reasons**:
- Flight sold out since search
- Price changed
- Skyscanner API differences

**Solutions**:
- Manually search on booking site
- Try alternative flights shown
- Search on different date

### Page Crashes

**Issue**: White screen or error message

**Solutions**:
1. Click "Try Again" if error boundary appears
2. Refresh the page (Ctrl+R or Cmd+R)
3. Clear browser cache
4. Try different browser
5. Report issue on GitHub

## Best Practices

### For Trip Organizers

1. **Set Expectations**: Explain fairness scores to group
2. **Discuss Budget**: Agree on max budget before searching
3. **Consider Preferences**: Ask about airport/airline preferences
4. **Share Results**: Use "Share Trip" to let everyone review
5. **Book Together**: Coordinate booking to get similar fares

### For Fair Group Travel

1. **Use Fairness Scores**: Aim for 80+ when possible
2. **Consider Cost-Sharing**: If scores are low, discuss subsidies
3. **Value vs Price**: Sometimes lower fairness is OK for better destination
4. **Flexibility Helps**: Be open to different destinations
5. **Book Quickly**: Prices change, so decide and book fast

## Privacy & Data

### What We Collect

**Anonymous Analytics**:
- Search patterns (not specific searches)
- Popular origins/destinations
- Error rates
- Usage statistics

**NOT Collected**:
- Personal information
- Email addresses (unless you opt in)
- Payment information
- Specific travel plans

### Cookies

We use:
- **Essential cookies**: For app functionality
- **Analytics cookies**: Google Analytics (can be blocked)

No advertising or tracking cookies.

## Support

### Need Help?

1. **Check this guide**: Most questions answered here
2. **Try troubleshooting section**: Common issues covered
3. **GitHub Issues**: Report bugs or request features
4. **Email**: (Coming soon)

### Report a Bug

Visit our [GitHub Issues](https://github.com/karterbyrne-bit/squad-flight-finder/issues) page:

1. Check if issue already reported
2. Create new issue with:
   - What you were doing
   - What went wrong
   - Browser and OS
   - Screenshots if applicable

### Request a Feature

We love feedback! Request features on GitHub:

1. Describe the feature
2. Explain the use case
3. Suggest how it might work

## Roadmap

### Coming Soon

- ✈️ User accounts and trip history
- 🌍 More destinations (US, Asia, etc.)
- 📱 Mobile app (PWA)
- 📊 Price tracking and alerts
- 🤝 Multi-user trip collaboration
- 💰 Group budget pooling
- 🌱 Carbon footprint calculator

### Stay Updated

- Follow on GitHub for updates
- Star the repo to show support
- Subscribe to newsletter (coming soon)

---

**Version**: 0.0.0
**Last Updated**: 2026-01-18
**Questions?** Open an issue on GitHub!

Happy travels! ✈️🌍
