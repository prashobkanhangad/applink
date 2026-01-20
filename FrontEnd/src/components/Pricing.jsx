import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Section, Container, Button } from '../design-system';

export const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      monthlyPrice: 29,
      yearlyPrice: 24,
      limits: [
        'Up to 5 integrations',
        '10,000 events per month',
        'Email support',
        'Basic analytics',
      ],
      recommended: false,
    },
    {
      name: 'Professional',
      description: 'For growing teams that need more',
      monthlyPrice: 99,
      yearlyPrice: 79,
      limits: [
        'Unlimited integrations',
        '100,000 events per month',
        'Priority support',
        'Advanced analytics',
        'Custom workflows',
        'Team collaboration',
      ],
      recommended: true,
    },
    {
      name: 'Enterprise',
      description: 'For organizations at scale',
      monthlyPrice: 299,
      yearlyPrice: 249,
      limits: [
        'Unlimited integrations',
        'Unlimited events',
        'Dedicated support',
        'Custom analytics',
        'Advanced security',
        'SLA guarantee',
        'Custom integrations',
      ],
      recommended: false,
    },
  ];

  const getPrice = (plan) => {
    return billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    if (billingPeriod === 'yearly') {
      const savings = plan.monthlyPrice - plan.yearlyPrice;
      return `Save $${savings}/month`;
    }
    return null;
  };

  return (
    <Section padding="default" background="default">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span
                className={`text-sm font-medium ${
                  billingPeriod === 'monthly' ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                role="switch"
                aria-checked={billingPeriod === 'yearly'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  billingPeriod === 'yearly' ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                Yearly
              </span>
              {billingPeriod === 'yearly' && (
                <span className="text-sm text-accent-600 font-medium">Save up to 20%</span>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => {
              const price = getPrice(plan);
              const savings = getSavings(plan);

              return (
                <div
                  key={index}
                  className={`relative rounded-lg border-2 p-8 ${
                    plan.recommended
                      ? 'border-primary-500 bg-background-surface shadow-md'
                      : 'border-border-default bg-background'
                  }`}
                >
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-4xl font-semibold text-text-primary">${price}</span>
                      <span className="text-text-secondary ml-2">
                        /{billingPeriod === 'monthly' ? 'month' : 'month'}
                      </span>
                    </div>

                    {/* Savings */}
                    {savings && (
                      <p className="text-sm text-accent-600 font-medium">{savings}</p>
                    )}

                    {/* Yearly billing note */}
                    {billingPeriod === 'yearly' && (
                      <p className="text-xs text-text-muted mt-1">
                        Billed annually (${price * 12}/year)
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link to="/signup">
                    <Button
                      variant={plan.recommended ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full mb-6"
                    >
                      Start Free Trial
                    </Button>
                  </Link>

                  {/* Limits/Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-text-primary mb-3">Includes:</p>
                    <ul className="space-y-3">
                      {plan.limits.map((limit, limitIndex) => (
                        <li key={limitIndex} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm text-text-secondary leading-relaxed">
                            {limit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-text-secondary mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <p className="text-sm text-text-muted">
              Need something custom?{' '}
              <a href="#contact" className="text-primary-600 hover:text-primary-700">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Pricing;
