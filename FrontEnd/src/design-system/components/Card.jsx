import React from 'react';

/**
 * Card Component
 * 
 * Design tokens for card:
 * - Elevated surface with subtle shadow
 * - Rounded corners
 * - Padding for content
 */
export const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'default',
  ...props
}) => {
  const baseStyles = 'bg-background-surface rounded-lg border border-border-default';
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const paddingStyles = paddings[padding] || paddings.md;
  const shadowStyles = shadows[shadow] || shadows.default;
  
  return (
    <div
      className={`${baseStyles} ${paddingStyles} ${shadowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
