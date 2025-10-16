'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import SlideRowForm, { SlideRowFormData } from '@/components/admin/slides/SlideRowForm';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function NewSlideRowPage() {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: SlideRowFormData) => {
    try {
      setError(null);
      const response = await fetch('/api/slides/rows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create slide row');
      }

      const data = await response.json();

      // Redirect to manage slides page for the newly created row
      router.push(`/admin/slides/${data.row.id}`);
    } catch (err) {
      console.error('Error creating slide row:', err);
      setError(err instanceof Error ? err.message : 'Failed to create slide row');
    }
  };

  const handleCancel = () => {
    router.push('/admin/slides');
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        {/* Header */}
        <AdminTopIconBar />

        {/* Main Content Area */}
        <div className="absolute inset-0" style={{ padding: '50px' }}>
          <div className="h-full flex gap-4">
            {/* Left Sidebar */}
            <AdminLeftIconBar />

            {/* Quick Actions Column */}
            <div style={{ width: '12.5%', minWidth: '150px', maxWidth: '200px' }} className="flex-shrink-0">
              <AdminQuickActions />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--secondary-text)' }}>
                  <span
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => router.push('/admin')}
                  >
                    Admin Dashboard
                  </span>
                  <span>&gt;</span>
                  <span
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => router.push('/admin/slides')}
                  >
                    Slide Management
                  </span>
                  <span>&gt;</span>
                  <span style={{ color: 'var(--text-color)' }}>Create New Slide Row</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Create New Slide Row
                </h1>
              </div>

              {/* Error Display */}
              {error && (
                <div
                  className="p-4 rounded mb-6"
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5'
                  }}
                >
                  <p className="font-semibold">Error creating slide row</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <div
                className="p-6 rounded max-w-3xl"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <SlideRowForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEdit={false}
                />
              </div>
            </main>

            {/* Right Sidebar */}
            <AdminRightIconBar isExpanded={sidebarExpanded} />
          </div>
        </div>

        {/* Footer */}
        <AdminBottomIconBar onMenuClick={toggleSidebar} />
      </div>
    </ThemeProvider>
  );
}
