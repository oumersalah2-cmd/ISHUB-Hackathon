import React from 'react';

const Spinner = ({ size = 'md', variant = 'default', className = '' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  const variantClass = variant === 'light' ? 'spinner-light' : '';

  return (
    <span
      className={`spinner ${sizeClass} ${variantClass} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
