import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Section, Container } from '../design-system';
import { PageMeta } from '../components/PageMeta';
import { DOCS_URL } from '../constants/publicSite';

const META = {
  title: 'About Deeplink',
  description:
    'Deeplink builds smart deep linking and install attribution for mobile apps and the web. Learn our mission: one link that opens the right screen on Android, iOS, and web.',
};

export const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PageMeta title={META.title} description={META.description} path="/about" />
      <Header />

      <main className="flex-grow">
        <Section padding="lg" background="surface">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-semibold text-text-primary mb-6">
                About Deeplink
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed">
                Deeplink is a smart deep linking and install attribution platform. We help product,
                growth, and engineering teams create one link that opens the right in-app screen —
                whether the app is installed or not — across Android, iOS, and web.
              </p>
            </div>
          </Container>
        </Section>

        <Section padding="default" background="default">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                Our Mission
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-text-secondary leading-relaxed mb-4">
                  Broken mobile journeys waste installs. Users click a campaign, referral, or product
                  link, hit the store, install the app, and land on the home screen — losing the
                  context that made them click. Attribution and deferred deep linking become an
                  afterthought bolted onto marketing stacks.
                </p>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Our mission is to make deep linking infrastructure simple, reliable, and
                  developer-friendly: smart links, deferred routing after install, UTM-aware
                  analytics, and SDKs/APIs that product and growth teams can ship without a
                  multi-month MMP project.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section padding="default" background="surface">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                What We Build
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Universal smart deep links
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    One URL that detects device and app availability, then opens the app, the store,
                    or a web fallback — with Android App Links and iOS Universal Links supported.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Deferred deep linking &amp; attribution
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Preserve click intent through install so first open can route to the right screen
                    and campaigns can be measured with clicks, installs, and conversions.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    APIs, SDKs, and a clear dashboard
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Create and manage links, set UTMs, and integrate with{' '}
                    <a
                      href={DOCS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      docs and SDKs
                    </a>{' '}
                    without hiding pricing or burying setup behind enterprise sales.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section padding="default" background="default">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                Product Philosophy
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Reliability over feature theater
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Deep links fail silently when domains, asset links, or fallbacks break. We invest
                    in routing correctness, monitoring, and platform edge cases so campaigns and
                    onboarding do not silently drop users.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Transparent for buyers and builders
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Clear docs, straightforward plans, and APIs you can try without a sales call.
                    Product managers and engineers should share the same mental model of how a link
                    behaves.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    Built for long-term mobile growth
                  </h3>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    After Firebase Dynamic Links shut down, teams need a durable home for deferred
                    deep linking. We design for lasting platform support — not a short-lived side
                    project.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section padding="default" background="surface">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                Who We Serve
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-4">
                Mobile product managers, growth marketers, and developers at startups and scale-ups
                who need deferred deep linking, referral flows, and campaign attribution without
                enterprise MMP complexity. Explore the{' '}
                <Link to="/deep-linking-platform" className="text-primary underline underline-offset-2">
                  deep linking platform
                </Link>
                ,{' '}
                <Link to="/deferred-deep-linking" className="text-primary underline underline-offset-2">
                  deferred deep linking
                </Link>
                , and our{' '}
                <Link to="/blog" className="text-primary underline underline-offset-2">
                  guides
                </Link>
                .
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                <Link to="/signup" className="text-primary underline underline-offset-2">
                  Start free
                </Link>{' '}
                or read the{' '}
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  documentation
                </a>
                .
              </p>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
