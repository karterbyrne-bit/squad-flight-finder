/**
 * Flight Combinations Utility
 * Calculates optimal group flight combinations based on different strategies
 */

/**
 * Calculate fairness score for a combination of flights
 * @param {Array} selectedFlights - Array of {traveler, flight} objects
 * @returns {Object} - {score, avgCost, travelers, stdDev}
 */
function calculateCombinationFairness(selectedFlights) {
  if (!selectedFlights || selectedFlights.length === 0) {
    return { score: 0, avgCost: 0, travelers: [], stdDev: 0 };
  }

  // Calculate costs for each traveler
  const costs = selectedFlights.map(sf => parseFloat(sf.flight.price.total));
  const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

  // Calculate standard deviation
  const squaredDiffs = costs.map(cost => Math.pow(cost - avgCost, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / costs.length;
  const stdDev = Math.sqrt(variance);

  // Calculate fairness score (0-100)
  // Lower standard deviation = higher score
  const maxStdDev = avgCost * 0.5; // Assume 50% of average as max std dev
  const score = Math.max(0, Math.min(100, 100 - (stdDev / maxStdDev) * 100));

  // Build traveler details
  const travelers = selectedFlights.map(sf => ({
    name: sf.traveler.name || `From ${sf.traveler.origin}`,
    airport: sf.flight.departureAirport.code,
    cost: parseFloat(sf.flight.price.total),
    diffFromAvg: parseFloat(sf.flight.price.total) - avgCost,
  }));

  return {
    score: Math.round(score),
    avgCost,
    travelers,
    stdDev,
  };
}

/**
 * Get the cheapest flight for each traveler
 * @param {Object} flightData - Map of traveler ID to flight data
 * @param {Array} travelers - Array of traveler objects
 * @returns {Array} - Array of {traveler, flight} objects
 */
function getCheapestCombination(flightData, travelers) {
  return travelers
    .map(traveler => {
      const data = flightData[traveler.id];
      if (!data || !data.cheapest) return null;

      return {
        traveler,
        flight: data.cheapest,
      };
    })
    .filter(Boolean);
}

/**
 * Find the most fair combination by trying different flight options
 * @param {Object} flightData - Map of traveler ID to flight data
 * @param {Array} travelers - Array of traveler objects
 * @returns {Array} - Array of {traveler, flight} objects
 */
function getFairestCombination(flightData, travelers) {
  const travelersWithFlights = travelers.filter(t => flightData[t.id]?.flights?.length > 0);

  if (travelersWithFlights.length === 0) return [];
  if (travelersWithFlights.length === 1) {
    return [
      {
        traveler: travelersWithFlights[0],
        flight: flightData[travelersWithFlights[0].id].cheapest,
      },
    ];
  }

  let bestCombination = null;
  let bestScore = -1;

  // For efficiency, we'll test combinations of top 3 flights per traveler
  const maxFlightsPerTraveler = 3;

  // Generate combinations recursively
  function generateCombinations(index, currentCombination) {
    if (index === travelersWithFlights.length) {
      // Evaluate this combination
      const fairness = calculateCombinationFairness(currentCombination);
      if (fairness.score > bestScore) {
        bestScore = fairness.score;
        bestCombination = [...currentCombination];
      }
      return;
    }

    const traveler = travelersWithFlights[index];
    const flights = flightData[traveler.id].flights.slice(0, maxFlightsPerTraveler);

    for (const flight of flights) {
      currentCombination.push({ traveler, flight });
      generateCombinations(index + 1, currentCombination);
      currentCombination.pop();
    }
  }

  generateCombinations(0, []);

  return bestCombination || getCheapestCombination(flightData, travelersWithFlights);
}

/**
 * Find a balanced combination (good fairness + reasonable total cost)
 * @param {Object} flightData - Map of traveler ID to flight data
 * @param {Array} travelers - Array of traveler objects
 * @returns {Array} - Array of {traveler, flight} objects
 */
function getBalancedCombination(flightData, travelers) {
  const travelersWithFlights = travelers.filter(t => flightData[t.id]?.flights?.length > 0);

  if (travelersWithFlights.length === 0) return [];
  if (travelersWithFlights.length === 1) {
    return [
      {
        traveler: travelersWithFlights[0],
        flight: flightData[travelersWithFlights[0].id].cheapest,
      },
    ];
  }

  let bestCombination = null;
  let bestBalanceScore = -1;

  // For efficiency, test top 3 flights per traveler
  const maxFlightsPerTraveler = 3;

  function generateCombinations(index, currentCombination) {
    if (index === travelersWithFlights.length) {
      // Evaluate this combination with a balance score
      const fairness = calculateCombinationFairness(currentCombination);
      const totalCost = currentCombination.reduce(
        (sum, sf) => sum + parseFloat(sf.flight.price.total),
        0
      );

      // Balance score: normalize fairness (0-100) and cost, then combine
      // Weight fairness more heavily (60%) than cost (40%)
      const normalizedFairness = fairness.score; // Already 0-100
      const avgCost = totalCost / currentCombination.length;

      // Lower cost is better, normalize to 0-100 (assuming £500 as high avg)
      const normalizedCost = Math.max(0, 100 - avgCost / 5);

      const balanceScore = normalizedFairness * 0.6 + normalizedCost * 0.4;

      if (balanceScore > bestBalanceScore) {
        bestBalanceScore = balanceScore;
        bestCombination = [...currentCombination];
      }
      return;
    }

    const traveler = travelersWithFlights[index];
    const flights = flightData[traveler.id].flights.slice(0, maxFlightsPerTraveler);

    for (const flight of flights) {
      currentCombination.push({ traveler, flight });
      generateCombinations(index + 1, currentCombination);
      currentCombination.pop();
    }
  }

  generateCombinations(0, []);

  return bestCombination || getCheapestCombination(flightData, travelersWithFlights);
}

/**
 * Calculate all flight combinations and return the top 3
 * @param {Object} flightData - Map of traveler ID to flight data
 * @param {Array} travelers - Array of traveler objects
 * @returns {Array} - Array of combination objects with metadata
 */
export function calculateFlightCombinations(flightData, travelers) {
  // Get combinations
  const cheapestCombo = getCheapestCombination(flightData, travelers);
  const fairestCombo = getFairestCombination(flightData, travelers);
  const balancedCombo = getBalancedCombination(flightData, travelers);

  // Calculate metadata for each combination
  const combinations = [];

  if (cheapestCombo.length > 0) {
    const fairness = calculateCombinationFairness(cheapestCombo);
    const totalCost = cheapestCombo.reduce((sum, sf) => sum + parseFloat(sf.flight.price.total), 0);

    combinations.push({
      id: 'cheapest',
      title: 'Cheapest Total',
      description: 'Everyone books their cheapest flight',
      icon: '💰',
      flights: cheapestCombo,
      totalCost,
      fairness,
      recommended: false,
    });
  }

  if (fairestCombo.length > 0) {
    const fairness = calculateCombinationFairness(fairestCombo);
    const totalCost = fairestCombo.reduce((sum, sf) => sum + parseFloat(sf.flight.price.total), 0);

    // Check if it's the same as cheapest
    const isDifferent =
      JSON.stringify(fairestCombo.map(sf => sf.flight.id)) !==
      JSON.stringify(cheapestCombo.map(sf => sf.flight.id));

    if (isDifferent || combinations.length === 0) {
      combinations.push({
        id: 'fairest',
        title: 'Most Fair',
        description: 'Best price balance across the group',
        icon: '⚖️',
        flights: fairestCombo,
        totalCost,
        fairness,
        recommended: fairness.score >= 75, // Recommend if fairness is good
      });
    }
  }

  if (balancedCombo.length > 0) {
    const fairness = calculateCombinationFairness(balancedCombo);
    const totalCost = balancedCombo.reduce((sum, sf) => sum + parseFloat(sf.flight.price.total), 0);

    // Check if it's different from both cheapest and fairest
    const isDifferentFromCheapest =
      JSON.stringify(balancedCombo.map(sf => sf.flight.id)) !==
      JSON.stringify(cheapestCombo.map(sf => sf.flight.id));
    const isDifferentFromFairest =
      fairestCombo.length === 0 ||
      JSON.stringify(balancedCombo.map(sf => sf.flight.id)) !==
        JSON.stringify(fairestCombo.map(sf => sf.flight.id));

    if ((isDifferentFromCheapest && isDifferentFromFairest) || combinations.length === 0) {
      combinations.push({
        id: 'balanced',
        title: 'Balanced',
        description: 'Good price and fairness',
        icon: '⭐',
        flights: balancedCombo,
        totalCost,
        fairness,
        recommended: fairness.score >= 60 && fairness.score < 75,
      });
    }
  }

  // If no combination is marked as recommended, recommend the first one
  if (!combinations.some(c => c.recommended) && combinations.length > 0) {
    combinations[0].recommended = true;
  }

  // Sort: recommended first, then by fairness score
  combinations.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return b.fairness.score - a.fairness.score;
  });

  return combinations;
}
