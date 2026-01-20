import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
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
  console.log('🎯 FlightResults rendered:', {
    flightData,
    travelers: travelers?.length,
    destination,
    dateFrom,
    dateTo,
    fairnessDetails
  });

  // Get all travelers with their flight data (or null if no flights)
  const allTravelers = useMemo(() => {
    return travelers.map(traveler => {
      const data = flightData[traveler.id];
      return {
        ...traveler,
        flightData: data || null,
        hasFlights: !!data,
      };
    });
  }, [travelers, flightData]);

  const travelersWithFlights = allTravelers.filter(t => t.hasFlights);
  const travelersWithoutFlights = allTravelers.filter(t => !t.hasFlights);
  const hasAnyResults = travelersWithFlights.length > 0;

  console.log('📈 Flight results analysis:', {
    total: allTravelers.length,
    withFlights: travelersWithFlights.length,
    withoutFlights: travelersWithoutFlights.length,
    hasAnyResults
  });

  if (!hasAnyResults) {
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

  // Component to show when a traveler has no flights
  const NoFlightsCard = ({ traveler, colorIndex }) => {
    const colors = [
      'bg-blue-50 border-blue-300',
      'bg-purple-50 border-purple-300',
      'bg-green-50 border-green-300',
      'bg-orange-50 border-orange-300',
      'bg-pink-50 border-pink-300',
      'bg-indigo-50 border-indigo-300',
      'bg-red-50 border-red-300',
      'bg-teal-50 border-teal-300',
    ];
    const colorClass = colors[colorIndex % colors.length];

    return (
      <div className={`rounded-2xl border-2 p-6 ${colorClass}`}>
        <div className="flex items-start gap-4">
          <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {traveler.name || `Traveler from ${traveler.origin}`}
            </h3>
            <p className="text-gray-700 mb-3">
              <span className="font-semibold">From:</span> {traveler.origin}
            </p>
            <div className="bg-white/70 rounded-lg p-4 border border-yellow-300">
              <p className="text-gray-800 font-semibold mb-2">No flights found</p>
              <p className="text-sm text-gray-600 mb-3">
                We couldn't find any flights from {traveler.origin} to {destination} for the selected dates.
              </p>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Try:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Selecting different dates</li>
                  <li>Removing flight filters (direct flights only, max stops)</li>
                  <li>Checking nearby airports</li>
                  <li>Choosing a different destination</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        {allTravelers.map((traveler, index) => (
          traveler.hasFlights ? (
            <FlightCard
              key={traveler.id}
              traveler={traveler}
              flightData={traveler.flightData}
              destination={destination}
              colorIndex={index}
            />
          ) : (
            <NoFlightsCard
              key={traveler.id}
              traveler={traveler}
              colorIndex={index}
            />
          )
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {travelersWithFlights.length === travelers.length ? (
              <>
                ✅ Found flights for all {travelers.length} traveler{travelers.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                Found flights for {travelersWithFlights.length} of {travelers.length} travelers
                {travelersWithoutFlights.length > 0 && (
                  <span className="block text-yellow-700 text-sm mt-1">
                    ⚠️ {travelersWithoutFlights.length} traveler{travelersWithoutFlights.length !== 1 ? 's' : ''} without flights
                  </span>
                )}
              </>
            )}
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
