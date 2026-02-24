import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X, Shield } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { getCurrentUser } from '../../services/authService';

/** Permission options for team members (labels for UI; backend can map to codes later) */
export const TEAM_PERMISSIONS = [
  { id: 'view_links', label: 'View links' },
  { id: 'create_links', label: 'Create links' },
  { id: 'edit_links', label: 'Edit links' },
  { id: 'delete_links', label: 'Delete links' },
  { id: 'manage_apps', label: 'Manage apps' },
  { id: 'view_analytics', label: 'View analytics' },
];

const inputClass =
  'w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

/**
 * Team Page
 * Available for all plans. Create team users and assign permissions (UI only for now).
 */
export const Team = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    name: '',
    permissions: [],
  });
  const [teamMembers, setTeamMembers] = useState([]); // Mock list; replace with API later
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        await getCurrentUser();
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Team" subtitle="Manage your team members">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground mt-4">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const togglePermission = (id) => {
    setAddForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    // UI only: add to local state; replace with API call later
    const newMember = {
      id: String(Date.now()),
      email: addForm.email,
      name: addForm.name || addForm.email.split('@')[0],
      permissions: [...addForm.permissions],
      status: 'pending',
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setAddForm({ email: '', name: '', permissions: [] });
    setShowAddModal(false);
  };

  const handleRemoveMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const showPlanToast = () => {
    setToast('Team feature not available for your current plan');
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  };

  return (
    <DashboardLayout title="Team" subtitle="Manage your team members">
      {toast && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg bg-foreground text-background text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {toast}
        </div>
      )}
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Team members</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add users and set their permissions for this workspace.
                </p>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="gap-2"
                onClick={showPlanToast}
              >
                <UserPlus className="w-5 h-5" />
                Add team member
              </Button>
            </div>

            {teamMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-secondary/20 py-12 text-center">
                <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">No team members yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add people to collaborate and choose what they can do.
                </p>
                <Button variant="hero-outline" size="default" onClick={showPlanToast}>
                  Add team member
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-sm font-medium text-foreground">Name / Email</th>
                      <th className="px-4 py-3 text-sm font-medium text-foreground">Permissions</th>
                      <th className="px-4 py-3 text-sm font-medium text-foreground">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-foreground w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{member.name || member.email}</div>
                          {member.name && (
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {member.permissions.length === 0 ? (
                              <span className="text-sm text-muted-foreground">—</span>
                            ) : (
                              member.permissions.map((permId) => {
                                const perm = TEAM_PERMISSIONS.find((p) => p.id === permId);
                                return (
                                  <span
                                    key={permId}
                                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                                  >
                                    {perm ? perm.label : permId}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              member.status === 'active'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }
                          >
                            {member.status === 'active' ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add team member modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden
            onClick={() => {
              setShowAddModal(false);
              setAddForm({ email: '', name: '', permissions: [] });
            }}
          />
          <motion.div
            role="dialog"
            aria-labelledby="add-modal-title"
            className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 id="add-modal-title" className="text-lg font-semibold text-foreground">
                Add team member
              </h3>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({ email: '', name: '', permissions: [] });
                }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label htmlFor="add-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="add-email"
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                  placeholder="teammate@example.com"
                />
              </div>
              <div>
                <label htmlFor="add-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name (optional)
                </label>
                <input
                  id="add-name"
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-foreground mb-2">Permissions</span>
                <p className="text-xs text-muted-foreground mb-2">
                  Choose what this user can do in the workspace.
                </p>
                <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-3">
                  {TEAM_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={addForm.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="hero-outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({ email: '', name: '', permissions: [] });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  Add member
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Team;
