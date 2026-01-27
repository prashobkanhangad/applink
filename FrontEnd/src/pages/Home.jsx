import React from 'react';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
} from '../components/landing';

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Home;
