import React from 'react';

/**
 * LoadingSpinner - Reusable loading indicator component
 *
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} color - Color variant: 'white', 'purple', 'pink' (default: 'white')
 * @param {string} className - Additional CSS classes
 */
export const LoadingSpinner = ({ size = 'md', color = 'white', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    purple: 'border-purple-600 border-t-transparent',
    pink: 'border-pink-600 border-t-transparent'
  };

  return (
    <div
      className={`animate-spin border-2 rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};
