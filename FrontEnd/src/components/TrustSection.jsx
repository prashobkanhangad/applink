import React from 'react';
import { Container } from '../design-system';

export const TrustSection = () => {
  // Text-based logo placeholders (can be replaced with actual logos)
  const logos = [
    'TechCorp',
    'InnovateLab',
    'DataFlow',
    'CloudSync',
    'NextGen',
    'ScaleUp',
  ];

  return (
    <section className="py-8 md:py-10 bg-background border-t border-border-muted">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Trust Text */}
          <p className="text-xs md:text-sm text-text-muted text-center mb-6 md:mb-8 tracking-wide uppercase">
            Trusted by modern product teams
          </p>
          
          {/* Logo Grid */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-12">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="text-text-muted text-sm md:text-base font-medium opacity-40 hover:opacity-60 transition-opacity duration-200 grayscale"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TrustSection;
