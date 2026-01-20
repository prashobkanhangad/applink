import React from 'react';
import { Section, Container } from '../design-system';

export const WhoItsFor = () => {
  const segments = [
    {
      title: 'Developers',
      description: 'Build integrations faster without managing infrastructure or scaling concerns.',
      benefits: [
        'RESTful APIs and webhooks that fit your existing stack',
        'Focus on product features instead of connection logic',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Product Managers',
      description: 'Ship features that connect with your users\' tools without waiting on engineering.',
      benefits: [
        'Launch integrations in days instead of months',
        'Test and iterate on workflows without code changes',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'Growth / Marketing',
      description: 'Connect your tools to automate campaigns and track results across platforms.',
      benefits: [
        'Sync customer data across your entire stack automatically',
        'Trigger actions based on user behavior and events',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <Section padding="default" background="surface">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              Built for your team
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Whether you're shipping features, managing products, or growing your business.
            </p>
          </div>

          {/* Segments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="bg-background rounded-lg p-6 md:p-8 hover:bg-background-surface transition-colors duration-200"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-6">
                  {segment.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {segment.title}
                </h3>

                {/* Description */}
                <p className="text-base text-text-secondary mb-6 leading-relaxed">
                  {segment.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3">
                  {segment.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-accent-600"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-text-secondary leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default WhoItsFor;
