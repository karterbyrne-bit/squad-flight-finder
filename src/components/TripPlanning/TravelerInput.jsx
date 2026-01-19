import React from 'react';
import { X, Copy, MapPin } from 'lucide-react';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const TravelerInput = ({
  traveler,
  index,
  colors,
  onUpdate,
  onRemove,
  onDuplicate,
  onOriginChange,
  isSearching,
  canRemove
}) => {
  return (
    <div
      className={`relative p-4 rounded-2xl border-2 ${colors.border} ${colors.bg} shadow-md hover:shadow-lg transition-all`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.gradient} text-white font-bold text-xs`}>
          {traveler.name || `Person ${index + 1}`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicate(traveler)}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-all font-semibold flex items-center gap-1"
            title="Duplicate this traveler"
          >
            <Copy className="w-3 h-3" />
            Duplicate
          </button>
          {canRemove && (
            <button
              onClick={() => onRemove(traveler.id)}
              className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-all"
              title="Remove this traveler"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name (optional)"
          value={traveler.name}
          onChange={(e) => onUpdate(traveler.id, 'name', e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
        />
        <div>
          <input
            type="text"
            placeholder="City name (e.g., London, Paris, New York)"
            value={traveler.origin}
            onChange={(e) => onOriginChange(traveler.id, e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
          />
          {!traveler.origin && (
            <p className="text-xs text-gray-500 mt-1">
              We'll automatically find nearby airports
            </p>
          )}
        </div>

        {/* Airport Search Status */}
        {isSearching && (
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded-lg">
            <LoadingSpinner size="sm" color="purple" />
            Finding nearby airports...
          </div>
        )}

        {/* Found Airports with Include Options */}
        {traveler.airports && traveler.airports.length > 0 && (
          <div className="bg-white border-2 border-green-300 rounded-xl p-2">
            <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {traveler.airports.length} airport{traveler.airports.length > 1 ? 's' : ''} found - Check to include:
            </p>
            <div className="text-xs text-gray-700 space-y-1.5">
              {traveler.airports.map((a) => {
                const isExcluded = traveler.excludedAirports && traveler.excludedAirports.includes(a.code);
                return (
                  <label key={a.code} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={(e) => {
                        const excluded = traveler.excludedAirports || [];
                        if (e.target.checked) {
                          // Remove from excluded list
                          onUpdate(traveler.id, 'excludedAirports', excluded.filter(code => code !== a.code));
                        } else {
                          // Prevent unchecking the last airport - at least one must remain selected
                          const currentlyIncluded = traveler.airports.filter(airport => !excluded.includes(airport.code));
                          if (currentlyIncluded.length <= 1) {
                            // Don't allow unchecking the last airport
                            return;
                          }
                          // Add to excluded list
                          onUpdate(traveler.id, 'excludedAirports', [...excluded, a.code]);

                          // If we're excluding the currently selected airport, update selectedAirport to the first non-excluded one
                          if (traveler.selectedAirport === a.code) {
                            const remainingAirports = traveler.airports.filter(airport =>
                              airport.code !== a.code && !excluded.includes(airport.code)
                            );
                            if (remainingAirports.length > 0) {
                              onUpdate(traveler.id, 'selectedAirport', remainingAirports[0].code);
                            }
                          }
                        }
                      }}
                      className="w-3.5 h-3.5 text-green-600 rounded border-gray-300"
                    />
                    <span className="flex-1">{a.name} ({a.code})</span>
                    <span className="text-gray-500">{a.distance}mi</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Luggage <span className="text-gray-500 font-normal">(affects price)</span>
          </label>
          <select
            value={traveler.luggage}
            onChange={(e) => onUpdate(traveler.id, 'luggage', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all bg-white"
          >
            <option value="hand">Hand bag only (cheapest)</option>
            <option value="cabin">Cabin bag 10kg</option>
            <option value="checked">Checked baggage</option>
          </select>
        </div>
      </div>
    </div>
  );
};
