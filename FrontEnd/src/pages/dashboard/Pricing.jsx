import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';

/**
 * Pricing Page
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

  // Icon Components
  const IndieIcon = () => (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );

  const GrowthIcon = () => (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const ScaleIcon = () => (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const EnterpriseIcon = () => (
    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const plans = [
    {
      name: 'Indie',
      Icon: IndieIcon,
      description: 'Premium subscription with additional features',
      price: { monthly: 19, yearly: 190 },
      userLimit: 'under 75K Monthly Active Users',
      features: [
        { text: 'Upto 75K MAU Supported', included: true },
        { text: 'Email support', included: true },
        { text: 'Link analytics', included: true },
        { text: 'App Install analytics', included: true },
        { text: 'No custom domain', included: false },
      ],
    },
    {
      name: 'Growth',
      Icon: GrowthIcon,
      description: 'Premium subscription with all features unlocked',
      price: { monthly: 39, yearly: 390 },
      userLimit: 'under 150K Monthly Active Users',
      features: [
        { text: 'Upto 150K MAU Supported', included: true },
        { text: 'All Indie features', included: true },
        { text: 'Custom domain support', included: true },
        { text: 'Invite team members', included: true },
      ],
    },
    {
      name: 'Scale',
      Icon: ScaleIcon,
      description: 'Premium subscription with all features unlocked',
      price: { monthly: 99, yearly: 990 },
      userLimit: 'under 500K Monthly Active Users',
      features: [
        { text: 'Upto 500K MAU Supported', included: true },
        { text: 'All Growth features', included: true },
        { text: 'Webhook support (coming soon)', included: true },
        { text: 'Priority support', included: true },
      ],
    },
    {
      name: 'Enterprise',
      Icon: EnterpriseIcon,
      description: 'Contact sales for pricing',
      price: null, // Custom pricing
      userLimit: 'over 500K Monthly Active Users',
      features: [
        { text: 'Over 500K MAU Supported', included: true },
        { text: 'All Scale Plan Features', included: true },
        { text: 'Custom Support Plan', included: true },
        { text: 'Manage multiple apps', included: true },
        { text: 'Manage multiple environments', included: true },
      ],
      isEnterprise: true,
    },
  ];

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <DashboardLayout title="Pricing" subtitle="Choose the right plan for you">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Current Plan Section */}
          <div className="mb-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                  Current Plan
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
                {currentPlan.isFree && (
                  <span className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-6">{currentPlan.description}</p>
              <div className="grid grid-cols-2 gap-4">
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

          {/* Billing Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                MONTHLY
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                YEARLY
              </button>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col"
              >
                {/* Plan Icon */}
                <div className="mb-4">
                  <plan.Icon />
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>

                {/* Plan Description */}
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-4">
                  {plan.isEnterprise ? (
                    <div className="text-2xl font-bold text-gray-900">Custom Pricing</div>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        $ {plan.price[billingPeriod]}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Limit */}
                <p className="text-xs text-gray-500 mb-6">{plan.userLimit}</p>

                {/* Features List */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? <CheckIcon /> : <XIcon />}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    plan.isEnterprise
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {plan.isEnterprise ? 'Contact Sales' : 'Choose Plan'}
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
