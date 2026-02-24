import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { getCurrentUser } from '../../services/authService';

/**
 * Profile Page
 * Displays and allows editing of user profile information
 */
export const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load user data from API
    const loadUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try to load from localStorage for immediate display
        const cachedUserData = localStorage.getItem('user');
        if (cachedUserData) {
          try {
            const parsedUser = JSON.parse(cachedUserData);
            setUser(parsedUser);
            setFormData({
              username: parsedUser.username || '',
              email: parsedUser.email || '',
              name: parsedUser.name || '',
            });
          } catch (err) {
            console.error('Error parsing cached user data:', err);
          }
        }

        // Then fetch fresh data from API
        const result = await getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
          setFormData({
            username: result.user.username || '',
            email: result.user.email || '',
            name: result.user.name || '',
          });
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message || 'Failed to load user data');
        
        // If API fails but we have cached data, use that
        if (!user) {
          const cachedUserData = localStorage.getItem('user');
          if (cachedUserData) {
            try {
              const parsedUser = JSON.parse(cachedUserData);
              setUser(parsedUser);
              setFormData({
                username: parsedUser.username || '',
                email: parsedUser.email || '',
                name: parsedUser.name || '',
              });
            } catch (parseErr) {
              console.error('Error parsing cached user data:', parseErr);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // TODO: Call API to update user profile
      // For now, just update localStorage
      const updatedUser = {
        ...user,
        ...formData,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      name: user?.name || '',
    });
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Account">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground mt-4">Loading profile...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Profile" subtitle="Account">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
              {error ? (
                <>
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="hero" size="default">
                    Retry
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No user data available</p>
              )}
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" subtitle="Account">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <p className="text-sm text-foreground">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                {user.picture || user.image_url ? (
                  <img
                    src={user.picture || user.image_url}
                    alt={user.username || user.name || 'Profile'}
                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-4 border-border">
                    <span className="text-3xl font-semibold text-primary-foreground">
                      {(user.username || user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <button
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    title="Change photo"
                    type="button"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {user.name || user.username || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                {user.username && (
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                )}
                {user.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="hero" size="default">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="hero-outline" size="default">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} variant="hero" size="default">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter username"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-secondary/50 rounded-lg text-foreground border border-border">
                    {user.username || 'Not set'}
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter full name"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-secondary/50 rounded-lg text-foreground border border-border">
                    {user.name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-secondary/50 rounded-lg text-foreground border border-border">
                    {user.email}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Email is used for account verification and important notifications.
                </p>
              </div>

              {/* Account Created Date */}
              {user.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Account Created</label>
                  <div className="px-4 py-2.5 bg-secondary/50 rounded-lg text-foreground border border-border">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password</h4>
                  <p className="text-xs text-gray-500 mt-1">Last changed: Never</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  Change Password
                </button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-500 mt-1">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Active Sessions</h4>
                  <p className="text-xs text-gray-500 mt-1">Manage your active sessions</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Profile;
