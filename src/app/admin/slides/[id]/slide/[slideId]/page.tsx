'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import SlideEditor from '@/components/admin/slides/SlideEditor';
import { Slide } from '@/lib/queries/slides';

interface SlideRow {
  id: string;
  title: string;
  row_type: string;
}

export default function EditSlidePage() {
  const router = useRouter();
  const params = useParams();
  const rowId = params.id as string;
  const slideId = params.slideId as string;
  const isNewSlide = slideId === 'new';

  const [row, setRow] = useState<SlideRow | null>(null);
  const [slide, setSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch row metadata
        const rowResponse = await fetch(`/api/slides/rows/${rowId}`);
        if (!rowResponse.ok) {
          throw new Error('Failed to fetch slide row');
        }
        const rowData = await rowResponse.json();
        setRow(rowData.row);

        // Fetch slide data if editing existing slide
        if (!isNewSlide) {
          const slideResponse = await fetch(`/api/slides/rows/${rowId}/slides/${slideId}`);
          if (!slideResponse.ok) {
            throw new Error('Failed to fetch slide');
          }
          const slideData = await slideResponse.json();
          setSlide(slideData.slide);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (rowId) {
      fetchData();
    }
  }, [rowId, slideId, isNewSlide]);

  const handleSave = async (slideData: Partial<Slide>) => {
    try {
      const url = isNewSlide
        ? `/api/slides/rows/${rowId}/slides`
        : `/api/slides/rows/${rowId}/slides/${slideId}`;

      const method = isNewSlide ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slideData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save slide');
      }

      // Redirect back to slide manager
      router.push(`/admin/slides/${rowId}`);
    } catch (err) {
      console.error('Error saving slide:', err);
      throw err;
    }
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
            <main className="flex-1 p-8 pb-[50px]">
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
                  <span
                    className="cursor-pointer hover:opacity-70"
                    onClick={() => router.push(`/admin/slides/${rowId}`)}
                  >
                    {row ? row.title : 'Loading...'}
                  </span>
                  <span>&gt;</span>
                  <span style={{ color: 'var(--text-color)' }}>
                    {isNewSlide ? 'New Slide' : slide ? `Edit: ${slide.title}` : 'Loading...'}
                  </span>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-color)' }}>Loading...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div
                  className="p-4 rounded mb-6"
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5'
                  }}
                >
                  <p className="font-semibold">Error loading slide</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Slide Editor */}
              {!loading && !error && row && (
                <SlideEditor
                  row={row}
                  slide={slide}
                  isNewSlide={isNewSlide}
                  onSave={handleSave}
                  onCancel={() => router.push(`/admin/slides/${rowId}`)}
                />
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
