'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email format')
      return
    }

    setSubmitting(true)

    try {
      // Attempt login with NextAuth
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setSubmitting(false)
        return
      }

      if (result?.ok) {
        // Successful login, redirect to admin panel
        router.push('/admin')
      } else {
        setError('Login failed. Please try again.')
        setSubmitting(false)
      }
    } catch (err) {
      console.error('Error during login:', err)
      setError('An unexpected error occurred')
      setSubmitting(false)
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              Sign In
            </h1>
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Login Form */}
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
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={submitting}
                  className="w-full px-4 py-3"
                  style={{
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--border-color)',
                    opacity: submitting ? 0.5 : 1,
                  }}
                  required
                  autoFocus
                />
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
                  placeholder="Enter your password"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 font-semibold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  opacity: submitting ? 0.5 : 1,
                }}
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs mt-6" style={{ color: 'var(--secondary-text)' }}>
            This page requires authentication to access the admin panel
          </p>
        </div>
      </div>
    </ThemeProvider>
  )
}
