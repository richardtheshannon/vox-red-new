'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useEffect } from 'react'
import { storeOfflineAuthData } from '@/lib/offlineAuth'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OfflineAuthCacheHandler>
        <ThemeProvider>{children}</ThemeProvider>
      </OfflineAuthCacheHandler>
    </SessionProvider>
  )
}

// Component to handle offline auth caching after successful login
function OfflineAuthCacheHandler({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Check if there's a pending offline cache request
    const pendingCacheStr = sessionStorage.getItem('pending-offline-cache');

    if (pendingCacheStr && session?.user) {
      try {
        const { email, password } = JSON.parse(pendingCacheStr);

        // Store offline auth data
        storeOfflineAuthData(
          session.user.id,
          session.user.name || 'User',
          email,
          session.user.role || 'user',
          password
        ).then(() => {
          console.log('[Providers] Offline auth data cached successfully');
          // Clear pending cache
          sessionStorage.removeItem('pending-offline-cache');
        }).catch((err) => {
          console.error('[Providers] Failed to cache offline auth data:', err);
          // Clear pending cache even on error to prevent retry loops
          sessionStorage.removeItem('pending-offline-cache');
        });
      } catch (err) {
        console.error('[Providers] Error processing pending offline cache:', err);
        sessionStorage.removeItem('pending-offline-cache');
      }
    }
  }, [session]);

  return <>{children}</>;
}
