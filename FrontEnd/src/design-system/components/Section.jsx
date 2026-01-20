import React from 'react';

/**
 * Section Component
 * 
 * Design tokens for section:
 * - Consistent vertical rhythm
 * - Responsive padding (section-sm, section, section-lg)
 * - Background variants
 */
export const Section = ({
  children,
  className = '',
  padding = 'default',
  background = 'default',
  ...props
}) => {
  const baseStyles = 'w-full';
  
  const paddings = {
    none: 'py-0',
    sm: 'py-12',      // 48px - Mobile
    default: 'py-16', // 64px - Default
    lg: 'py-24',      // 96px - Large screens
  };
  
  const backgrounds = {
    default: 'bg-background',
    surface: 'bg-background-surface',
    muted: 'bg-background-muted',
  };
  
  const paddingStyles = paddings[padding] || paddings.default;
  const backgroundStyles = backgrounds[background] || backgrounds.default;
  
  return (
    <section
      className={`${baseStyles} ${paddingStyles} ${backgroundStyles} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
};

export default Section;
