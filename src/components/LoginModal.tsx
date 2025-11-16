'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
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
      // Attempt login with NextAuth
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setSubmitting(false);
        return;
      }

      if (result?.ok) {
        // Successful login - close modal and stay on frontend
        setEmail('');
        setPassword('');
        setError(null);
        setSubmitting(false);
        onClose();
      } else {
        setError('Login failed. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setEmail('');
      setPassword('');
      setError(null);
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
          maxHeight: '90vh',
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
          <h2 className="text-2xl font-bold">Sign In</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              Sign in to your account
            </p>

            {/* Error Message */}
            {error && (
              <div
                className="p-4"
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                }}
              >
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={submitting}
                className="w-full px-4 py-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  opacity: submitting ? 0.5 : 1,
                }}
                required
                autoFocus
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={submitting}
                className="w-full px-4 py-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  opacity: submitting ? 0.5 : 1,
                }}
                required
              />
            </div>
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
              type="submit"
              disabled={submitting}
              className="px-6 py-2 font-semibold transition-opacity hover:opacity-80"
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
