'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

interface SlideManagerProps {
  row: SlideRow;
  slides: Slide[];
  onDeleteSlide: (slideId: string) => void;
  onReorderSlides: (slides: Slide[]) => void;
  onRefresh: () => void;
}

function SlideItem({
  slide,
  rowId,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: {
  slide: Slide;
  rowId: string;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const getBodyPreview = (bodyContent: string) => {
    // Strip HTML tags and get first 100 characters
    const text = bodyContent.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <>
      <div className="mb-4">
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
          }}
        >
          {/* Position Badge and Reorder Controls */}
          <div className="flex items-start gap-4">
            {/* Reorder Buttons */}
            <div className="flex-shrink-0 flex flex-col gap-1">
              <button
                onClick={() => onMoveUp(slide.id)}
                disabled={isFirst}
                className="transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Move up"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--icon-color)' }}>
                  expand_less
                </span>
              </button>
              <button
                onClick={() => onMoveDown(slide.id)}
                disabled={isLast}
                className="transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Move down"
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--icon-color)' }}>
                  expand_more
                </span>
              </button>
            </div>

            {/* Position Badge */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: '#dc2626',
                color: 'white'
              }}
            >
              {slide.position}
            </div>

            <div className="flex-1">
              {/* Title and Subtitle */}
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                {slide.title}
              </h3>
              {slide.subtitle && (
                <p className="text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
                  {slide.subtitle}
                </p>
              )}

              {/* Body Preview */}
              <p className="text-sm mb-3" style={{ color: 'var(--secondary-text)' }}>
                {getBodyPreview(slide.body_content)}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: 'var(--secondary-text)' }}>
                {slide.audio_url && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>
                        audiotrack
                      </span>
                      {slide.audio_url.split('/').pop()}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>Views: {slide.view_count}</span>
                <span>•</span>
                <span>{slide.layout_type}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/slides/${rowId}/slide/${slide.id}`}
                  className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white'
                  }}
                >
                  Edit Slide
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(true);
                  }}
                  className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: '#991b1b',
                    color: 'white'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="p-6 rounded max-w-md w-full mx-4"
            style={{
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--border-color)'
            }}
          >
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
              Delete Slide?
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-color)' }}>
              Are you sure you want to delete &ldquo;{slide.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
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
                onClick={() => {
                  onDelete(slide.id);
                  setDeleteConfirm(false);
                }}
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
    </>
  );
}

export default function SlideManager({
  row,
  slides,
  onDeleteSlide,
  onReorderSlides,
  onRefresh,
}: SlideManagerProps) {
  const [localSlides, setLocalSlides] = useState<Slide[]>(slides);

  // Update local slides when prop changes (e.g., after a delete or external update)
  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  // Move slide up (decrease position number)
  const handleMoveUp = (slideId: string) => {
    const currentIndex = localSlides.findIndex(s => s.id === slideId);
    if (currentIndex <= 0) return; // Already at top

    const newSlides = [...localSlides];
    // Swap with previous item
    [newSlides[currentIndex - 1], newSlides[currentIndex]] = [newSlides[currentIndex], newSlides[currentIndex - 1]];

    // Update positions
    const updatedSlides = newSlides.map((slide, index) => ({
      ...slide,
      position: index + 1,
    }));

    setLocalSlides(updatedSlides);
    onReorderSlides(updatedSlides);
  };

  // Move slide down (increase position number)
  const handleMoveDown = (slideId: string) => {
    const currentIndex = localSlides.findIndex(s => s.id === slideId);
    if (currentIndex >= localSlides.length - 1) return; // Already at bottom

    const newSlides = [...localSlides];
    // Swap with next item
    [newSlides[currentIndex], newSlides[currentIndex + 1]] = [newSlides[currentIndex + 1], newSlides[currentIndex]];

    // Update positions
    const updatedSlides = newSlides.map((slide, index) => ({
      ...slide,
      position: index + 1,
    }));

    setLocalSlides(updatedSlides);
    onReorderSlides(updatedSlides);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
            {row.slide_count} {row.slide_count === 1 ? 'slide' : 'slides'} in this row
          </p>
          <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
            Use chevron buttons to reorder slides
          </p>
        </div>

        <Link
          href={`/admin/slides/${row.id}/slide/new`}
          className="px-4 py-2 rounded transition-opacity hover:opacity-80"
          style={{
            backgroundColor: '#dc2626',
            color: 'white'
          }}
        >
          + Add New Slide
        </Link>
      </div>

      {/* Slide List */}
      {localSlides.length === 0 ? (
        <div
          className="p-8 rounded text-center"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}
        >
          <p className="mb-4" style={{ color: 'var(--secondary-text)' }}>
            No slides in this row yet. Create your first slide to get started!
          </p>
          <Link
            href={`/admin/slides/${row.id}/slide/new`}
            className="inline-block px-4 py-2 rounded transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#dc2626',
              color: 'white'
            }}
          >
            + Add First Slide
          </Link>
        </div>
      ) : (
        <div>
          {localSlides.map((slide, index) => (
            <SlideItem
              key={slide.id}
              slide={slide}
              rowId={row.id}
              onDelete={onDeleteSlide}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={index === 0}
              isLast={index === localSlides.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
