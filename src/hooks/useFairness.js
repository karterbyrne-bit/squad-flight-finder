import { useMemo } from 'react';

/**
 * Custom hook for fairness calculations
 * Calculates fairness scores and price metrics for travel groups
 */
export const useFairness = (travelers, flightData, showResults, selectedDestination, customDestination) => {
  /**
   * Calculate weighted score (lower is better)
   * Includes distance penalty to account for travel to airport
   */
  const calculateWeightedScore = (price, distanceMiles) => {
    const distancePenalty = distanceMiles * 0.5; // 50p per mile
    return price + distancePenalty;
  };

  /**
   * Calculate fairness score (0-100)
   * Higher score = more fair (prices are closer together)
   */
  const calculateFairnessScore = useMemo(() => {
    const costs = travelers.map(t => {
      const data = flightData[t.id];
      if (data && data.cheapest) {
        return parseFloat(data.cheapest.price.total);
      }
      return 0;
    }).filter(c => c > 0);

    if (costs.length === 0) return 0;

    const avg = costs.reduce((s, c) => s + c, 0) / costs.length;
    const maxDiff = Math.max(...costs.map(c => Math.abs(c - avg)));
    return Math.round(Math.max(0, 100 - (maxDiff / avg * 100)));
  }, [travelers, flightData]);

  /**
   * Get detailed fairness breakdown
   */
  const getFairnessDetails = useMemo(() => {
    const dest = selectedDestination || customDestination;
    if (!showResults || !dest) return null;

    const costs = travelers.map(t => {
      const data = flightData[t.id];
      if (!data || !data.cheapest) return null;

      const price = parseFloat(data.cheapest.price.total);
      const airport = data.cheapest.departureAirport;

      return {
        name: t.name || `From ${t.origin}`,
        cost: price,
        airport: `${airport.name} (${airport.code})`,
        distance: airport.distance
      };
    }).filter(c => c !== null);

    if (costs.length === 0) return null;

    const avg = costs.reduce((s, c) => s + c.cost, 0) / costs.length;

    return {
      score: calculateFairnessScore,
      travelers: costs.map(c => ({ ...c, diffFromAvg: c.cost - avg })),
      avgCost: Math.round(avg)
    };
  }, [travelers, flightData, showResults, selectedDestination, customDestination, calculateFairnessScore]);

  return {
    calculateWeightedScore,
    calculateFairnessScore,
    getFairnessDetails
  };
};
