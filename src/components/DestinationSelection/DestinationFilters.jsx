import React from 'react';
import { ArrowUpDown, DollarSign, Scale, TrendingDown } from 'lucide-react';

const sortOptions = [
  {
    id: 'avgPrice',
    label: 'Avg Price',
    Icon: DollarSign,
    description: 'Average price across all travelers',
  },
  {
    id: 'fairness',
    label: 'Fairness',
    Icon: Scale,
    description: 'Best fairness score - most balanced costs across group',
  },
  {
    id: 'minPrice',
    label: 'Cheapest',
    Icon: TrendingDown,
    description: 'Lowest individual ticket price',
  },
];

export const DestinationFilters = ({ sortBy, onSortChange }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-purple-600" />
          Sort by:
        </label>
      </div>
      <p className="text-xs text-gray-600 mb-2">
        Choose how to rank destinations: average cost across all travelers, fairness (smallest price
        difference), or cheapest individual ticket
      </p>
      <div className="grid grid-cols-3 gap-2">
        {/* eslint-disable-next-line no-unused-vars */}
        {sortOptions.map(({ id, label, Icon, description }) => (
          <button
            key={id}
            onClick={() => onSortChange(id)}
            title={description}
            className={`p-3 rounded-xl border-2 transition-all ${
              sortBy === id
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <Icon
              className={`w-5 h-5 mx-auto mb-1 ${sortBy === id ? 'text-purple-600' : 'text-gray-400'}`}
            />
            <p
              className={`text-xs font-bold ${sortBy === id ? 'text-purple-600' : 'text-gray-600'}`}
            >
              {label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
