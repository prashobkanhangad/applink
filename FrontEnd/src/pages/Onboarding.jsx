import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { completeOnboarding, getCurrentUser } from '../services/authService';
import { PageMeta } from '../components/PageMeta';
import { useTheme } from '../contexts/ThemeContext';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' },
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+971', label: 'AE +971' },
  { code: '+65', label: 'SG +65' },
  { code: '+61', label: 'AU +61' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+81', label: 'JP +81' },
  { code: '+82', label: 'KR +82' },
];

const JOB_ROLES = ['Founder', 'Product', 'Growth/Marketing', 'Engineering', 'Agency'];
const BUILDING_TYPES = ['Consumer app', 'SaaS', 'Ecommerce', 'Fintech', 'Gaming', 'Other'];
const USE_CASES = [
  'Deferred deep links',
  'Attribution',
  'Affiliate links',
  'Campaign tracking',
  'Firebase Dynamic Links replacement',
  'Universal/App Links setup',
];
const PLATFORMS = ['Android', 'iOS', 'Web', 'Flutter/React Native'];
const MAU_RANGES = ['<1k', '1k–10k', '10k–100k', '100k+'];
const TEAM_SIZES = ['Solo', '2–10', '11–50', '50+'];
const HEARD_FROM = ['Google', 'Twitter/X', 'Referral', 'Friend', 'Docs', 'Comparison article', 'Other'];
const CURRENT_SOLUTIONS = ['None', 'Firebase Dynamic Links', 'Branch', 'AppsFlyer', 'Custom', 'Other'];

