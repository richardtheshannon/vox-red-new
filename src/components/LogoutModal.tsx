'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { clearOfflineAuthData } from '@/lib/offlineAuth';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      // Clear offline auth data before signing out
      clearOfflineAuthData();
      console.log('[LogoutModal] Cleared offline auth data');

      await signOut({ callbackUrl: '/' });
    } catch (err) {
      console.error('Error during logout:', err);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md mx-4 shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-6 border-b"
          style={{
            borderBottomColor: 'var(--border-color)',
          }}
        >
          <h2 className="text-2xl font-bold">Sign Out</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="material-symbols-outlined text-3xl hover:opacity-70 transition-opacity"
            style={{
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            close
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-base" style={{ color: 'var(--text-color)' }}>
            Are you sure you want to sign out?
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{
            borderTopColor: 'var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-6 py-2 font-semibold transition-opacity hover:opacity-70"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="px-6 py-2 font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {submitting ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
