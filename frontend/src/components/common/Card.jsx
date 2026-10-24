import React from 'react';

export const Card = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClass = variant === 'butter' ? 'card-butter' : '';
  return (
    <div className={`card ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, icon = null, className = '', ...props }) => {
  return (
    <div className={`card-header-title ${className}`.trim()} {...props}>
      {icon && <span className="card-title-icon">{icon}</span>}
      <h3>{children}</h3>
    </div>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-body ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-footer ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default Card;
