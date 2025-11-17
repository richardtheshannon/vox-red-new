'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

function UserItem({
  user,
  onDelete,
}: {
  user: User;
  onDelete: (id: string) => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="mb-3">
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '1rem',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>
                  {user.name}
                </h3>
                <span
                  className="px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: user.role === 'admin' ? '#dc2626' : '#16a34a',
                    color: 'white',
                  }}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                {user.email}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                Created: {formatDate(user.created_at)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/admin/users/${user.id}`}
                className="px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                }}
              >
                Edit
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(true);
                }}
                className="px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#991b1b',
                  color: 'white',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="p-6 max-w-md w-full mx-4"
            style={{
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
              Delete User?
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-color)' }}>
              Are you sure you want to delete &ldquo;{user.name}&rdquo; ({user.email})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(user.id);
                  setDeleteConfirm(false);
                }}
                className="px-4 py-2 transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#991b1b',
                  color: 'white',
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user. Please try again.');
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
                  <span style={{ color: 'var(--text-color)' }}>User Management</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  User Management
                </h1>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-color)' }}>Loading users...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div
                  className="p-4 mb-6"
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                  }}
                >
                  <p className="font-semibold">Error loading users</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={fetchUsers}
                    className="mt-2 px-4 py-2 text-sm"
                    style={{
                      backgroundColor: '#991b1b',
                      color: 'white',
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* User List */}
              {!loading && !error && (
                <div className="space-y-6">
                  {/* Header with Add Button */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                      {users.length} {users.length === 1 ? 'user' : 'users'} total
                    </p>
                    <Link
                      href="/admin/users/new"
                      className="px-4 py-2 transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                      }}
                    >
                      + Add New User
                    </Link>
                  </div>

                  {/* Users */}
                  {users.length === 0 ? (
                    <div
                      className="p-8 text-center"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <p className="mb-4" style={{ color: 'var(--secondary-text)' }}>
                        No users found. Create your first user to get started!
                      </p>
                      <Link
                        href="/admin/users/new"
                        className="inline-block px-4 py-2 transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                        }}
                      >
                        + Add First User
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {users.map((user) => (
                        <UserItem
                          key={user.id}
                          user={user}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
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
