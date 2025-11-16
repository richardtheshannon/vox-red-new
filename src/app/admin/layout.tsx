'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // Not authenticated - redirect to login
      router.push('/login');
      return;
    }

    // Debug: Log the actual role value
    console.log('[AdminAuthGuard] User role:', session.user.role, 'Type:', typeof session.user.role);

    // Case-insensitive role check to handle both 'admin' and 'ADMIN'
    if (session.user.role?.toLowerCase() !== 'admin') {
      // Authenticated but not admin - redirect to home
      console.log('[AdminAuthGuard] Redirecting to home - role is not admin');
      router.push('/');
      return;
    }

    console.log('[AdminAuthGuard] Access granted - user is admin');
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <p style={{ color: 'var(--text-color)' }}>Loading...</p>
      </div>
    );
  }

  // Show nothing if redirecting (not authenticated or not admin)
  if (!session || session.user.role?.toLowerCase() !== 'admin') {
    return null;
  }

  // Authenticated and admin - render children
  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </SessionProvider>
  );
}
