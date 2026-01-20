import React from 'react';
import { Section, Container } from '../design-system';

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Sign up',
      description: 'Create your account in less than a minute.',
    },
    {
      number: 2,
      title: 'Configure',
      description: 'Choose the tools you want to connect.',
    },
    {
      number: 3,
      title: 'See results',
      description: 'Watch your workflows run automatically.',
    },
  ];

  return (
    <Section padding="default" background="default">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              How it works
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Get started in three simple steps.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-border-default">
              <div className="absolute top-0 left-1/3 w-1/3 h-full bg-primary-500"></div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  {/* Step Indicator */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary-100 flex items-center justify-center relative z-10">
                      <span className="text-3xl font-semibold text-primary-600">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="text-base text-text-secondary leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorks;
