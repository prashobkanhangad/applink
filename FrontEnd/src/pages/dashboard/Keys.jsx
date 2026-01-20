import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';

/**
 * API Keys Page
 */
export const Keys = () => {
  const [apiKeys] = useState([]);

  return (
    <DashboardLayout title="API Keys" subtitle="Manage your API keys">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your API keys for programmatic access</p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Create API Key
              </button>
            </div>
            {apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Create an API key to start using our API programmatically.
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                  Create Your First API Key
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* API Key list would go here */}
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Keys;
