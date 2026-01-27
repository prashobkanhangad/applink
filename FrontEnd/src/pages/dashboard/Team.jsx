import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { getCurrentUser } from '../../services/authService';

/**
 * Team Page
 * Only available for Enterprise plan users
 */
export const Team = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isEnterprise, setIsEnterprise] = useState(false);

  useEffect(() => {
    const checkUserPlan = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success) {
          const plan = result.currentPlan || result.user?.currentPlan;
          setCurrentPlan(plan);
          // Check if plan is enterprise (case-insensitive)
          setIsEnterprise(plan && plan.toLowerCase() === 'enterprise');
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPlan();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Team" subtitle="Manage your team members">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // Show upgrade message if not enterprise
  if (!isEnterprise) {
    return (
      <DashboardLayout title="Team" subtitle="Manage your team members">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Feature</h2>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  Team Management is exclusively available for Enterprise plan users. Upgrade to Enterprise to invite team members and manage their access to your workspace.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/dashboard/pricing')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    Upgrade to Enterprise
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
                {currentPlan && (
                  <p className="text-xs text-gray-500 mt-4">
                    Current Plan: <span className="font-semibold">{currentPlan}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // Show team management UI for enterprise users
  return (
    <DashboardLayout title="Team" subtitle="Manage your team members">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Management</h2>
              <p className="text-sm text-gray-600 mb-6">
                Invite team members and manage their access to your workspace.
              </p>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Invite Team Member
              </button>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Team;
