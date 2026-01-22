import React, { useState } from 'react';
import { Check, Info, Search, Globe, X, ArrowLeft } from 'lucide-react';
import { DestinationCard } from './DestinationCard';
import { DestinationFilters } from './DestinationFilters';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export const DestinationList = ({
  destinations,
  loading,
  dateTo,
  selectedDestination,
  onSelectDestination,
  customDestination,
  onCustomDestinationChange,
  sortBy,
  onSortChange,
  tripType,
  onTripTypeChange: _onTripTypeChange,
  onSearchFlights,
  onBack,
  isSearching,
}) => {
  const [showAnywhere, setShowAnywhere] = useState(false);
  const hasSelectedDest = selectedDestination || customDestination;

  return (
    <>
      {/* Step Indicator */}
      <div className="bg-white rounded-2xl shadow-lg p-3 mb-4">
        <p className="text-gray-700 text-sm font-semibold text-center">
          Step 2 of 2: Choose Your Destination
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 w-full sm:w-auto px-6 py-4 text-white bg-white/20 backdrop-blur-sm rounded-xl text-base font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Setup
      </button>

      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Choose Your Destination
            </h2>
            {destinations.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {destinations.length} Destinations
              </span>
            )}
          </div>
          <p className="text-gray-600">Ranked by price - find the best deal for your squad</p>
          {loading && (
            <div className="mt-4 flex flex-col items-center justify-center gap-3 text-sm text-purple-600">
              <LoadingSpinner size="sm" color="purple" />
              <div className="text-center">
                <p className="font-semibold">Finding the best destinations for your squad...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a minute</p>
              </div>
            </div>
          )}
          {!loading &&
            destinations.length > 0 &&
            (() => {
              const types = Array.isArray(tripType)
                ? tripType
                : tripType && tripType !== 'all'
                  ? [tripType]
                  : [];
              if (types.length === 0) return null;
              const typeLabels = types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' + ');
              return (
                <div className="mt-3 inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                  <span>Showing: {typeLabels} destinations</span>
                </div>
              );
            })()}
        </div>

        {/* Sorting Controls */}
        {!loading && destinations.length > 0 && (
          <DestinationFilters sortBy={sortBy} onSortChange={onSortChange} />
        )}

        {/* "Anywhere" Option */}
        {!loading && destinations.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowAnywhere(!showAnywhere)}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                showAnywhere
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-md'
                  : 'border-gray-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:border-purple-300'
              }`}
            >
              <Globe
                className={`w-5 h-5 ${showAnywhere ? 'text-orange-600' : 'text-purple-600'}`}
              />
              <span className={`font-bold ${showAnywhere ? 'text-orange-600' : 'text-purple-600'}`}>
                {showAnywhere ? 'Showing All Destinations' : 'Show All Destinations (Anywhere)'}
              </span>
            </button>
          </div>
        )}

        {/* Destination Cards Grid */}
        {!loading && destinations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {destinations.slice(0, showAnywhere ? destinations.length : 12).map(destination => (
              <DestinationCard
                key={destination.code}
                destination={destination}
                dateTo={dateTo}
                isSelected={selectedDestination === destination.city}
                onClick={() => {
                  onSelectDestination(destination.city);
                  onCustomDestinationChange('');
                }}
              />
            ))}
          </div>
        )}

        {/* No destinations fallback */}
        {!loading && destinations.length === 0 && (
          <div className="text-center py-8 bg-yellow-50 rounded-2xl border-2 border-yellow-200 mb-6">
            <Info className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">No destinations found with pricing data</p>
            <p className="text-sm text-gray-600 mt-2">Try entering a custom destination below</p>
          </div>
        )}

        {/* Custom Destination Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Or enter a custom destination:
          </label>
          <input
            type="text"
            placeholder="e.g., Reykjavik, Athens, Venice..."
            value={customDestination}
            onChange={e => {
              onCustomDestinationChange(e.target.value);
              onSelectDestination('');
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
          />
        </div>

        {/* Search Button */}
        <Button
          onClick={onSearchFlights}
          disabled={!hasSelectedDest || isSearching}
          fullWidth
          size="lg"
        >
          {isSearching ? (
            <>
              <LoadingSpinner />
              Searching all airports for best prices...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search Flights to {selectedDestination || customDestination}
            </>
          )}
        </Button>
      </div>
    </>
  );
};
