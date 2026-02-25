import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { getApiKeys, createApiKey, revokeApiKey } from '../../services/appService';

/**
 * API Keys Page - Dynamic keys stored in backend with userId reference
 */
export const Keys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [keyToRevoke, setKeyToRevoke] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const loadKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getApiKeys();
      if (result.success) setApiKeys(Array.isArray(result.keys) ? result.keys : []);
    } catch (err) {
      setError(err.message || 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const openModal = () => {
    setNewKeyName('');
    setCreatedKey(null);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewKeyName('');
    setCreatedKey(null);
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const result = await createApiKey(newKeyName);
      if (result.success && result.key) {
        setCreatedKey({
          id: result.key._id || result.key.id,
          name: result.key.name,
          key: result.key.key,
          maskedKey: result.key.maskedKey,
          createdAt: result.key.createdAt,
        });
        setNewKeyName('');
        loadKeys();
      }
    } catch (err) {
      setError(err.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeClick = (item) => {
    setKeyToRevoke(item);
  };

  const handleRevokeConfirm = async () => {
    if (!keyToRevoke) return;
    const id = keyToRevoke._id || keyToRevoke.id;
    setRevokingId(id);
    try {
      await revokeApiKey(id);
      setApiKeys((prev) => prev.filter((k) => (k._id || k.id) !== id));
      setKeyToRevoke(null);
    } catch (err) {
      setError(err.message || 'Failed to revoke API key');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeCancel = () => {
    setKeyToRevoke(null);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout title="API Keys" subtitle="Manage your API keys">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your API keys for programmatic access</p>
              </div>
              <Button onClick={openModal} variant="hero" size="default">
                Create API Key
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground mt-4">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No API Keys</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create an API key to start using our API programmatically.
                </p>
                <Button onClick={openModal} variant="hero" size="default">
                  Create Your First API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.maskedKey}</p>
                      <p className="text-xs text-muted-foreground mt-1">Created {formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRevokeClick(item)}
                        disabled={revokingId === (item._id || item.id)}
                      >
                        {revokingId === (item._id || item.id) ? 'Revoking...' : 'Revoke'}
                      </Button>
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
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} aria-hidden="true" />
          <div className="relative bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {createdKey ? 'API Key Created' : 'Create API Key'}
              </h3>
              {!createdKey && (
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  Copy your API key now. You won’t be able to see it again.
                </p>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Key name</label>
                  <p className="text-sm font-medium text-foreground">{createdKey.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">API Key</label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 text-sm bg-muted rounded-xl font-mono break-all text-foreground">
                      {createdKey.key}
                    </code>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleCopyKey(createdKey.key, createdKey.id)}
                      className="flex-shrink-0"
                    >
                      {copiedId === createdKey.id ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button onClick={closeModal} variant="hero" size="default">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label htmlFor="key-name" className="block text-sm font-medium text-foreground mb-1">
                    Key name
                  </label>
                  <input
                    id="key-name"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production API Key"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2 justify-end">
                  <Button type="button" variant="outline" size="default" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    size="default"
                    disabled={!newKeyName.trim() || isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create API Key'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Revoke confirmation modal */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleRevokeCancel}>
          <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Revoke API key?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to revoke <span className="font-medium text-foreground">"{keyToRevoke.name}"</span>? It will stop working immediately.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleRevokeCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRevokeConfirm}
                disabled={revokingId === (keyToRevoke._id || keyToRevoke.id)}
              >
                {revokingId === (keyToRevoke._id || keyToRevoke.id) ? 'Revoking...' : 'Revoke'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Keys;
