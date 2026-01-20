import React from 'react';
import { Section, Container, Button, Card, Badge } from '../design-system';
import { TrustSection } from '../components/TrustSection';
import { ProblemSolution } from '../components/ProblemSolution';
import { Capabilities } from '../components/Capabilities';
import { HowItWorks } from '../components/HowItWorks';
import { WhoItsFor } from '../components/WhoItsFor';
import { CTASection } from '../components/CTASection';
import { Pricing } from '../components/Pricing';
import { Hero } from '../components/Hero';

export const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <Hero />
      
      {/* Trust Section */}
      <TrustSection />
      
      {/* Problem-Solution Section */}
      <ProblemSolution />
      
      {/* Capabilities Section */}
      <Capabilities />
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* Who It's For Section */}
      <WhoItsFor />
      
      {/* CTA Section */}
      <CTASection />
      
      {/* Pricing Section */}
      <Pricing />

      {/* Components Showcase */}
      <Section>
        <Container>
          <h2 className="mb-8">Design System Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Button Variants */}
            <Card>
              <h3 className="mb-4">Buttons</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                </div>
              </div>
            </Card>

            {/* Badge Variants */}
            <Card>
              <h3 className="mb-4">Badges</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="success">Success</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </Card>

            {/* Card Example */}
            <Card>
              <h3 className="mb-2">Card Component</h3>
              <p className="text-sm text-text-secondary mb-4">
                Cards provide elevated surfaces for content grouping.
              </p>
              <Badge variant="primary">New</Badge>
            </Card>
          </div>

          {/* Typography Showcase */}
          <Card padding="lg" className="mb-12">
            <h2 className="mb-6">Typography Scale</h2>
            <div className="space-y-4">
              <div>
                <h1 className="mb-2">Heading 1 - Hero Text</h1>
                <p className="text-text-muted">Outcome-focused hero text for landing pages</p>
              </div>
              <div>
                <h2 className="mb-2">Heading 2 - Section Meaning</h2>
                <p className="text-text-muted">Clear section headers with semantic meaning</p>
              </div>
              <div>
                <h3 className="mb-2">Heading 3</h3>
                <p className="text-text-muted">Subsection headers</p>
              </div>
              <div>
                <p className="text-base">
                  Body text - Highly readable with optimized line-height. 
                  This is the default text style for paragraphs and content blocks. 
                  It uses a comfortable line-height for extended reading.
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">
                  Secondary text - Used for supporting information and captions.
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">
                  Muted text - For less important information and metadata.
                </p>
              </div>
            </div>
          </Card>

          {/* Color Palette */}
          <Card padding="lg">
            <h2 className="mb-6">Color System</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="mb-4">Primary Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-primary-500"></div>
                    <div>
                      <p className="font-medium">Primary Base</p>
                      <p className="text-sm text-text-muted">#6366f1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-primary-600"></div>
                    <div>
                      <p className="font-medium">Primary Hover</p>
                      <p className="text-sm text-text-muted">#4f46e5</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-primary-700"></div>
                    <div>
                      <p className="font-medium">Primary Active</p>
                      <p className="text-sm text-text-muted">#4338ca</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4">Accent Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-accent-500"></div>
                    <div>
                      <p className="font-medium">Accent Base</p>
                      <p className="text-sm text-text-muted">#14b8a6</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-accent-600"></div>
                    <div>
                      <p className="font-medium">Accent Hover</p>
                      <p className="text-sm text-text-muted">#0d9488</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4">Text Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-text-primary"></div>
                    <div>
                      <p className="font-medium">Text Primary</p>
                      <p className="text-sm text-text-muted">#111827</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-text-secondary"></div>
                    <div>
                      <p className="font-medium">Text Secondary</p>
                      <p className="text-sm text-text-muted">#4b5563</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-text-muted"></div>
                    <div>
                      <p className="font-medium">Text Muted</p>
                      <p className="text-sm text-text-muted">#6b7280</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
};

export default Home;
