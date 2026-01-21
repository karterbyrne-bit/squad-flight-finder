import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '../shared/Button';
import FlightCard from './FlightCard';

/**
 * GroupCombinationCard Component
 * Displays a flight combination for the entire group
 */
export default function GroupCombinationCard({ combination, destination, isRecommended }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { title, description, icon, flights, totalCost, fairness } = combination;

  // Determine fairness level and color
  const getFairnessLevel = score => {
    if (score >= 90)
      return {
        level: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-100',
        border: 'border-green-500',
      };
    if (score >= 75)
      return {
        level: 'Good',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        border: 'border-blue-500',
      };
    if (score >= 60)
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        border: 'border-yellow-500',
      };
    if (score >= 40)
      return {
        level: 'Poor',
        color: 'text-orange-600',
        bg: 'bg-orange-100',
        border: 'border-orange-500',
      };
    return {
      level: 'Very Poor',
      color: 'text-red-600',
      bg: 'bg-red-100',
      border: 'border-red-500',
    };
  };

  const fairnessLevel = getFairnessLevel(fairness.score);

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl border-2 transition-all ${
        isRecommended ? 'border-pink-500 ring-4 ring-pink-100' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />✨ Recommended
            </div>
          </div>
        )}

        {/* Title and Description */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">{icon}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Total Cost */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="text-sm text-gray-600 mb-1">Total Cost</div>
            <div className="text-3xl font-bold text-purple-700">£{totalCost.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">
              £{fairness.avgCost.toFixed(2)} per person avg
            </div>
          </div>

          {/* Fairness Score */}
          <div className={`rounded-xl p-4 border-2 ${fairnessLevel.bg} ${fairnessLevel.border}`}>
            <div className="text-sm text-gray-600 mb-1">Fairness Score</div>
            <div className="flex items-end gap-2">
              <div className={`text-3xl font-bold ${fairnessLevel.color}`}>{fairness.score}</div>
              <div className="text-sm text-gray-500 mb-1">/100</div>
            </div>
            <div className={`text-xs font-semibold mt-1 ${fairnessLevel.color}`}>
              {fairnessLevel.level}
            </div>
          </div>
        </div>

        {/* Traveler Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Flight Summary</h4>
          <div className="space-y-2">
            {fairness.travelers.map((traveler, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-gray-800">{traveler.name}</span>
                  <span className="text-gray-400 text-xs">({traveler.airport})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">£{traveler.cost.toFixed(2)}</span>
                  {Math.abs(traveler.diffFromAvg) > 1 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        Math.abs(traveler.diffFromAvg) < 20
                          ? 'bg-green-100 text-green-700'
                          : Math.abs(traveler.diffFromAvg) < 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {traveler.diffFromAvg > 0 ? '+' : ''}£{traveler.diffFromAvg.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="border-t border-gray-200 px-6 py-4">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Flight Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View Flight Details & Book
            </>
          )}
        </Button>
      </div>

      {/* Expanded Flight Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 pt-4 bg-gray-50">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Individual Flight Details</h4>
          <div className="space-y-4">
            {flights.map((sf, index) => (
              <FlightCard
                key={sf.traveler.id}
                traveler={sf.traveler}
                flightData={{ flights: [sf.flight], cheapest: sf.flight }}
                destination={destination}
                colorIndex={index}
                compact={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
