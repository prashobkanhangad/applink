import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header, Footer } from '../components/landing';
import { PageMeta } from '../components/PageMeta';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle2, DollarSign, Target, Shield, BarChart3, Zap, UserPlus, Link2, Sparkles } from 'lucide-react';

const META = {
  title: 'Affiliate Program — Earn 30% Recurring Commission | deeplink.in',
  description: 'Join the deeplink.in affiliate program. Earn 30% recurring commission for 12 months on every paid customer you refer. Built for developers.',
};

const initialForm = { name: '', email: '', phone: '', website: '', message: '' };

export const Affiliate = () => {
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const openAffiliateModal = () => {
    setAffiliateModalOpen(true);
    setForm(initialForm);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const closeAffiliateModal = () => {
    setAffiliateModalOpen(false);
    setSubmitStatus('idle');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAffiliateSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    setErrorMessage('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${API_BASE}/affiliate/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }
      setSubmitStatus('success');
      setForm(initialForm);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err.message || 'Failed to submit. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageMeta title={META.title} description={META.description} path="/affiliate" />
      <Header />

      <main className="flex-grow pt-24">
        {/* Hero - match Home HeroSection */}
        <section className="relative flex items-center justify-center pt-28 pb-24 overflow-hidden link-pattern">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(200_85%_50%)]/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">30% recurring for 12 months</span>
              </motion.div>
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Earn 30% Recurring Commission{" "}
                <span className="text-gradient">by Referring deeplink.in</span>
              </motion.h1>
              <motion.p
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Help developers build smarter deep links — and earn every month for up to 12 months on every paid customer you refer.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button type="button" variant="hero" size="xl" className="group" onClick={openAffiliateModal}>
                  Become an Affiliate
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/signup">
                  <Button variant="hero-outline" size="xl">Login to Affiliate Dashboard</Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Join - match FeaturesSection */}
        <section id="why-join" className="py-24 lg:py-32 relative">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Why Join the deeplink.in{" "}
                <span className="text-gradient">Affiliate Program?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Earn recurring revenue while helping developers adopt smart deep linking. Transparent tracking, monthly payouts.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: DollarSign, title: '30% Recurring Commission', desc: 'Earn 30% of every subscription payment for 12 months. If a customer pays ₹3,500/month, you earn ₹1,050/month — for a full year.' },
                { icon: Target, title: 'Built for Developers', desc: 'deeplink.in is a developer-first deep linking platform. Your audience: Flutter developers, Android & iOS teams, SaaS founders, agencies, growth marketers.' },
                { icon: Shield, title: 'Transparent & Fair Tracking', desc: '60-day tracking cookie, real-time dashboard, clear commission reporting, monthly payouts. No hidden conditions.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group block bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How Much Can You Earn - attractive earnings showcase */}
        {/* <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                How Much{" "}
                <span className="text-gradient">Can You Earn?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple math. The more you refer, the more you earn—every month for 12 months.
              </p>
            </motion.div>
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-b from-primary/10 to-card rounded-3xl p-8 sm:p-10 lg:p-12 border-2 border-primary/20 shadow-xl shadow-primary/5">
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                    <DollarSign className="w-4 h-4" /> 30% per customer
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-secondary border border-border text-sm font-medium text-muted-foreground">
                    × 12 months recurring
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="bg-card/80 backdrop-blur rounded-2xl p-6 border border-border text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Refer 15 customers</p>
                    <p className="text-xs text-muted-foreground mb-3">₹3,500/month plan</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gradient mb-1">₹15,750</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                  <div className="bg-card/80 backdrop-blur rounded-2xl p-6 border border-primary/30 text-center relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      Scale up
                    </span>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Refer 50 customers</p>
                    <p className="text-xs text-muted-foreground mb-3">₹3,500/month plan</p>
                    <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">₹52,500+</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>
                <p className="text-center text-muted-foreground text-sm mt-6">
                  That’s ₹1,050 commission per customer every month — for a full year.
                </p>
              </div>
            </motion.div>
          </div>
        </section> */}

        {/* How It Works */}
        <section className="py-24 lg:py-32 bg-secondary/50 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join the affiliate program and start earning recurring commission in three simple steps.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { number: '01', icon: UserPlus, title: 'Sign up as an affiliate', description: 'Join the program in a few clicks. Submit your details and we\'ll get you set up with your unique referral link.' },
                { number: '02', icon: Link2, title: 'Share your referral link', description: 'Use your unique link everywhere—blog, social, videos. When someone signs up via your link, we track it.', link: 'https://deeplink.in/?ref=yourcode' },
                { number: '03', icon: DollarSign, title: 'Earn recurring commission', description: 'When someone signs up and becomes a paid customer, you earn 30% recurring commission for 12 months.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="text-5xl font-bold text-primary/20 mb-4 font-mono">
                      {step.number}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 border border-primary/20">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {step.description}
                    </p>
                    {step.link && (
                      <p className="text-sm font-mono text-muted-foreground bg-background rounded-lg p-3 break-all border border-border">
                        {step.link}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 lg:py-32 relative">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                What You <span className="text-gradient">Get</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to track and grow your affiliate revenue.
              </p>
            </motion.div>
            <motion.ul
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {['Personal affiliate dashboard', 'Click tracking', 'Signup tracking', 'Paid conversion tracking', 'Commission history', 'Payout reports'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground bg-card rounded-2xl p-4 border border-border shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* Who Is This Perfect For */}
        <section className="py-24 lg:py-32 relative bg-secondary/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Who Is This <span className="text-gradient">Perfect For?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                SaaS reviewers, Developer YouTubers, Flutter bloggers, Dev agencies, Tech communities, Indie hacker founders. If your audience builds apps, this program is for you.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {['SaaS reviewers', 'Developer YouTubers', 'Flutter bloggers', 'Dev agencies', 'Tech communities', 'Indie hacker founders'].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground shadow-sm">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Fair Use + Payout */}
        {/* <section className="py-24 lg:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: 'Fair Use Policy', items: ['No self-referrals', 'No coupon abuse', 'No fraudulent activity', 'Commission applies to new customers only'], footer: 'We reward long-term growth partners.' },
                { icon: BarChart3, title: 'Payout Details', items: ['Commission: 30% recurring', 'Duration: 12 months per customer', 'Tracking window: 60 days', 'Minimum payout: ₹5,000', 'Payout cycle: Monthly', '30-day validation hold before payout'], footer: null },
              ].map((block, i) => (
                <motion.div
                  key={i}
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <block.icon className="w-6 h-6 text-primary" />
                    {block.title}
                  </h2>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    {block.items.map((line, j) => (
                      <li key={j}>• {line}</li>
                    ))}
                  </ul>
                  {block.footer && <p className="mt-4 text-foreground font-medium text-sm">{block.footer}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Why Promote */}
        <section className="py-24 lg:py-32 relative bg-secondary/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Why Promote <span className="text-gradient">deeplink.in?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Deep linking is essential infrastructure for modern apps. Replace Firebase Dynamic Links, improve mobile onboarding, enable deferred deep linking, track deep_open events. Developer-friendly SDKs. This is not a trend — it&apos;s foundational tech.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {['Replace Firebase Dynamic Links', 'Improve mobile onboarding', 'Deferred deep linking', 'Track deep_open events', 'Developer-friendly SDKs'].map((item) => (
                <span key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Zap className="w-4 h-4" /> {item}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Built for Long-Term */}
        <section className="py-24 lg:py-32 relative">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center max-w-2xl mx-auto bg-card rounded-2xl p-8 border border-border shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Built for <span className="text-gradient">Long-Term Partners</span>
              </h2>
              <p className="text-muted-foreground">
                We believe in sustainable partnerships. As we grow, our affiliates grow with us. Top affiliates may qualify for: higher commission tiers, early feature access, co-marketing opportunities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA - match CTASection */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="bg-card rounded-3xl p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto border border-border shadow-xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Start Earning <span className="text-gradient">Recurring Revenue?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Join the deeplink.in Affiliate Program today. Get your unique link and start earning 30% for 12 months on every paid customer you refer.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button type="button" variant="hero" size="xl" className="group" onClick={openAffiliateModal}>
                  Become an Affiliate
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/">
                  <Button variant="hero-outline" size="xl">Learn More</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {affiliateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeAffiliateModal}>
          <div className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-foreground">Become an Affiliate</h3>
                <button type="button" onClick={closeAffiliateModal} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted" aria-label="Close">✕</button>
              </div>
              {submitStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Thank you!</h4>
                  <p className="text-muted-foreground mb-6">We&apos;ve received your details. Our team will get back to you shortly with your affiliate link and next steps.</p>
                  <Button type="button" onClick={closeAffiliateModal} variant="hero">Close</Button>
                </div>
              ) : (
                <form onSubmit={handleAffiliateSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="aff-name" className="block text-sm font-medium text-foreground mb-1.5">Full name *</label>
                    <input id="aff-name" name="name" type="text" required value={form.name} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="aff-email" className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                    <input id="aff-email" name="email" type="email" required value={form.email} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="aff-phone" className="block text-sm font-medium text-foreground mb-1.5">Phone *</label>
                    <input id="aff-phone" name="phone" type="tel" required value={form.phone} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label htmlFor="aff-website" className="block text-sm font-medium text-foreground mb-1.5">Website / Channel</label>
                    <input id="aff-website" name="website" type="url" value={form.website} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://youtube.com/yourchannel" />
                  </div>
                  <div>
                    <label htmlFor="aff-message" className="block text-sm font-medium text-foreground mb-1.5">How will you promote us?</label>
                    <textarea id="aff-message" name="message" value={form.message} onChange={handleFormChange} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="e.g. YouTube, blog, community..." />
                  </div>
                  {submitStatus === 'error' && <p className="text-sm text-destructive">{errorMessage}</p>}
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={closeAffiliateModal} className="flex-1">Cancel</Button>
                    <Button type="submit" variant="hero" disabled={submitStatus === 'submitting'} className="flex-1">{submitStatus === 'submitting' ? 'Submitting…' : 'Submit'}</Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Affiliate;
