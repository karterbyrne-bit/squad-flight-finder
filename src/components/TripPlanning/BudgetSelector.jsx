import React, { useEffect, useRef } from 'react';
import { DollarSign } from 'lucide-react';

export const BudgetSelector = ({ maxBudget, onChange }) => {
  const sliderRef = useRef(null);

  // Handle native input events (for tests)
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleNativeInput = (e) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value)) {
        onChange(value);
      }
    };

    slider.addEventListener('input', handleNativeInput);
    return () => slider.removeEventListener('input', handleNativeInput);
  }, [onChange]);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-purple-600" />
        Budget per Person
      </h2>
      <p className="text-sm text-gray-600 mb-3">
        This is a guide for destination filtering. Flight prices within your budget will be prioritized.
      </p>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-purple-600">£{maxBudget}</span>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => onChange(parseInt(e.target.value) || 30)}
            min="30"
            max="500"
            className="w-20 px-2 py-1 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 text-center focus:border-purple-400 focus:outline-none"
          />
        </div>
        <input
          ref={sliderRef}
          type="range"
          min="30"
          max="500"
          value={maxBudget}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>£30</span>
          <span>£500</span>
        </div>
      </div>
    </div>
  );
};
