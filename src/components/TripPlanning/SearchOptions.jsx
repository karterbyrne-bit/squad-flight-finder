import React from 'react';
import { Search } from 'lucide-react';

export const SearchOptions = ({
  directFlightsOnly,
  onDirectFlightsChange,
  maxStops,
  onMaxStopsChange,
  checkAllAirports,
  onCheckAllAirportsChange,
  debugMode,
  apiCallStats
}) => {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-purple-600" />
        Flight Filters
      </h2>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
        {/* Direct Flights */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={directFlightsOnly}
            onChange={(e) => {
              onDirectFlightsChange(e.target.checked);
              if (e.target.checked) onMaxStopsChange(null);
            }}
            className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
              Direct flights only
            </span>
            <p className="text-xs text-gray-500">No layovers or connections</p>
          </div>
        </label>

        {/* Max Stops */}
        {!directFlightsOnly && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Maximum Stops</label>
            <select
              value={maxStops === null ? 'any' : maxStops}
              onChange={(e) => onMaxStopsChange(e.target.value === 'any' ? null : parseInt(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all bg-white"
            >
              <option value="any">Any number of stops</option>
              <option value="0">Direct only</option>
              <option value="1">Max 1 stop</option>
              <option value="2">Max 2 stops</option>
            </select>
          </div>
        )}

        {/* Check All Airports */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checkAllAirports}
            onChange={(e) => onCheckAllAirportsChange(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
              Check all nearby airports
            </span>
            <p className="text-xs text-gray-500">
              {checkAllAirports
                ? 'Checking all airports (more API calls, better prices)'
                : 'Smart limiting: checks 2-3 closest airports (fewer API calls)'}
            </p>
          </div>
        </label>

        {/* API Call Counter - Debug Mode Only */}
        {debugMode && (
          <div className="mt-4 pt-3 border-t border-blue-200/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">API Calls:</span>
              <div className="flex gap-3">
                <span className="text-blue-600 font-bold">{apiCallStats.total} total</span>
                {apiCallStats.cacheHits > 0 && (
                  <span className="text-green-600 font-bold">✓ {apiCallStats.cacheHits} cached</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
