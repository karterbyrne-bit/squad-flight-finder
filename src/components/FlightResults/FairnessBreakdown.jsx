/**
 * FairnessBreakdown Component
 * Displays the fairness score and price breakdown for group travel
 */
export default function FairnessBreakdown({ fairnessDetails }) {
  if (!fairnessDetails) return null;

  const { score, travelers, avgCost } = fairnessDetails;

  // Determine fairness level and color
  const getFairnessLevel = score => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { level: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const fairnessLevel = getFairnessLevel(score);

  // Get color for price difference
  const getDiffColor = diff => {
    if (Math.abs(diff) < 20) return 'text-green-600';
    if (Math.abs(diff) < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="border-t pt-4 mt-4">
      {/* Fairness Score */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Fairness Score</h3>
          <p className="text-sm text-gray-600">
            How equitable are the prices across all travelers?
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-3">
            <div className={`text-5xl font-bold ${fairnessLevel.color}`}>{score}</div>
            <div className="text-left">
              <div className="text-sm text-gray-500">out of 100</div>
              <div className={`text-sm font-semibold ${fairnessLevel.color}`}>
                {fairnessLevel.level}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Explanation */}
      <div className={`rounded-lg p-4 mb-4 ${fairnessLevel.bg}`}>
        <div className="flex items-start gap-2">
          <div className="text-2xl">{score >= 75 ? '✨' : score >= 50 ? '👍' : '⚠️'}</div>
          <div>
            <p className={`text-sm font-medium ${fairnessLevel.color}`}>
              {score >= 90 && 'Excellent fairness! Everyone pays very similar prices.'}
              {score >= 75 &&
                score < 90 &&
                'Good fairness. Prices are reasonably balanced across the group.'}
              {score >= 60 &&
                score < 75 &&
                'Fair prices, but some travelers pay noticeably more than others.'}
              {score >= 40 &&
                score < 60 &&
                'Uneven pricing. Consider alternative dates or destinations for better fairness.'}
              {score < 40 &&
                'Very uneven pricing. Some travelers pay significantly more. Try different dates or airports.'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Price Breakdown</h4>
        <div className="space-y-2">
          {travelers.map((traveler, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="font-medium text-gray-700">{traveler.name}</span>
                <span className="text-gray-500 text-xs">({traveler.airport})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">£{traveler.cost.toFixed(2)}</span>
                {traveler.diffFromAvg !== 0 && (
                  <span className={`text-xs font-medium ${getDiffColor(traveler.diffFromAvg)}`}>
                    {traveler.diffFromAvg > 0 ? '+' : ''}£
                    {Math.abs(traveler.diffFromAvg).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Average */}
          <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-700">Average Cost</span>
            <span className="text-gray-800">£{avgCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tips for Improvement */}
      {score < 75 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-blue-800 mb-2">💡 Tips to Improve Fairness</h4>
          <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
            <li>Try searching for different dates - prices can vary significantly by day</li>
            <li>Consider alternative nearby airports for travelers with higher prices</li>
            <li>Look at flexible date options (±1-2 days) to find better balance</li>
            <li>Group members with higher costs could share the difference for true fairness</li>
          </ul>
        </div>
      )}
    </div>
  );
}
