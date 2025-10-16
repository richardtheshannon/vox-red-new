'use client';

import { useState } from 'react';
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
  created_at: string;
  updated_at: string;
}

interface SlideRowListProps {
  rows: SlideRow[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
  onImportClick: () => void;
}

export default function SlideRowList({ rows, onDelete, onRefresh, onImportClick }: SlideRowListProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'created' | 'title' | 'slides'>('created');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter rows by type
  const filteredRows = rows.filter((row) => {
    if (filter === 'ALL') return true;
    return row.row_type === filter;
  });

  // Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'slides':
        return b.slide_count - a.slide_count;
      case 'created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
            onChange={(e) => setSortBy(e.target.value as 'created' | 'title' | 'slides')}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'
            }}
          >
            <option value="created">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="slides">Sort by Slide Count</option>
          </select>
        </div>
      </div>

      {/* Row Count */}
      <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
        Showing {sortedRows.length} of {rows.length} slide rows
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
          sortedRows.map((row) => (
            <div
              key={row.id}
              className="p-6 rounded"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: row.theme_color || '#dc2626',
                        color: 'white'
                      }}
                    >
                      {row.row_type}
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: row.is_published ? '#16a34a' : '#64748b',
                        color: 'white'
                      }}
                    >
                      {row.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    {row.title}
                  </h3>
                  {row.description && (
                    <p className="text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
                      {row.description}
                    </p>
                  )}
                </div>

                {/* Icons */}
                {row.icon_set && row.icon_set.length > 0 && (
                  <div className="flex gap-2 ml-4">
                    {row.icon_set.map((icon, idx) => (
                      <span
                        key={idx}
                        className="material-symbols-rounded"
                        style={{ fontSize: '24px', color: 'var(--icon-color)' }}
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: 'var(--secondary-text)' }}>
                <span>{row.slide_count} slides</span>
                <span>•</span>
                <span>Created {formatDate(row.created_at)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/slides/${row.id}/edit`}
                  className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
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
                  className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white'
                  }}
                >
                  Manage Slides
                </Link>
                <button
                  onClick={() => setDeleteConfirm(row.id)}
                  className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#991b1b',
                    color: 'white'
                  }}
                >
                  Delete
                </button>
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
