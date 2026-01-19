import { useMemo } from 'react';
import FlightCard from './FlightCard';
import FairnessBreakdown from './FairnessBreakdown';
import { Button } from '../shared/Button';

/**
 * FlightResults Component
 * Displays search results for all travelers with flight options and fairness breakdown
 */
export default function FlightResults({
  flightData,
  travelers,
  destination,
  dateFrom,
  dateTo,
  fairnessDetails,
  onBack,
}) {
  // Get travelers with flight data
  const travelersWithFlights = useMemo(() => {
    return travelers
      .map(traveler => {
        const data = flightData[traveler.id];
        if (!data) return null;

        return {
          ...traveler,
          flightData: data,
        };
      })
      .filter(t => t !== null);
  }, [travelers, flightData]);

  const hasResults = travelersWithFlights.length > 0;

  if (!hasResults) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Flights Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any flights matching your search criteria. Try adjusting your dates or
            destination.
          </p>
          <Button onClick={onBack} variant="primary">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Flight Results</h2>
            <p className="text-gray-600 mt-1">
              Showing results for {destination}
              {dateTo
                ? ` (${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()})`
                : ` (${new Date(dateFrom).toLocaleDateString()})`}
            </p>
          </div>
          <Button onClick={onBack} variant="secondary">
            ← Back to Search
          </Button>
        </div>

        {/* Fairness Breakdown */}
        {fairnessDetails && <FairnessBreakdown fairnessDetails={fairnessDetails} />}
      </div>

      {/* Flight Cards for Each Traveler */}
      <div className="space-y-4">
        {travelersWithFlights.map((traveler, index) => (
          <FlightCard
            key={traveler.id}
            traveler={traveler}
            flightData={traveler.flightData}
            destination={destination}
            colorIndex={index}
          />
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Found flights for {travelersWithFlights.length} of {travelers.length} traveler
            {travelers.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={onBack} variant="secondary">
              ← Modify Search
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement share functionality
                alert('Share functionality coming soon!');
              }}
              variant="primary"
            >
              📤 Share Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
