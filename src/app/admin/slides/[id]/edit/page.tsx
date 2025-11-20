'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import SlideRowForm, { SlideRowFormData } from '@/components/admin/slides/SlideRowForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSlideRowPage({ params }: PageProps) {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rowId, setRowId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<{
    id?: string;
    title: string;
    description: string;
    row_type: string;
    icon_set: string[];
    theme_color: string;
    display_order: number;
    is_published: boolean;
    row_background_image_url?: string | null;
    row_layout_type?: 'STANDARD' | 'OVERFLOW' | 'MINIMAL' | null;
  } | null>(null);

  useEffect(() => {
    const fetchRowData = async () => {
      try {
        const resolvedParams = await params;
        setRowId(resolvedParams.id);

        const response = await fetch(`/api/slides/rows/${resolvedParams.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch slide row');
        }

        const data = await response.json();
        setInitialData(data.row);
      } catch (err) {
        console.error('Error fetching row:', err);
        setError(err instanceof Error ? err.message : 'Failed to load slide row');
      } finally {
        setLoading(false);
      }
    };

    fetchRowData();
  }, [params]);

  const handleSubmit = async (formData: SlideRowFormData) => {
    if (!rowId) return;

    try {
      setError(null);

      // Don't send row_type for QUICKSLIDE rows (it's system-managed and read-only)
      const submitData = formData.row_type === 'QUICKSLIDE'
        ? { ...formData, row_type: undefined }
        : formData;

      const response = await fetch(`/api/slides/rows/${rowId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update slide row');
      }

      // Redirect back to slide management list
      router.push('/admin/slides');
    } catch (err) {
      console.error('Error updating slide row:', err);
      setError(err instanceof Error ? err.message : 'Failed to update slide row');
    }
  };

  const handleCancel = () => {
    router.push('/admin/slides');
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
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
                  <span style={{ color: 'var(--text-color)' }}>Edit Slide Row</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Edit Slide Row
                </h1>
              </div>

              {/* Loading State */}
              {loading && (
                <div
                  className="p-8 rounded text-center"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <p style={{ color: 'var(--text-color)' }}>Loading slide row...</p>
                </div>
              )}

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
                  <p className="font-semibold">Error loading slide row</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              {!loading && initialData && (
                <div
                  className="p-6 rounded max-w-3xl"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <SlideRowForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isEdit={true}
                  />
                </div>
              )}
            </main>

            {/* Right Sidebar */}
            <AdminRightIconBar isExpanded={sidebarExpanded} />
          </div>
        </div>

      {/* Footer */}
      <AdminBottomIconBar onMenuClick={toggleSidebar} />
    </div>
  );
}
