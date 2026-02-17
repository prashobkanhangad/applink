import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';

/**
 * Pricing Page - matches homepage pricing section UI style
 */
export const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'

  // Current Plan Data
  const currentPlan = {
    name: 'Forever Free Plan',
    isFree: true,
    description: 'Forever Free Pack (upto 25K MAU)',
    duration: '30 day(s)',
    renewsOn: 'February 16, 2026',
  };

  const SparklesIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const plans = [
    {
      name: 'Forever Free',
      subtitle: 'Forever Free Pack (upto 25K MAU)',
      description: '2K Monthly Active Users',
      price: { monthly: 0, yearly: 0 },
      period: '',
      features: [
        { text: 'Free upto 25K MAU', included: true },
        { text: '1 Android and iOS app', included: true },
        { text: 'Unlimited Deeplinks via SDK', included: true },
        // { text: 'Hosted on chottu.link subdomain', included: true },
        { text: 'Custom domain', included: true },

        { text: 'Limited support', included: false },
      ],
      cta: 'Current Plan',
      popular: false,
      isFree: true,
    },
    {
      name: 'Indie',
      subtitle: 'Premium subscription with additional features',
      description: 'Under 50K Monthly Active Users',
      price: { monthly: 19, yearly: 190 },
      period: '/mo',
      features: [
        { text: 'Upto 75K MAU Supported', included: true },
        { text: 'Email support', included: true },
        { text: 'Link analytics', included: true },
        { text: 'App Install analytics', included: true },

      ],
      cta: 'Choose Plan',
      popular: false,
    },
    {
      name: 'Growth',
      subtitle: 'Premium subscription with all features unlocked',
      description: 'Under 150K Monthly Active Users',
      price: { monthly: 39, yearly: 390 },
      period: '/mo',
      features: [
        { text: 'Upto 150K MAU Supported', included: true },
        { text: 'All Indie features', included: true },
        { text: 'Custom domain support', included: true },
        { text: 'Invite team members', included: true },
      ],
      cta: 'Choose Plan',
      popular: true,
    },
    {
      name: 'Scale',
      subtitle: 'Premium subscription with all features unlocked',
      description: 'Under 500K Monthly Active Users',
      price: { monthly: 99, yearly: 990 },
      period: '/mo',
      features: [
        { text: 'Upto 500K MAU Supported', included: true },
        { text: 'All Growth features', included: true },
        { text: 'Webhook support (coming soon)', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Choose Plan',
      popular: false,
    },
  ];

  const getPriceDisplay = (plan) => {
    if (plan.isEnterprise || plan.price === null) return 'Custom';
    const amount = plan.price[billingPeriod];
    return amount === 0 ? '$0' : `$${amount}`;
  };

  const getPeriodDisplay = (plan) => {
    if (plan.isEnterprise || plan.isFree) return plan.period || '';
    return plan.period || '/mo';
  };

  return (
    <DashboardLayout title="Pricing" subtitle="Choose the right plan for you">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Section Header - homepage style */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Simple, Transparent <span className="text-gray-900">Pricing</span>
            </h2>
            <p className="text-lg text-gray-600">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          {/* Current Plan Section */}
          <div className="mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                    Current Plan
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
                  {currentPlan.isFree && (
                    <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{currentPlan.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{currentPlan.duration}</div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{currentPlan.renewsOn}</div>
                  <div className="text-xs text-gray-600">Renews On</div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Period Toggle - homepage style (black accent) */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                MONTHLY
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                YEARLY
              </button>
            </div>
          </div>

          {/* Pricing Cards - homepage style: rounded-2xl, popular badge, same layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 lg:p-8 flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-gray-100 to-white border-2 border-gray-900/30 shadow-xl shadow-gray-900/10'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      <SparklesIcon />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-0.5">{plan.name}</h3>
                  {plan.subtitle && (
                    <p className="text-gray-600 text-xs mb-2">{plan.subtitle}</p>
                  )}
                  <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{getPriceDisplay(plan)}</span>
                    {getPeriodDisplay(plan) && (
                      <span className="text-gray-600 text-sm">{getPeriodDisplay(plan)}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className={`flex items-start gap-2.5 ${!feature.included ? 'opacity-60' : ''}`}
                    >
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-gray-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckIcon />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <XIcon />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? 'text-gray-700'
                            : 'text-gray-500 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - hero / hero-outline style with black */}
                <button
                  className={`w-full py-3 rounded-lg text-sm font-medium transition-colors mt-auto ${
                    plan.popular
                      ? 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
                      : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900/10'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Pricing;
