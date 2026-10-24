import React from 'react';

const Badge = ({
  children,
  variant = 'open', // 'open' | 'investigating' | 'clarification' | 'approved' | 'closed' | 'butter' | 'clay' | 'urgent' | 'high' | 'medium' | 'low'
  dot = true,
  className = '',
  ...props
}) => {
  // Normalize variant string
  const normVariant = (variant || 'open').toLowerCase().replace(/\s+/g, '-');
  const variantClass = `badge-${normVariant}`;

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
      {dot && <span className="badge-dot" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
