import React from 'react';
import { Calendar } from 'lucide-react';

export const DateSelector = ({ dateFrom, dateTo, onDateFromChange, onDateToChange }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-600" />
        Travel Dates
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Departure Date</label>
          <input
            type="date"
            value={dateFrom}
            min={today}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Return Date <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || today}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
          />
          <p className="text-xs text-gray-500">
            {dateTo ? '✓ Prices will show total round-trip cost' : 'Leave empty for one-way flights'}
          </p>
        </div>
      </div>
    </div>
  );
};
