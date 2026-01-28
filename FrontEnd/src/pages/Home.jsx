import React from 'react';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
} from '../components/landing';
import { PageMeta } from '../components/PageMeta';

const META = {
  title: 'Deep Links That Actually Work',
  description: 'Build seamless user journeys with intelligent deep linking and real-time attribution. Send users exactly where they need to go, every single time.',
};

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta title={META.title} description={META.description} path="/" />
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
