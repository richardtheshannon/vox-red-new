'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';

export default function NewUserPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        setError(data.message || 'Failed to create user');
        setSubmitting(false);
        return;
      }

      // Success - redirect to user list
      router.push('/admin/users');
    } catch (err) {
      console.error('Error creating user:', err);
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
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
                  <span style={{ color: 'var(--text-color)' }}>New User</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Create New User
                </h1>
              </div>

              {/* Form Container */}
              <div className="max-w-2xl">
                <div
                  className="p-8"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                  }}
                >
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

                  <form onSubmit={handleSubmit} className="space-y-6">
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
                        This will be the user&apos;s login email
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                        Password *
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        disabled={submitting}
                        className="w-full px-4 py-3"
                        style={{
                          backgroundColor: 'var(--bg-color)',
                          color: 'var(--text-color)',
                          border: '1px solid var(--border-color)',
                          opacity: submitting ? 0.5 : 1,
                        }}
                        required
                        minLength={8}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                        Minimum 8 characters
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
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
                        Cancel
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
                        {submitting ? 'Creating User...' : 'Create User'}
                      </button>
                    </div>
                  </form>
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
  );
}
