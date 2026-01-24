/**
 * BookingLinks Component
 * Displays links to book flights on various platforms
 * Supports both Amadeus (generic links) and Travelpayouts (affiliate links)
 */
export default function BookingLinks({ flight, origin, destination }) {
  // Get first segment for basic booking info
  const outbound = flight.itineraries[0];
  const returnFlight = flight.itineraries[1];
  const firstSegment = outbound.segments[0];
  const departureDate = new Date(firstSegment.departure.at);
  const returnDate = returnFlight ? new Date(returnFlight.segments[0].departure.at) : null;

  // Check which API provider is being used
  const provider = import.meta.env.VITE_FLIGHT_API_PROVIDER || 'amadeus';
  const marker = import.meta.env.VITE_TRAVELPAYOUTS_MARKER;
  const isTravelpayouts = provider === 'travelpayouts';

  // Format dates for URLs (YYYY-MM-DD)
  const formatDateForUrl = date => {
    return date.toISOString().split('T')[0];
  };

  // Build Travelpayouts affiliate URL if using that provider
  const travelpayoutsUrl =
    isTravelpayouts && marker
      ? `https://www.aviasales.com/search/${origin}${destination.slice(0, 3).toUpperCase()}${formatDateForUrl(departureDate).replace(/-/g, '')}${returnDate ? formatDateForUrl(returnDate).replace(/-/g, '') : ''}1?marker=${marker}`
      : null;

  // Build other booking URLs
  const skyscannerUrl = `https://www.skyscanner.net/transport/flights/${origin}/${destination}/${formatDateForUrl(departureDate)}/${returnDate ? formatDateForUrl(returnDate) : ''}`;

  const googleFlightsUrl = `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${destination}%20on%20${formatDateForUrl(departureDate)}${returnDate ? `%20returning%20${formatDateForUrl(returnDate)}` : ''}`;

  const kayakUrl = `https://www.kayak.com/flights/${origin}-${destination}/${formatDateForUrl(departureDate)}${returnDate ? `/${formatDateForUrl(returnDate)}` : ''}`;

  const handleBookingClick = (platform, url) => {
    // Track booking click for analytics
    if (window.gtag) {
      window.gtag('event', 'booking_click', {
        platform: platform,
        origin: origin,
        destination: destination,
        price: flight.price.total,
        provider: provider,
        is_affiliate: isTravelpayouts,
      });
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Determine primary booking button based on provider
  const primaryPlatform = isTravelpayouts && travelpayoutsUrl ? 'Aviasales' : 'Skyscanner';
  const primaryUrl = isTravelpayouts && travelpayoutsUrl ? travelpayoutsUrl : skyscannerUrl;
  const primaryButtonClass = isTravelpayouts
    ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800'
    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h4 className="font-semibold text-sm text-gray-700 mb-3">Book This Flight</h4>

      {/* Primary Booking Button */}
      <div className="mb-3">
        <button
          onClick={() => handleBookingClick(primaryPlatform, primaryUrl)}
          className={`w-full ${primaryButtonClass} text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
        >
          <span>✈️</span>
          <span>Book on {primaryPlatform}</span>
          <span className="text-xs opacity-80">(Recommended)</span>
        </button>
        <p className="text-xs text-gray-500 text-center mt-1">
          {isTravelpayouts
            ? 'Search and compare prices from 700+ airlines'
            : 'Compare prices and book directly with airlines'}
        </p>
      </div>

      {/* Alternative Booking Options */}
      <div className="text-sm text-gray-600 mb-2">Or compare prices on:</div>
      <div className="grid grid-cols-2 gap-2">
        {!isTravelpayouts && (
          <button
            onClick={() => handleBookingClick('Skyscanner', skyscannerUrl)}
            className="border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            Skyscanner
          </button>
        )}
        <button
          onClick={() => handleBookingClick('Google Flights', googleFlightsUrl)}
          className="border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          Google Flights
        </button>
        <button
          onClick={() => handleBookingClick('Kayak', kayakUrl)}
          className="border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          Kayak
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded p-2">
        <p>
          💡 <strong>Tip:</strong> Prices may vary on booking sites. We recommend comparing across
          multiple platforms. Booking directly with airlines sometimes offers better flexibility for
          changes.
        </p>
      </div>

      {/* Affiliate Notice */}
      {isTravelpayouts && (
        <div className="mt-2 text-xs text-gray-400 text-center bg-green-50 rounded p-2">
          💰 We earn a small commission from bookings made through Aviasales at no extra cost to
          you. This helps keep Squad Flight Finder free!
        </div>
      )}
    </div>
  );
}
