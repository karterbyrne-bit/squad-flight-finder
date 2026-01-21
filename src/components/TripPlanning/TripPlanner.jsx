import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BudgetSelector } from './BudgetSelector';
import { DateSelector } from './DateSelector';
import { SearchOptions } from './SearchOptions';
import { TravelerList } from './TravelerList';
import { TripTypeSelector } from './TripTypeSelector';
import { Button } from '../shared/Button';

/**
 * TripPlanner - Main container for trip planning step
 * Handles all trip configuration inputs
 */
export const TripPlanner = ({
  // Budget
  maxBudget,
  onBudgetChange,
  // Dates
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  // Filters
  directFlightsOnly,
  onDirectFlightsChange,
  maxStops,
  onMaxStopsChange,
  checkAllAirports,
  onCheckAllAirportsChange,
  // Travelers
  travelers,
  onAddTraveler,
  onUpdateTraveler,
  onRemoveTraveler,
  onDuplicateTraveler,
  onOriginChange,
  searchingAirports,
  // Trip Type
  tripType,
  onTripTypeChange,
  // Navigation
  onProceed,
  canProceed,
  // Debug
  debugMode,
  apiCallStats
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Step Indicator */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
        <p className="text-white text-sm font-semibold text-center">
          Step 1 of 2: Plan Your Trip
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        {/* Budget Section */}
        <BudgetSelector maxBudget={maxBudget} onChange={onBudgetChange} />

        {/* Dates Section */}
        <DateSelector
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
        />

        {/* Flight Filters Section */}
        <SearchOptions
          directFlightsOnly={directFlightsOnly}
          onDirectFlightsChange={onDirectFlightsChange}
          maxStops={maxStops}
          onMaxStopsChange={onMaxStopsChange}
          checkAllAirports={checkAllAirports}
          onCheckAllAirportsChange={onCheckAllAirportsChange}
          debugMode={debugMode}
          apiCallStats={apiCallStats}
        />

        {/* Travelers Section */}
        <TravelerList
          travelers={travelers}
          onAddTraveler={onAddTraveler}
          onUpdateTraveler={onUpdateTraveler}
          onRemoveTraveler={onRemoveTraveler}
          onDuplicateTraveler={onDuplicateTraveler}
          onOriginChange={onOriginChange}
          searchingAirports={searchingAirports}
        />

        {/* Trip Preferences Section */}
        <TripTypeSelector tripType={tripType} onChange={onTripTypeChange} />

        {/* Next Step Button */}
        <Button
          onClick={onProceed}
          disabled={!canProceed}
          fullWidth
          size="lg"
        >
          <span>Find Fair Destinations</span>
          <ArrowRight className="w-5 h-5" />
        </Button>

        {!canProceed && (
          <div className="text-sm text-center space-y-1">
            <p className="text-gray-600">Please complete:</p>
            <ul className="text-gray-500 text-xs space-y-1">
              {!dateFrom && <li>• Select a departure date</li>}
              {travelers.some(t => !t.selectedAirport) && <li>• Set origin city for all travelers</li>}
              {(Array.isArray(tripType) ? tripType.length === 0 : (!tripType || tripType === 'all')) && <li className="text-purple-600 font-semibold">• Choose at least one trip type (reduces search time by 70%)</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
