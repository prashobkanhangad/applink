import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';

// Dummy API key for listing
const DUMMY_KEYS = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'dl_live_8f3k2m9x7b1n4q6p0s5t8v2w4y7z9a1c3e',
    maskedKey: 'dl_live_••••••••••••••••••••••••••••••••••a1c3e',
    createdAt: '2026-01-15',
  },
];

/**
 * API Keys Page
 */
export const Keys = () => {
  const [apiKeys, setApiKeys] = useState(DUMMY_KEYS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null); // Show full key once after create (one-time view)
  const [copiedId, setCopiedId] = useState(null);

  const openModal = () => {
    setNewKeyName('');
    setCreatedKey(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewKeyName('');
    setCreatedKey(null);
  };

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const id = String(Date.now());
    const key = `dl_live_${id.slice(-8)}${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    const newEntry = {
      id,
      name: newKeyName.trim(),
      key,
      maskedKey: `${key.slice(0, 10)}••••••••••••••••••••••••••••••••••${key.slice(-5)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setApiKeys((prev) => [newEntry, ...prev]);
    setCreatedKey(newEntry);
    setNewKeyName('');
  };

  const handleCopyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id) => {
    if (window.confirm('Revoke this API key? It will stop working immediately.')) {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  return (
    <DashboardLayout title="API Keys" subtitle="Manage your API keys">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your API keys for programmatic access</p>
              </div>
              <button
                onClick={openModal}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
              >
                Create API Key
              </button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Create an API key to start using our API programmatically.
                </p>
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
                >
                  Create Your First API Key
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">
                        {item.maskedKey}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Created {item.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopyKey(item.key, item.id)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {copiedId === item.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleRevoke(item.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {createdKey ? 'API Key Created' : 'Create API Key'}
              </h3>
              {!createdKey && (
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  Copy your API key now. You won’t be able to see it again.
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Key name</label>
                  <p className="text-sm font-medium text-gray-900">{createdKey.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-lg font-mono break-all">
                      {createdKey.key}
                    </code>
                    <button
                      onClick={() => handleCopyKey(createdKey.key, createdKey.id)}
                      className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black flex-shrink-0"
                    >
                      {copiedId === createdKey.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label htmlFor="key-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Key name
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production API Key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newKeyName.trim()}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create API Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Keys;
