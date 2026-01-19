import React from 'react';

/**
 * Badge - Reusable badge component for labels and tags
 *
 * @param {React.ReactNode} children - Badge content
 * @param {string} variant - Style variant: 'info', 'success', 'warning', 'danger', 'neutral' (default: 'neutral')
 * @param {string} size - Size variant: 'xs', 'sm', 'md' (default: 'sm')
 * @param {string} className - Additional CSS classes
 */
export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variantClasses = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700'
  };

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={`rounded-full font-semibold inline-flex items-center ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

/**
 * TripTypeBadge - Specialized badge for trip type display
 */
export const TripTypeBadge = ({ isRoundTrip }) => (
  <Badge variant="info" size="xs">
    {isRoundTrip ? '↔ Round-trip' : '→ One-way'}
  </Badge>
);

/**
 * FairnessBadge - Specialized badge for fairness indication
 */
export const FairnessBadge = ({ deviation }) => {
  const variant = deviation < 50 ? 'success' : deviation < 100 ? 'warning' : 'danger';
  const label = deviation < 50 ? 'Very Fair' : deviation < 100 ? 'Fair' : 'Uneven';

  return (
    <Badge variant={variant} size="xs">
      {label}
    </Badge>
  );
};
