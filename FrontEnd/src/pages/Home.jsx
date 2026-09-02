import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CTASection,
} from '../components/landing';
import { PageMeta } from '../components/PageMeta';
import {
  SITE_ORIGIN,
  DOCS_URL,
  SOCIAL_SAME_AS,
  SUPPORT_EMAIL,
  defaultOgImageUrl,
} from '../constants/publicSite';

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_ORIGIN}/#organization`,
  name: 'Deeplink',
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/logo_dark.png`,
  description:
    'Deeplink is a smart deep linking platform for mobile apps and websites—smart links, routing across Android, iOS, and web, deferred deep linking, analytics, APIs, and SDKs.',
  email: SUPPORT_EMAIL,
  sameAs: SOCIAL_SAME_AS,
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_ORIGIN}/#website`,
  name: 'Deeplink',
  url: `${SITE_ORIGIN}/`,
  description:
    'Smart deep linking platform for apps and web with deferred deep linking, analytics, APIs, and SDKs.',
  publisher: { '@id': `${SITE_ORIGIN}/#organization` },
};

const SOFTWARE_APPLICATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Deeplink',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Android, iOS, Web',
  url: `${SITE_ORIGIN}/`,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description:
      'Free and paid plans with monthly click limits as shown on the live pricing section of deeplink.in.',
  },
  feature: [
    'Universal smart deep links for iOS, Android, and web',
    'Deferred deep linking through install to first open',
    'Real-time attribution for clicks, installs, and conversions',
    'REST APIs, webhooks, and SDKs',
    'Dashboard link management with UTM campaign parameters',
  ],
  screenshot: defaultOgImageUrl(),
  softwareHelp: DOCS_URL,
  publisher: { '@id': `${SITE_ORIGIN}/#organization` },
};

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
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(ORGANIZATION_JSON_LD)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(WEBSITE_JSON_LD)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(SOFTWARE_APPLICATION_JSON_LD)}
        </script>
      </Helmet>
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
