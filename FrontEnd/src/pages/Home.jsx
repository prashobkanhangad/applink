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
  title: 'Deeplink – Smart Deep Linking Platform for Apps & Web',
  description: 'Deeplink is a smart deep linking platform that helps you create deep links for mobile apps and websites with seamless redirection, analytics, and better user engagement.',
  ogDescription: 'Deeplink is a smart deep linking platform. Create smart deep links for mobile apps and websites with seamless redirection, analytics, and better engagement.',
  twitterDescription: 'One smart link for apps and web. Deep linking, redirection, and analytics made simple.',
  keywords: 'deep linking, deeplink platform, smart links, mobile deep linking, app deep links, deferred deep linking, URL redirection, app attribution, deep link analytics, universal links, android app links',
  imageAlt: 'Deeplink – Smart Deep Linking Platform',
};

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        ogDescription={META.ogDescription}
        twitterDescription={META.twitterDescription}
        imageAlt={META.imageAlt}
        path="/"
      />
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
