'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // User details form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  // Password change form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        const user: User = data.user;

        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user');
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setError(data.message || 'Failed to update user');
        setSubmitting(false);
        return;
      }

      // Success
      setSuccessMessage('User updated successfully');
      setSubmitting(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Client-side validation
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSubmitting(true);

    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setPasswordError(data.message || 'Failed to change password');
        setPasswordSubmitting(false);
        return;
      }

      // Success - clear form
      setPasswordSuccess('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSubmitting(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('An unexpected error occurred');
      setPasswordSubmitting(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
          <AdminTopIconBar />
          <div className="absolute inset-0" style={{ padding: '50px' }}>
            <div className="h-full flex items-center justify-center">
              <p style={{ color: 'var(--text-color)' }}>Loading user...</p>
            </div>
          </div>
          <AdminBottomIconBar onMenuClick={toggleSidebar} />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        {/* Header */}
        <AdminTopIconBar />

        {/* Main Content Area */}
        <div className="absolute inset-0" style={{ padding: '50px' }}>
          <div className="h-full flex gap-4">
            {/* Left Sidebar */}
            <AdminLeftIconBar />

            {/* Quick Actions Column */}
            <div style={{ width: '12.5%', minWidth: '150px', maxWidth: '200px' }} className="flex-shrink-0">
              <AdminQuickActions />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--secondary-text)' }}>
                  <span
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => router.push('/admin')}
                  >
                    Admin Dashboard
                  </span>
                  <span>&gt;</span>
                  <span
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => router.push('/admin/users')}
                  >
                    User Management
                  </span>
                  <span>&gt;</span>
                  <span style={{ color: 'var(--text-color)' }}>Edit User</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Edit User
                </h1>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: User Details */}
                <div>
                  <div
                    className="p-8"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
                      User Details
                    </h2>

                    {/* Error Message */}
                    {error && (
                      <div
                        className="p-4 mb-6"
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fca5a5',
                        }}
                      >
                        <p className="text-sm font-semibold">{error}</p>
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div
                        className="p-4 mb-6"
                        style={{
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          border: '1px solid #6ee7b7',
                        }}
                      >
                        <p className="text-sm font-semibold">{successMessage}</p>
                      </div>
                    )}

                    <form onSubmit={handleUpdateUser} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                          Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter user's full name"
                          disabled={submitting}
                          className="w-full px-4 py-3"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            opacity: submitting ? 0.5 : 1,
                          }}
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          disabled={submitting}
                          className="w-full px-4 py-3"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            opacity: submitting ? 0.5 : 1,
                          }}
                          required
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                          This is the user's login email
                        </p>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                          Role *
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                          disabled={submitting}
                          className="w-full px-4 py-3"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            opacity: submitting ? 0.5 : 1,
                          }}
                          required
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                          Admin users have full access to the admin panel
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4">
                        <Link
                          href="/admin/users"
                          className="px-6 py-3 transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--card-bg)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            display: submitting ? 'none' : 'inline-block',
                          }}
                        >
                          Back to Users
                        </Link>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-3 font-semibold transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            opacity: submitting ? 0.5 : 1,
                          }}
                        >
                          {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Column: Change Password */}
                <div>
                  <div
                    className="p-8"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
                      Change Password
                    </h2>

                    {/* Password Error Message */}
                    {passwordError && (
                      <div
                        className="p-4 mb-6"
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fca5a5',
                        }}
                      >
                        <p className="text-sm font-semibold">{passwordError}</p>
                      </div>
                    )}

                    {/* Password Success Message */}
                    {passwordSuccess && (
                      <div
                        className="p-4 mb-6"
                        style={{
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          border: '1px solid #6ee7b7',
                        }}
                      >
                        <p className="text-sm font-semibold">{passwordSuccess}</p>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                          New Password *
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 characters)"
                          disabled={passwordSubmitting}
                          className="w-full px-4 py-3"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            opacity: passwordSubmitting ? 0.5 : 1,
                          }}
                          required
                          minLength={8}
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                          Minimum 8 characters
                        </p>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          disabled={passwordSubmitting}
                          className="w-full px-4 py-3"
                          style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            opacity: passwordSubmitting ? 0.5 : 1,
                          }}
                          required
                        />
                      </div>

                      {/* Change Password Button */}
                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={passwordSubmitting}
                          className="px-6 py-3 font-semibold transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            opacity: passwordSubmitting ? 0.5 : 1,
                          }}
                        >
                          {passwordSubmitting ? 'Changing Password...' : 'Change Password'}
                        </button>
                      </div>
                    </form>

                    {/* Info Box */}
                    <div
                      className="mt-6 p-4"
                      style={{
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>
                        <strong>Note:</strong> Changing the password will require the user to log in again with their new password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Right Sidebar */}
            <AdminRightIconBar isExpanded={sidebarExpanded} />
          </div>
        </div>

        {/* Footer */}
        <AdminBottomIconBar onMenuClick={toggleSidebar} />
      </div>
    </ThemeProvider>
  );
}
