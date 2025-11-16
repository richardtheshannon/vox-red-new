import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'

/**
 * Get the current server-side session
 * Returns null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Require authentication for a page/route
 * Redirects to /login if not authenticated
 * Returns the session if authenticated
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session || !session.user) {
    redirect('/login')
  }

  return session
}

/**
 * Require admin role for a page/route
 * Redirects to /login if not authenticated
 * Redirects to / if not admin
 * Returns the session if authenticated and admin
 */
export async function requireAdmin() {
  const session = await requireAuth()

  // Handle both uppercase and lowercase admin roles for compatibility
  if (session.user.role?.toUpperCase() !== 'ADMIN') {
    redirect('/')
  }

  return session
}

/**
 * Check if user is authenticated (boolean)
 * Useful for conditional rendering
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.user
}

/**
 * Check if user is admin (boolean)
 * Useful for conditional rendering
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  // Handle both uppercase and lowercase admin roles for compatibility
  return session?.user?.role?.toUpperCase() === 'ADMIN'
}

/**
 * Get the current authenticated user's ID
 * Returns null if not authenticated
 * Useful for preventing self-deletion and self-demotion
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id || null
}
