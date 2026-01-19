import { useState } from 'react';
import { Badge } from '../shared/Badge';
import BookingLinks from './BookingLinks';

/**
 * FlightCard Component
 * Displays flight options for a single traveler
 */
export default function FlightCard({ traveler, flightData, destination, colorIndex }) {
  const [expandedFlight, setExpandedFlight] = useState(null);
  const { flights, cheapest } = flightData;

  // Traveler color scheme
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-orange-100 text-orange-800 border-orange-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-indigo-100 text-indigo-800 border-indigo-300',
    'bg-red-100 text-red-800 border-red-300',
    'bg-teal-100 text-teal-800 border-teal-300',
  ];

  const colorClass = colors[colorIndex % colors.length];

  // Format flight duration
  const formatDuration = duration => {
    if (!duration) return 'N/A';
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (!match) return duration;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return `${hours}h ${minutes}m`;
  };

  // Format time from ISO datetime
  const formatTime = isoString => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date from ISO datetime
  const formatDate = isoString => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Get airline name (simplified - in production you'd use a lookup table)
  const getAirlineName = carrierCode => {
    // TODO: Replace with proper airline lookup
    const airlines = {
      BA: 'British Airways',
      EZY: 'easyJet',
      FR: 'Ryanair',
      LH: 'Lufthansa',
      AF: 'Air France',
      KL: 'KLM',
      IB: 'Iberia',
      VY: 'Vueling',
    };
    return airlines[carrierCode] || carrierCode;
  };

  // Render individual flight option
  const renderFlight = (flight, index) => {
    const isExpanded = expandedFlight === index;
    const isCheapest = flight === cheapest;
    const outbound = flight.itineraries[0];
    const returnFlight = flight.itineraries[1];

    return (
      <div
        key={index}
        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
          isCheapest ? 'border-green-500 bg-green-50' : 'border-gray-300'
        }`}
      >
        {/* Flight Summary */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isCheapest && (
              <Badge variant="success" className="mb-2">
                ⭐ Best Option
              </Badge>
            )}

            {/* Outbound Flight */}
            <div className="mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{formatTime(outbound.segments[0].departure.at)}</span>
                <span className="text-gray-400">→</span>
                <span>
                  {formatTime(outbound.segments[outbound.segments.length - 1].arrival.at)}
                </span>
                <Badge variant="secondary">
                  {outbound.segments.length === 1
                    ? 'Direct'
                    : `${outbound.segments.length - 1} stop${outbound.segments.length > 2 ? 's' : ''}`}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {formatDate(outbound.segments[0].departure.at)} •{' '}
                {formatDuration(outbound.duration)}
              </div>
            </div>

            {/* Return Flight */}
            {returnFlight && (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{formatTime(returnFlight.segments[0].departure.at)}</span>
                  <span className="text-gray-400">→</span>
                  <span>
                    {formatTime(returnFlight.segments[returnFlight.segments.length - 1].arrival.at)}
                  </span>
                  <Badge variant="secondary">
                    {returnFlight.segments.length === 1
                      ? 'Direct'
                      : `${returnFlight.segments.length - 1} stop${returnFlight.segments.length > 2 ? 's' : ''}`}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatDate(returnFlight.segments[0].departure.at)} •{' '}
                  {formatDuration(returnFlight.duration)}
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-gray-800">
              £{parseFloat(flight.price.total).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mb-2">From {flight.departureAirport.code}</div>
            <button
              onClick={() => setExpandedFlight(isExpanded ? null : index)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? '▲ Less Details' : '▼ More Details'}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Outbound Segments */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Outbound Journey</h4>
              {outbound.segments.map((segment, segIdx) => (
                <div key={segIdx} className="ml-4 mb-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {getAirlineName(segment.carrierCode)} {segment.number}
                      </div>
                      <div className="text-gray-600">
                        {segment.departure.iataCode} → {segment.arrival.iataCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(segment.departure.at)} • {formatTime(segment.departure.at)} -{' '}
                        {formatTime(segment.arrival.at)}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {formatDuration(segment.duration)}
                    </div>
                  </div>
                  {segIdx < outbound.segments.length - 1 && (
                    <div className="text-xs text-gray-400 my-1 ml-2">
                      ⏱️ Layover at {segment.arrival.iataCode}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Return Segments */}
            {returnFlight && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Return Journey</h4>
                {returnFlight.segments.map((segment, segIdx) => (
                  <div key={segIdx} className="ml-4 mb-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {getAirlineName(segment.carrierCode)} {segment.number}
                        </div>
                        <div className="text-gray-600">
                          {segment.departure.iataCode} → {segment.arrival.iataCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(segment.departure.at)} • {formatTime(segment.departure.at)} -{' '}
                          {formatTime(segment.arrival.at)}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDuration(segment.duration)}
                      </div>
                    </div>
                    {segIdx < returnFlight.segments.length - 1 && (
                      <div className="text-xs text-gray-400 my-1 ml-2">
                        ⏱️ Layover at {segment.arrival.iataCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Booking Links */}
            <BookingLinks
              flight={flight}
              origin={flight.departureAirport.code}
              destination={destination}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Traveler Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${colorClass}`}>
            {traveler.name || `From ${traveler.origin}`}
          </div>
          <div className="text-sm text-gray-600">
            {flights.length} option{flights.length !== 1 ? 's' : ''} found
          </div>
        </div>
        <div className="text-sm text-gray-500">
          From {traveler.selectedAirport?.name || traveler.origin}
        </div>
      </div>

      {/* Flight Options */}
      <div className="space-y-3">
        {flights.slice(0, 5).map((flight, index) => renderFlight(flight, index))}
      </div>

      {flights.length > 5 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing top 5 of {flights.length} options
        </div>
      )}
    </div>
  );
}
