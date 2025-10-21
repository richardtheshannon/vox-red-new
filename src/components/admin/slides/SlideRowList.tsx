'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SlideRow {
  id: string;
  title: string;
  description: string;
  row_type: string;
  slide_count: number;
  is_published: boolean;
  icon_set: string[];
  theme_color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface SlideRowListProps {
  rows: SlideRow[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onImportClick: () => void;
  onReorderRows: (rows: SlideRow[]) => void;
}

export default function SlideRowList({ rows, onDelete, onRefresh, onImportClick, onReorderRows }: SlideRowListProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'order' | 'created' | 'title' | 'slides'>('order');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [localRows, setLocalRows] = useState<SlideRow[]>(rows);

  // Update local rows when prop changes
  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  // Filter rows by type
  const filteredRows = localRows.filter((row) => {
    if (filter === 'ALL') return true;
    return row.row_type === filter;
  });

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    switch (sortBy) {
      case 'order':
        return a.display_order - b.display_order;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'slides':
        return b.slide_count - a.slide_count;
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return a.display_order - b.display_order;
    }
  });

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
    onRefresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Move row up (decrease display_order number)
  const handleMoveUp = async (rowId: string) => {
    const currentIndex = localRows.findIndex(r => r.id === rowId);
    if (currentIndex <= 0) return; // Already at top

    const newRows = [...localRows];
    // Swap with previous item
    [newRows[currentIndex - 1], newRows[currentIndex]] = [newRows[currentIndex], newRows[currentIndex - 1]];

    setLocalRows(newRows);
    onReorderRows(newRows);

    // Call API to persist reorder
    try {
      const response = await fetch('/api/slides/rows/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          row_ids: newRows.map(r => r.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder rows');
      }
    } catch (err) {
      console.error('Error reordering rows:', err);
      // Revert on error
      setLocalRows(rows);
      alert('Failed to reorder rows. Please try again.');
    }
  };

  // Move row down (increase display_order number)
  const handleMoveDown = async (rowId: string) => {
    const currentIndex = localRows.findIndex(r => r.id === rowId);
    if (currentIndex >= localRows.length - 1) return; // Already at bottom

    const newRows = [...localRows];
    // Swap with next item
    [newRows[currentIndex], newRows[currentIndex + 1]] = [newRows[currentIndex + 1], newRows[currentIndex]];

    setLocalRows(newRows);
    onReorderRows(newRows);

    // Call API to persist reorder
    try {
      const response = await fetch('/api/slides/rows/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          row_ids: newRows.map(r => r.id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder rows');
      }
    } catch (err) {
      console.error('Error reordering rows:', err);
      // Revert on error
      setLocalRows(rows);
      alert('Failed to reorder rows. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3">
          <Link
            href="/admin/slides/new"
            className="px-4 py-2 rounded transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#dc2626',
              color: 'white'
            }}
          >
            + Create New Slide Row
          </Link>
          <button
            onClick={onImportClick}
            className="px-4 py-2 rounded transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#16a34a',
              color: 'white'
            }}
          >
            Import Course
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="ALL">All Types</option>
            <option value="ROUTINE">Routines</option>
            <option value="COURSE">Courses</option>
            <option value="TEACHING">Teachings</option>
            <option value="CUSTOM">Custom</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'order' | 'created' | 'title' | 'slides')}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="order">Sort by Display Order</option>
            <option value="created">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="slides">Sort by Slide Count</option>
          </select>
        </div>
      </div>

      {/* Row Count */}
      <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
        {sortBy === 'order'
          ? `Showing ${sortedRows.length} of ${localRows.length} slide rows • Use chevron buttons to reorder`
          : `Showing ${sortedRows.length} of ${localRows.length} slide rows • Switch to "Display Order" to reorder`
        }
      </p>

      {/* Slide Row Cards */}
      <div className="space-y-4">
        {sortedRows.length === 0 ? (
          <div
            className="p-8 rounded text-center"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)'
            }}
          >
            <p style={{ color: 'var(--secondary-text)' }}>
              {filter === 'ALL'
                ? 'No slide rows found. Create your first slide row to get started!'
                : `No ${filter.toLowerCase()} slide rows found.`
              }
            </p>
          </div>
        ) : (
          sortedRows.map((row, index) => (
            <div
              key={row.id}
              className="p-4 rounded"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Condensed Header with Title and Buttons */}
              <div className="flex justify-between items-center gap-4 mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Reorder Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveUp(row.id)}
                      disabled={index === 0}
                      className="transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Move up"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--icon-color)' }}>
                        expand_less
                      </span>
                    </button>
                    <button
                      onClick={() => handleMoveDown(row.id)}
                      disabled={index === sortedRows.length - 1}
                      className="transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Move down"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--icon-color)' }}>
                        expand_more
                      </span>
                    </button>
                  </div>

                  {/* Badges */}
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded flex-shrink-0"
                    style={{
                      backgroundColor: row.theme_color || '#dc2626',
                      color: 'white'
                    }}
                  >
                    {row.row_type}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded flex-shrink-0"
                    style={{
                      backgroundColor: row.is_published ? '#16a34a' : '#64748b',
                      color: 'white'
                    }}
                  >
                    {row.is_published ? 'Published' : 'Draft'}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text-color)' }}>
                    {row.title}
                  </h3>

                  {/* Icons */}
                  {row.icon_set && row.icon_set.length > 0 && (
                    <div className="flex gap-1 flex-shrink-0">
                      {row.icon_set.slice(0, 3).map((icon, idx) => (
                        <span
                          key={idx}
                          className="material-symbols-rounded"
                          style={{ fontSize: '20px', color: 'var(--icon-color)' }}
                        >
                          {icon}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/slides/${row.id}/edit`}
                    className="px-3 py-1.5 rounded text-sm transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    Edit Row
                  </Link>
                  <Link
                    href={`/admin/slides/${row.id}`}
                    className="px-3 py-1.5 rounded text-sm transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white'
                    }}
                  >
                    Manage Slides
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(row.id)}
                    className="px-3 py-1.5 rounded text-sm transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: '#991b1b',
                      color: 'white'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Description and Metadata */}
              <div className="flex items-center justify-between gap-4 text-sm">
                {row.description ? (
                  <p className="flex-1 truncate" style={{ color: 'var(--secondary-text)' }}>
                    {row.description}
                  </p>
                ) : (
                  <div className="flex-1"></div>
                )}
                <div className="flex items-center gap-3 flex-shrink-0" style={{ color: 'var(--secondary-text)' }}>
                  <span>{row.slide_count} slides</span>
                  <span>•</span>
                  <span>Created {formatDate(row.created_at)}</span>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {deleteConfirm === row.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div
                    className="p-6 rounded max-w-md w-full mx-4"
                    style={{
                      backgroundColor: 'var(--bg-color)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
                      Delete Slide Row?
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-color)' }}>
                      Are you sure you want to delete &ldquo;{row.title}&rdquo;? This will also delete all {row.slide_count} slides in this row. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 rounded transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          color: 'var(--text-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-4 py-2 rounded transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: '#991b1b',
                          color: 'white'
                        }}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