const Chip = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
      selected
        ? 'bg-foreground text-background border-foreground'
        : 'bg-card text-foreground border-border hover:border-foreground/40'
    }`}
  >
    {children}
  </button>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-medium text-foreground mb-2">
    {children}
    {required && <span className="text-destructive ml-0.5">*</span>}
  </label>
);

export const Onboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/logo_light.png' : '/logo_dark.png';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    phoneCountryCode: '+91',
    phoneNumber: '',
    companyName: '',
    jobRole: '',
    buildingType: '',
    buildingTypeOther: '',
    primaryUseCase: '',
    platforms: [],
    mauRange: '',
    teamSize: '',
    heardFrom: '',
    heardFromOther: '',
    currentSolution: '',
    currentSolutionOther: '',
  });

  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/signup', { replace: true });
        return;
      }
      try {
        const current = await getCurrentUser();
        if (current?.user?.needsOnboarding === false || current?.user?.onboardingCompleted === true) {
          const userType = current?.userType || current?.user?.userType || current?.user?.role;
          navigate(userType === 'admin' ? '/admin' : '/dashboard', { replace: true });
          return;
        }
      } catch {
        navigate('/signup', { replace: true });
        return;
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [navigate]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const togglePlatform = (p) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  };

  const validateStep1 = () => {
    if (!form.phoneCountryCode || !form.phoneNumber.trim()) return 'Please enter your mobile number.';
    if (!/^\d{6,15}$/.test(form.phoneNumber.replace(/[\s-]/g, ''))) {
      return 'Enter a valid mobile number (digits only).';
    }
    if (!form.companyName.trim()) return 'Please enter your company / team name.';
    if (!form.jobRole) return 'Please select your role.';
    if (!form.buildingType) return 'Please select what you are building.';
    if (form.buildingType === 'Other' && !form.buildingTypeOther.trim()) {
      return 'Please tell us what you are building.';
    }
    if (!form.primaryUseCase) return 'Please select your primary use case.';
    return null;
  };

  const validateStep2 = () => {
    if (!form.platforms.length) return 'Please select at least one platform.';
    if (!form.mauRange) return 'Please select your monthly installs / MAU range.';
    if (!form.teamSize) return 'Please select your team size.';
    if (!form.heardFrom) return 'Please tell us how you heard about us.';
    if (form.heardFrom === 'Other' && !form.heardFromOther.trim()) {
      return 'Please tell us how you heard about us.';
    }
    if (!form.currentSolution) return 'Please select your current solution.';
    if (form.currentSolution === 'Other' && !form.currentSolutionOther.trim()) {
      return 'Please tell us your current solution.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    const err1 = validateStep1();
    if (err1) {
      setError(err1);
      setStep(1);
      return;
    }
    const err2 = validateStep2();
    if (err2) {
      setError(err2);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await completeOnboarding({
        phoneCountryCode: form.phoneCountryCode,
        phoneNumber: form.phoneNumber.replace(/[\s-]/g, ''),
        companyName: form.companyName.trim(),
        jobRole: form.jobRole,
        buildingType: form.buildingType,
        primaryUseCase: form.primaryUseCase,
        platforms: form.platforms,
        mauRange: form.mauRange,
        teamSize: form.teamSize,
        heardFrom: form.heardFrom,
        currentSolution: form.currentSolution,
        onboardingOther: {
          buildingType: form.buildingType === 'Other' ? form.buildingTypeOther.trim() : '',
          heardFrom: form.heardFrom === 'Other' ? form.heardFromOther.trim() : '',
          currentSolution: form.currentSolution === 'Other' ? form.currentSolutionOther.trim() : '',
        },
      });
      setSuccess('Thanks — you are all set!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 600);
    } catch (e) {
      setError(e.message || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden link-pattern">
      <PageMeta title="Complete your profile" description="Tell us a bit about you so we can improve DeepLink for your use case." path="/onboarding" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-screen py-10 md:py-14 px-4 sm:px-6">
        <div className="w-full max-w-2xl">
          <motion.div
            className="bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8 md:p-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-5">
              <Link to="/">
                <img src={logoSrc} alt="DeepLink" className="h-16 w-auto object-contain" />
              </Link>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Tell us about you</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                This helps us improve DeepLink for your team. Takes about a minute.
              </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-foreground' : 'bg-border'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-foreground' : 'bg-border'}`} />
            </div>
            <p className="text-xs text-muted-foreground mb-6 font-medium tracking-wide uppercase">
              Section {step} of 2 — {step === 1 ? 'About you & use case' : 'Product & team details'}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-600">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <FieldLabel required>Mobile number</FieldLabel>
                  <div className="flex gap-2">
                    <select
                      value={form.phoneCountryCode}
                      onChange={(e) => set('phoneCountryCode', e.target.value)}
                      className="w-[120px] px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Phone number"
                      value={form.phoneNumber}
                      onChange={(e) => set('phoneNumber', e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">For support, WhatsApp updates, and account recovery.</p>
                </div>

                <div>
                  <FieldLabel required>Company / team name</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. Acme Apps"
                    value={form.companyName}
                    onChange={(e) => set('companyName', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>

                <div>
                  <FieldLabel required>Role</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {JOB_ROLES.map((r) => (
                      <Chip key={r} selected={form.jobRole === r} onClick={() => set('jobRole', r)}>{r}</Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel required>What are you building?</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {BUILDING_TYPES.map((r) => (
                      <Chip key={r} selected={form.buildingType === r} onClick={() => set('buildingType', r)}>{r}</Chip>
                    ))}
                  </div>
                  {form.buildingType === 'Other' && (
                    <input
                      type="text"
                      placeholder="Tell us more"
                      value={form.buildingTypeOther}
                      onChange={(e) => set('buildingTypeOther', e.target.value)}
                      className="mt-2 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  )}
                </div>

                <div>
                  <FieldLabel required>Primary use case</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {USE_CASES.map((r) => (
                      <Chip key={r} selected={form.primaryUseCase === r} onClick={() => set('primaryUseCase', r)}>{r}</Chip>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <FieldLabel required>Platforms</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((r) => (
                      <Chip key={r} selected={form.platforms.includes(r)} onClick={() => togglePlatform(r)}>{r}</Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel required>Monthly installs / MAU</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {MAU_RANGES.map((r) => (
                      <Chip key={r} selected={form.mauRange === r} onClick={() => set('mauRange', r)}>{r}</Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel required>Team size</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {TEAM_SIZES.map((r) => (
                      <Chip key={r} selected={form.teamSize === r} onClick={() => set('teamSize', r)}>{r}</Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel required>How did you hear about us?</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {HEARD_FROM.map((r) => (
                      <Chip key={r} selected={form.heardFrom === r} onClick={() => set('heardFrom', r)}>{r}</Chip>
                    ))}
                  </div>
                  {form.heardFrom === 'Other' && (
                    <input
                      type="text"
                      placeholder="Tell us more"
                      value={form.heardFromOther}
                      onChange={(e) => set('heardFromOther', e.target.value)}
                      className="mt-2 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  )}
                </div>

                <div>
                  <FieldLabel required>Current solution</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {CURRENT_SOLUTIONS.map((r) => (
                      <Chip key={r} selected={form.currentSolution === r} onClick={() => set('currentSolution', r)}>{r}</Chip>
                    ))}
                  </div>
                  {form.currentSolution === 'Other' && (
                    <input
                      type="text"
                      placeholder="Tell us more"
                      value={form.currentSolutionOther}
                      onChange={(e) => set('currentSolutionOther', e.target.value)}
                      className="mt-2 w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep(1); }}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border font-medium hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Finish & go to dashboard'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
