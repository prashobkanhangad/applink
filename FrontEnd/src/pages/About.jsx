import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Section, Container } from '../design-system';

export const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <Section padding="lg" background="surface">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-semibold text-text-primary mb-6">
                About DeepLink
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed">
                We build tools that help teams work better together.
              </p>
            </div>
          </Container>
        </Section>

        {/* Mission */}
        <Section padding="default" background="default">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                  Our Mission
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-text-secondary leading-relaxed mb-4">
                    We believe that software tools should work together seamlessly. 
                    Too much time is wasted moving data between systems, managing 
                    duplicate workflows, and maintaining custom integrations.
                  </p>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Our mission is to eliminate these friction points by providing 
                    reliable, straightforward integration infrastructure that 
                    teams can depend on. We focus on solving real problems for 
                    real teams, without unnecessary complexity.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Product Philosophy */}
        <Section padding="default" background="surface">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                  Product Philosophy
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      Reliability over features
                    </h3>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      We prioritize stability and uptime over adding new features. 
                      When teams depend on our platform to keep their workflows 
                      running, reliability is not optional. We invest heavily in 
                      infrastructure, monitoring, and testing to ensure our service 
                      meets the standards our customers need.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      Transparency in everything
                    </h3>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      We believe in clear communication about what our product does, 
                      how it works, and what it costs. No hidden fees, no confusing 
                      pricing tiers, no marketing language that obscures reality. 
                      Our documentation is comprehensive, our status page is public, 
                      and our pricing is straightforward.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      Build for the long term
                    </h3>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      We design our product and company for sustainability. This means 
                      making decisions that serve customers over years, not just months. 
                      We avoid shortcuts that create technical debt, and we invest in 
                      maintainable systems that will scale with our customers' needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Long-term Vision */}
        <Section padding="default" background="default">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                  Long-term Vision
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-text-secondary leading-relaxed mb-4">
                    In the next decade, we see a world where software tools integrate 
                    as easily as they do today, but with far less effort required 
                    from development teams. Integration infrastructure should be as 
                    reliable and invisible as electricity or internet connectivity.
                  </p>
                  <p className="text-lg text-text-secondary leading-relaxed mb-4">
                    We're building toward a platform that handles the complexity of 
                    connecting systems, so teams can focus on building their products 
                    rather than maintaining integrations. This means expanding our 
                    coverage of tools and services, improving our reliability and 
                    performance, and making our platform accessible to teams of all sizes.
                  </p>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    Our goal is to become the standard infrastructure layer that 
                    teams use when they need reliable integrations. We measure success 
                    not by growth metrics, but by how many teams can build better 
                    products because they're using our platform.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
