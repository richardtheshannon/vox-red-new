'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check if setup is already complete
  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch('/api/setup')
        const data = await response.json()

        if (data.hasUsers) {
          // Users already exist, redirect to login
          router.push('/login')
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error checking setup status:', err)
        setError('Failed to check setup status')
        setLoading(false)
      }
    }

    checkSetup()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side validation
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email format')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      // Create admin user
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await response.json()

      if (data.status === 'error') {
        setError(data.message || 'Failed to create admin user')
        setSubmitting(false)
        return
      }

      // Auto-login after successful creation
      const signInResult = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('User created but login failed. Please login manually.')
        setSubmitting(false)
        router.push('/login')
        return
      }

      // Redirect to admin panel
      router.push('/admin')
    } catch (err) {
      console.error('Error during setup:', err)
      setError('An unexpected error occurred')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--text-color)' }}>
            Checking setup status...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
              Initial Setup
            </h1>
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              Create the first admin account to get started
            </p>
          </div>

          {/* Setup Form */}
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
                  placeholder="Enter your full name"
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
                />
                <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                  This will be your login email
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
                {submitting ? 'Creating Admin Account...' : 'Create Admin Account'}
              </button>
            </form>
          </div>

          {/* Footer Note */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--secondary-text)' }}>
          This setup page will only appear when no users exist in the system
        </p>
      </div>
    </div>
  )
}
