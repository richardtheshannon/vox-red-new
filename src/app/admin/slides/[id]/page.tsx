'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import SlideManager from '@/components/admin/slides/SlideManager';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Slide } from '@/lib/queries/slides';

interface SlideRow {
  id: string;
  title: string;
  description: string;
  row_type: string;
  slide_count: number;
  is_published: boolean;
  icon_set: string[];
  theme_color: string;
}

export default function ManageSlidesPage() {
  const router = useRouter();
  const params = useParams();
  const rowId = params.id as string;

  const [row, setRow] = useState<SlideRow | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const fetchRowData = async () => {
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

      // Fetch slides for this row
      const slidesResponse = await fetch(`/api/slides/rows/${rowId}/slides`);
      if (!slidesResponse.ok) {
        throw new Error('Failed to fetch slides');
      }
      const slidesData = await slidesResponse.json();
      setSlides(slidesData.slides || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rowId) {
      fetchRowData();
    }
  }, [rowId]);

  const handleDeleteSlide = async (slideId: string) => {
    try {
      const response = await fetch(`/api/slides/rows/${rowId}/slides/${slideId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide');
      }

      await fetchRowData();
    } catch (err) {
      console.error('Error deleting slide:', err);
      alert('Failed to delete slide. Please try again.');
    }
  };

  const handleReorderSlides = async (reorderedSlides: Slide[]) => {
    try {
      const slideIds = reorderedSlides.map(s => s.id);

      const response = await fetch(`/api/slides/rows/${rowId}/slides/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slide_ids: slideIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder slides');
      }

      await fetchRowData();
    } catch (err) {
      console.error('Error reordering slides:', err);
      alert('Failed to reorder slides. Please try again.');
    }
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
          <div className="h-full flex">
            {/* Left Sidebar */}
            <AdminLeftIconBar />

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
                  <span style={{ color: 'var(--text-color)' }}>
                    {row ? row.title : 'Loading...'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Manage Slides: {row ? row.title : ''}
                </h1>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-color)' }}>Loading slides...</p>
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
                  <p className="font-semibold">Error loading slides</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={fetchRowData}
                    className="mt-2 px-4 py-2 rounded text-sm"
                    style={{
                      backgroundColor: '#991b1b',
                      color: 'white'
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Slide Manager */}
              {!loading && !error && row && (
                <SlideManager
                  row={row}
                  slides={slides}
                  onDeleteSlide={handleDeleteSlide}
                  onReorderSlides={handleReorderSlides}
                  onRefresh={fetchRowData}
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
    </ThemeProvider>
  );
}
