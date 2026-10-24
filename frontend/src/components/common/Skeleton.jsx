import React from 'react';

export const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '6px', className = '', ...props }) => {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius }}
      {...props}
    />
  );
};

export const SkeletonRow = ({ count = 5 }) => {
  return (
    <div className="skeleton-rows" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
};

export default Skeleton;
