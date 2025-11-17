'use client';

import { useState } from 'react';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminMainContent from '@/components/admin/AdminMainContent';

export default function AdminPage() {
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
      <AdminMainContent />
    </div>
  );
}