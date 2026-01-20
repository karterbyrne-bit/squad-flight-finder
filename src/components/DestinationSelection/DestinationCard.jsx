import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { TripTypeBadge, FairnessBadge } from '../shared/Badge';

export const DestinationCard = ({ destination, dateTo, isSelected, onClick }) => {
  const { city, avgPrice, minPrice, maxPrice, deviation, fairnessScore, types } = destination;

  console.log(`🏙️ DestinationCard for ${city}:`, { fairnessScore, destination });

  // Determine fairness level and color
  const getFairnessLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-500' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-500' };
    if (score >= 60) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (score >= 40) return { level: 'Poor', color: 'text-orange-600', bg: 'bg-orange-500' };
    return { level: 'Very Poor', color: 'text-red-600', bg: 'bg-red-500' };
  };

  const fairnessLevel = fairnessScore !== undefined ? getFairnessLevel(fairnessScore) : null;

  console.log(`   fairnessLevel for ${city}:`, fairnessLevel);

  return (
    <button
      onClick={onClick}
      className={`group relative p-4 rounded-2xl border-2 text-left transition-all transform hover:scale-105 hover:shadow-2xl ${
        isSelected
          ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl'
          : 'border-gray-200 bg-white hover:border-pink-300'
      }`}
    >
      {/* City Icon */}
      <div
        className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
            : 'bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-pink-400 group-hover:to-purple-400'
        }`}
      >
        <MapPin className="w-5 h-5 text-white" />
      </div>

      {/* City Name */}
      <p className="font-bold text-sm mb-2 text-gray-800">{city}</p>

      {/* Trip Type Badge */}
      <div className="mb-2">
        <TripTypeBadge isRoundTrip={!!dateTo} />
      </div>

      {/* Fairness Score - Prominent Display */}
      {fairnessLevel && (
        <div className={`rounded-lg p-2 mb-2 ${isSelected ? 'bg-white/80' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-600 font-semibold uppercase">Fairness</span>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${fairnessLevel.bg}`}></div>
              <span className={`text-[10px] font-semibold ${fairnessLevel.color}`}>
                {fairnessLevel.level}
              </span>
            </div>
          </div>
          <div className={`text-2xl font-bold ${fairnessLevel.color} text-center`}>
            {fairnessScore}
            <span className="text-xs text-gray-500 ml-1">/100</span>
          </div>
        </div>
      )}

      {/* Price Metrics */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Avg:</span>
          <span className="font-bold text-purple-600">£{avgPrice}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Range:</span>
          <span className="font-semibold text-gray-700">£{minPrice}-£{maxPrice}</span>
        </div>
      </div>

      {/* Type and Fairness Badges */}
      <div className="flex flex-wrap gap-1">
        {types && types.slice(0, 2).map((type) => (
          <span
            key={type}
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              isSelected
                ? 'bg-purple-200 text-purple-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {type}
          </span>
        ))}
        <FairnessBadge deviation={deviation} />
      </div>

      {/* Selected Checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
};
