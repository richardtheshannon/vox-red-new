'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import SlideRowList from '@/components/admin/slides/SlideRowList';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface SlideRow {
  id: string;
  title: string;
  description: string;
  row_type: string;
  slide_count: number;
  is_published: boolean;
  icon_set: string[];
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSlidesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/slides/rows');

      if (!response.ok) {
        throw new Error('Failed to fetch slide rows');
      }

      const data = await response.json();
      setRows(data.rows || []);
    } catch (err) {
      console.error('Error fetching slide rows:', err);
      setError(err instanceof Error ? err.message : 'Failed to load slide rows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/slides/rows/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide row');
      }

      await fetchRows();
    } catch (err) {
      console.error('Error deleting slide row:', err);
      alert('Failed to delete slide row. Please try again.');
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
                  <span style={{ color: 'var(--text-color)' }}>Slide Management</span>
                </div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Slide Management
                </h1>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-color)' }}>Loading slide rows...</p>
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
                  <p className="font-semibold">Error loading slide rows</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={fetchRows}
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

              {/* Slide Row List */}
              {!loading && !error && (
                <SlideRowList
                  rows={rows}
                  onDelete={handleDelete}
                  onRefresh={fetchRows}
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
