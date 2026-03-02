import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { getPlans, getOverviewStats, createPaymentOrder, verifyPayment } from '@/services/appService';
import { getCurrentUser } from '@/services/authService';

/**
 * Pricing Page - matches homepage pricing section UI style.
 * Current plan comes from GET /auth/me (currentPlan, planId); duration/renewsOn are placeholders until billing exists.
 */
export const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'

  // Current plan from API; description/isFree filled from plans list when loaded
  const [currentPlan, setCurrentPlan] = useState({
    name: null,
    planId: null,
    isFree: false,
    description: '',
    duration: '—',
    renewsOn: '—',
    totalClicks: 0,
    monthlyClickLimit: null,
  });
  const [currentPlanLoading, setCurrentPlanLoading] = useState(true);

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

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Fetch current user plan (name, planId) from auth/me
  useEffect(() => {
    let cancelled = false;
    setCurrentPlanLoading(true);
    getCurrentUser()
      .then((result) => {
        if (cancelled || !result?.success) return;
        const user = result.user || {};
        setCurrentPlan((prev) => ({
          ...prev,
          name: user.currentPlan ?? 'Free',
          planId: user.planId ?? null,
        }));
      })
      .catch(() => {
        if (!cancelled) setCurrentPlan((prev) => ({ ...prev, name: 'Free', planId: null }));
      })
      .finally(() => {
        if (!cancelled) setCurrentPlanLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPlans()
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        const sortPrice = (p) =>
            String(p.title || "").toUpperCase() === "ENTERPRISE" ? Infinity : Number(p.price) ?? 0;
        const sorted = [...data].sort((a, b) => sortPrice(a) - sortPrice(b));
        setPlans(
          sorted.map((p) => {
            const priceNum = Number(p.price);
            const yearlyNum = p.yearlyPrice != null ? Number(p.yearlyPrice) : priceNum * 10;
            const benefits = Array.isArray(p.benefits) ? p.benefits : [];
            const notIncluded = Array.isArray(p.notIncludedBenefits) ? p.notIncludedBenefits : [];
            const features = [
              ...benefits.map((text) => ({ text: String(text), included: true })),
              ...notIncluded.map((text) => ({ text: String(text), included: false })),
            ];
            const isEnterprise = String(p.title || '').toUpperCase() === 'ENTERPRISE';
            const description = isEnterprise
              ? 'Over 500K monthly clicks'
              : p.monthlyClickLimit != null && p.monthlyClickLimit > 0
                ? `Up to ${Number(p.monthlyClickLimit).toLocaleString()} clicks/mo`
                : '';
            return {
              id: p._id?.toString?.() ?? p._id,
              name: p.title || 'Plan',
              subtitle: '',
              description,
              price: isEnterprise ? null : { monthly: priceNum, yearly: yearlyNum },
              period: isEnterprise || priceNum === 0 ? '' : '/mo',
              features: features.length ? features : [{ text: 'Contact us', included: true }],
              cta: 'Choose Plan',
              popular: Boolean(p.isPopular),
              isFree: priceNum === 0 && !isEnterprise,
              isEnterprise,
              monthlyClickLimit: p.monthlyClickLimit != null ? Number(p.monthlyClickLimit) : null,
            };
          })
        );
      })
      .catch((err) => {
        if (!cancelled) setPlansError(err.message || 'Failed to load plans');
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // When plans load, fill current plan description, isFree, and monthlyClickLimit from the matching plan
  useEffect(() => {
    if (plans.length === 0 || !currentPlan.name) return;
    const match = plans.find((p) => p.name === currentPlan.name);
    if (match) {
      setCurrentPlan((prev) => ({
        ...prev,
        description: match.description || prev.description,
        isFree: match.isFree,
        monthlyClickLimit: match.monthlyClickLimit ?? prev.monthlyClickLimit,
      }));
    }
  }, [plans, currentPlan.name]);

  // Fetch click usage (overview stats) for Current Plan section
  useEffect(() => {
    let cancelled = false;
    getOverviewStats()
      .then((res) => {
        if (cancelled || !res?.success) return;
        setCurrentPlan((prev) => ({
          ...prev,
          totalClicks: res.totalClicks ?? 0,
        }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Infer country for payment: India => charge in INR (backend converts USD to INR)
  const getPaymentCountry = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Kolkata') || tz === 'Asia/Calcutta') return 'IN';
      const lang = typeof navigator !== 'undefined' ? navigator.language || '' : '';
      if (/^en-IN$/i.test(lang) || lang.startsWith('hi')) return 'IN';
      return undefined;
    } catch {
      return undefined;
    }
  };

  // Load Razorpay checkout script
  const [razorpayReady, setRazorpayReady] = useState(false);
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    return () => {};
  }, []);

  const handlePlanClick = async (plan) => {
    if (plan.name === currentPlan.name) return;
    if (plan.isFree || plan.isEnterprise) return;
    if (!plan.id) {
      setPaymentError('Plan ID missing. Please refresh.');
      return;
    }
    setPaymentError(null);
    setPaymentLoading(plan.id);
    try {
      const country = getPaymentCountry();
      const data = await createPaymentOrder(plan.id, billingPeriod, country);
      if (!razorpayReady || !window.Razorpay) {
        setPaymentError('Payment is loading. Please try again in a moment.');
        setPaymentLoading(null);
        return;
      }
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'Deeplink',
        description: `${plan.name} (${billingPeriod})`,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const result = await getCurrentUser();
            if (result?.success && result.user) {
              setCurrentPlan((prev) => ({
                ...prev,
                name: result.user.currentPlan ?? prev.name,
                planId: result.user.planId ?? prev.planId,
              }));
            }
          } catch (err) {
            setPaymentError(err.message || 'Verification failed');
          } finally {
            setPaymentLoading(null);
          }
        },
        modal: { ondismiss: () => setPaymentLoading(null) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setPaymentError('Payment failed or was cancelled.');
        setPaymentLoading(null);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || 'Could not start payment');
      setPaymentLoading(null);
    }
  };

  const getPriceDisplay = (plan) => {
    if (plan.isEnterprise || plan.price === null) return 'Custom pricing';
    const amount = plan.price[billingPeriod];
    return amount === 0 ? '$0' : `$${amount}`;
  };

  const getPeriodDisplay = (plan) => {
    if (plan.isEnterprise || plan.isFree) return plan.period || '';
    return billingPeriod === 'yearly' ? '/year' : '/mo';
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

          {/* Current Plan Section - from GET /auth/me (currentPlan, planId); description/isFree from plans */}
          <div className="mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                    Current Plan
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {currentPlanLoading ? '…' : (currentPlan.name || '—')}
                  </h3>
                  {currentPlan.isFree && (
                    <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{currentPlan.description || '—'}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{currentPlan.duration}</div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{currentPlan.renewsOn}</div>
                  <div className="text-xs text-gray-600">Renews On</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {currentPlan.monthlyClickLimit != null && currentPlan.monthlyClickLimit > 0
                      ? `${Number(currentPlan.totalClicks).toLocaleString()} / ${currentPlan.monthlyClickLimit.toLocaleString()}`
                      : Number(currentPlan.totalClicks).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Click usage</div>
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
          {plansLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl p-6 lg:p-8 bg-white border border-gray-200 animate-pulse h-80" />
              ))}
            </div>
          )}
          {plansError && (
            <p className="text-center text-gray-600 py-8">{plansError}</p>
          )}
          {paymentError && (
            <p className="text-center text-red-600 text-sm mb-4">{paymentError}</p>
          )}
          {!plansLoading && !plansError && plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {plans.map((plan) => (
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
                  type="button"
                  disabled={paymentLoading === plan.id}
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3 rounded-lg text-sm font-medium transition-colors mt-auto disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.popular
                      ? 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
                      : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900/10'
                  }`}
                >
                  {plan.name === currentPlan.name
                    ? 'Current Plan'
                    : paymentLoading === plan.id
                      ? 'Opening…'
                      : plan.isFree || plan.isEnterprise
                        ? 'Contact us'
                        : plan.cta}
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Pricing;
