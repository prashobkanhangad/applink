import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from '../design-system';

export const Hero = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-background">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="text-center space-y-8 md:space-y-10">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary">
              Build seamless user journeys across platforms
            </h1>
            
            {/* Supporting Sentence */}
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Connect your tools and automate workflows without writing code.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[160px]">
                  Start Free
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto min-w-[160px]">
                View Documentation
              </Button>
            </div>
          </div>
          
          {/* Minimal Abstract Visual Placeholder */}
          <div className="mt-16 md:mt-20 lg:mt-24 flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="relative aspect-video bg-gradient-to-br from-primary-50/50 via-accent-50/30 to-primary-100/50 rounded-lg border border-border-default overflow-hidden">
                {/* Minimal abstract geometric pattern */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="grid grid-cols-4 gap-6 w-full max-w-md opacity-40">
                    <div className="h-12 bg-primary-300 rounded-md"></div>
                    <div className="h-16 bg-accent-300 rounded-md mt-2"></div>
                    <div className="h-14 bg-primary-300 rounded-md"></div>
                    <div className="h-12 bg-accent-300 rounded-md mt-3"></div>
                  </div>
                </div>
                
                {/* Subtle connecting flow lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" preserveAspectRatio="none">
                  <path d="M 80 120 Q 200 100 320 120" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                  <path d="M 80 180 Q 200 200 320 180" stroke="#14b8a6" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
