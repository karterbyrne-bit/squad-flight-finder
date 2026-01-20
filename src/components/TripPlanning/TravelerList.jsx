import React from 'react';
import { Users, Plus } from 'lucide-react';
import { TravelerInput } from './TravelerInput';
import { getTravelerColor } from '../../data/constants';

export const TravelerList = ({
  travelers,
  onAddTraveler,
  onUpdateTraveler,
  onRemoveTraveler,
  onDuplicateTraveler,
  onOriginChange,
  searchingAirports
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Your Squad
        </h2>
        {travelers.length < 10 && (
          <button
            onClick={onAddTraveler}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Traveler
          </button>
        )}
      </div>

      {/* Traveler Cards - Simple Stacked */}
      <div className="space-y-2">
        {travelers.map((traveler, index) => (
          <TravelerInput
            key={traveler.id}
            traveler={traveler}
            index={index}
            colors={getTravelerColor(index)}
            onUpdate={onUpdateTraveler}
            onRemove={onRemoveTraveler}
            onDuplicate={onDuplicateTraveler}
            onOriginChange={onOriginChange}
            isSearching={searchingAirports[traveler.id] || false}
            canRemove={travelers.length > 1}
          />
        ))}
      </div>
    </div>
  );
};
