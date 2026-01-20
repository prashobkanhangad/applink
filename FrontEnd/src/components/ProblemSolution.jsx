import React from 'react';
import { Section, Container } from '../design-system';

export const ProblemSolution = () => {
  // Problem-Solution pairs that map directly to each other
  const problemSolutionPairs = [
    {
      problem: 'Your tools don\'t talk to each other',
      solution: 'Connect everything with one platform',
    },
    {
      problem: 'Manual workflows waste hours every week',
      solution: 'Automate repetitive tasks instantly',
    },
    {
      problem: 'Team members duplicate work across systems',
      solution: 'Keep everyone in sync automatically',
    },
  ];

  return (
    <Section padding="default" background="default">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Problems */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-8">
                The problems you face
              </h2>
              
              <div className="space-y-8">
                {problemSolutionPairs.map((pair, index) => (
                  <div key={index} className="flex items-start gap-4">
                    {/* Problem indicator */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                      <span className="text-red-600 text-xs font-semibold">!</span>
                    </div>
                    
                    {/* Problem text */}
                    <div>
                      <p className="text-base md:text-lg text-text-primary leading-relaxed">
                        {pair.problem}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Solutions */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-8">
                How we solve it
              </h2>
              
              <div className="space-y-8">
                {problemSolutionPairs.map((pair, index) => (
                  <div key={index} className="flex items-start gap-4">
                    {/* Solution indicator */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center mt-1">
                      <svg
                        className="w-4 h-4 text-accent-600"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    {/* Solution text */}
                    <div>
                      <p className="text-base md:text-lg text-text-primary leading-relaxed">
                        {pair.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default ProblemSolution;
