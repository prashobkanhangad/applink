import React from 'react';

/**
 * Container Component
 * 
 * Design tokens for container:
 * - Max width constraint (1100-1200px)
 * - Centered content
 * - Responsive padding
 */
export const Container = ({
  children,
  className = '',
  maxWidth = 'content',
  ...props
}) => {
  const baseStyles = 'mx-auto px-4 sm:px-6 lg:px-8';
  
  const maxWidths = {
    content: 'max-w-content',
    'content-wide': 'max-w-content-wide',
    full: 'max-w-full',
  };
  
  const maxWidthStyles = maxWidths[maxWidth] || maxWidths.content;
  
  return (
    <div
      className={`${baseStyles} ${maxWidthStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
