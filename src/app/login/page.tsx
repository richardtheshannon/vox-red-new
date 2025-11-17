import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  // Check if user is already authenticated
  const session = await getSession()

  if (session?.user) {
    // Already logged in - redirect to admin
    redirect('/admin')
  }

  // Not logged in - show login form
  return <LoginForm />
}
