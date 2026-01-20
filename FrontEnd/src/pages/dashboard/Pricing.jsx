import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';

/**
 * Pricing Page
 */
export const Pricing = () => {
  const plans = [
    {
      name: 'Forever Free',
      price: '$0',
      period: 'forever',
      features: ['Up to 25K MAU', 'Basic analytics', 'Standard support'],
      current: true,
    },
    {
      name: 'Growth',
      price: '$29',
      period: 'month',
      features: ['Up to 100K MAU', 'Advanced analytics', 'Priority support', 'Custom domains'],
    },
    {
      name: 'Scale',
      price: '$99',
      period: 'month',
      features: ['Up to 500K MAU', 'Enterprise analytics', '24/7 support', 'Custom domains', 'API access'],
    },
  ];

  return (
    <DashboardLayout title="Pricing" subtitle="Choose the right plan for you">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border-2 shadow-sm p-6 ${
                  plan.current ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {plan.current && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== 'forever' && (
                    <span className="text-sm text-gray-600">/{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
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
