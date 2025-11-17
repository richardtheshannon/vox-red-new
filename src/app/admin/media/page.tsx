'use client';

import { useState } from 'react';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';

export default function AdminMediaPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div data-admin-page="true">
        <AdminTopIconBar />
        <AdminLeftIconBar />
        <AdminRightIconBar isExpanded={sidebarExpanded} />
        <AdminBottomIconBar onMenuClick={toggleSidebar} />

        {/* Main Content Area with 50px padding for icon borders */}
        <main style={{
          position: 'fixed',
          top: '50px',
          left: '50px',
          right: '50px',
          bottom: '50px',
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'var(--bg-color)',
          overflow: 'hidden'
        }}>
          {/* Quick Actions Sidebar */}
          <AdminQuickActions />

          {/* Iframe Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <iframe
              src="https://media.lilde.com"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Media Management"
            />
        </div>
      </main>
    </div>
  );
}
