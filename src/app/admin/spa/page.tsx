'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import SpaTrackList from '@/components/admin/spa/SpaTrackList';
import SpaTrackForm from '@/components/admin/spa/SpaTrackForm';
import { SpaTrack } from '@/lib/queries/spaTracks';

export default function AdminSpaPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [tracks, setTracks] = useState<SpaTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<SpaTrack | null>(null);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Load tracks on mount
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spa/tracks');
      const data = await response.json();

      if (data.status === 'success') {
        setTracks(data.data);
      } else {
        console.error('Failed to load spa tracks:', data.message);
      }
    } catch (error) {
      console.error('Error loading spa tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingTrack(null);
    setShowForm(true);
  };

  const handleEdit = (track: SpaTrack) => {
    setEditingTrack(track);
    setShowForm(true);
  };

  const handleSave = async (trackData: Partial<SpaTrack>) => {
    try {
      if (editingTrack) {
        // Update existing track
        const response = await fetch(`/api/spa/tracks/${editingTrack.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackData),
        });

        const data = await response.json();

        if (data.status === 'success') {
          setShowForm(false);
          setEditingTrack(null);
          await loadTracks();
        } else {
          throw new Error(data.message || 'Failed to update track');
        }
      } else {
        // Create new track
        const response = await fetch('/api/spa/tracks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackData),
        });

        const data = await response.json();

        if (data.status === 'success') {
          setShowForm(false);
          await loadTracks();
        } else {
          throw new Error(data.message || 'Failed to create track');
        }
      }
    } catch (error) {
      console.error('Error saving track:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTrack(null);
  };

  const handleDelete = async (trackId: string) => {
    try {
      const response = await fetch(`/api/spa/tracks/${trackId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.status === 'success') {
        await loadTracks();
      } else {
        console.error('Failed to delete track:', data.message);
        alert('Failed to delete track. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('An error occurred while deleting the track.');
    }
  };

  return (
    <ThemeProvider>
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

          {/* Main Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '1rem'
          }}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Spa Mode - Background Music
                </h1>
                {!showForm && (
                  <button
                    onClick={handleAddNew}
                    className="px-6 py-3 transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white'
                    }}
                  >
                    Add New Track
                  </button>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                Manage ambient background music tracks with dynamic scheduling and randomization
              </p>
            </div>

            {/* Content Area - Scrollable */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <div
                  className="p-8 text-center"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <p style={{ color: 'var(--text-color)' }}>Loading spa tracks...</p>
                </div>
              ) : showForm ? (
                <SpaTrackForm
                  track={editingTrack}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <SpaTrackList
                  tracks={tracks}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
