import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from '../design-system';

export const CTASection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-primary-500">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          {/* Strong Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight">
            Ready to connect your tools?
          </h2>
          
          {/* Reassurance Sentence */}
          <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Start free today. No credit card required.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA */}
            <Link to="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 active:bg-gray-200 focus:ring-white min-w-[180px]"
              >
                Start Free Trial
              </Button>
            </Link>
            
            {/* Secondary CTA */}
            <Button
              variant="ghost"
              size="lg"
              className="text-white border-2 border-white hover:bg-white/10 active:bg-white/20 focus:ring-white min-w-[180px]"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
