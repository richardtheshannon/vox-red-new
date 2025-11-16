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

// Helper function to format time from "HH:MM:SS" to "H:MM AM/PM"
function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

// Helper function to get day names from day numbers [0-6]
function getDayNames(dayNumbers: number[]): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // If all 7 days are selected, show "All Days"
  if (dayNumbers.length === 7) {
    return 'All Days';
  }

  // If weekdays only (1-5), show "Weekdays"
  const isWeekdays = dayNumbers.length === 5 &&
    dayNumbers.includes(1) && dayNumbers.includes(2) &&
    dayNumbers.includes(3) && dayNumbers.includes(4) &&
    dayNumbers.includes(5);
  if (isWeekdays) {
    return 'Weekdays';
  }

  // If weekend only (0, 6), show "Weekend"
  const isWeekend = dayNumbers.length === 2 &&
    dayNumbers.includes(0) && dayNumbers.includes(6);
  if (isWeekend) {
    return 'Weekend';
  }

  // Otherwise, show individual day names
  return dayNumbers.sort((a, b) => a - b).map(num => dayNames[num] || '?').join(', ');
}

// Helper function to format complete schedule string
function formatSchedule(slide: Slide): string {
  const publishDays = slide.publish_days ? JSON.parse(slide.publish_days) : [];
  const hasSchedule = slide.publish_time_start || slide.publish_time_end || publishDays.length > 0;

  if (!hasSchedule) return '';

  const parts: string[] = [];

  // Add day names if present
  if (publishDays.length > 0) {
    parts.push(getDayNames(publishDays));
  }

  // Add time range if present
  if (slide.publish_time_start || slide.publish_time_end) {
    const startTime = formatTime(slide.publish_time_start);
    const endTime = formatTime(slide.publish_time_end);

    if (startTime && endTime) {
      parts.push(`${startTime} - ${endTime}`);
    } else if (startTime) {
      parts.push(`from ${startTime}`);
    } else if (endTime) {
      parts.push(`until ${endTime}`);
    }
  }

  return parts.length > 0 ? parts.join(' - ') : '';
}

function SlideItem({
  slide,
  rowId,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isSelected,
  onToggleSelect,
}: {
  slide: Slide;
  rowId: string;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const getBodyPreview = (bodyContent: string | undefined) => {
    if (!bodyContent) return 'No content';
    // Strip HTML tags and get first 100 characters
    const text = bodyContent.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <>
      <div className="mb-3">
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '1rem',
          }}
        >
          {/* Condensed Header with Controls, Title, and Buttons */}
          <div className="flex items-center gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(slide.id)}
              className="flex-shrink-0 w-5 h-5 cursor-pointer"
              style={{ accentColor: '#dc2626' }}
            />

            {/* Reorder Buttons */}
            <div className="flex-shrink-0 flex flex-col gap-1">
              <button
                onClick={() => onMoveUp(slide.id)}
                disabled={isFirst}
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
                onClick={() => onMoveDown(slide.id)}
                disabled={isLast}
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

            {/* Position Badge */}
            <div
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: '#dc2626',
                color: 'white'
              }}
            >
              {slide.position}
            </div>

            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold truncate" style={{ color: 'var(--text-color)' }}>
                  {slide.title}
                  {formatSchedule(slide) && (
                    <span style={{ color: 'var(--secondary-text)', fontWeight: 'normal' }}>
                      {' | '}{formatSchedule(slide)}
                    </span>
                  )}
                </h3>
                {!slide.is_published && (
                  <span
                    className="px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.2)',
                      color: '#dc2626',
                    }}
                  >
                    Unpublished
                  </span>
                )}
              </div>
              {slide.subtitle && (
                <p className="text-xs truncate" style={{ color: 'var(--secondary-text)' }}>
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/admin/slides/${rowId}/slide/${slide.id}`}
                className="px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
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
                className="px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#991b1b',
                  color: 'white'
                }}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Body Preview and Metadata Row */}
          <div className="flex items-center justify-between gap-4 mt-2 ml-11">
            <p className="text-sm flex-1 truncate" style={{ color: 'var(--secondary-text)' }}>
              {getBodyPreview(slide.body_content)}
            </p>
            <div className="flex items-center gap-3 text-xs flex-shrink-0" style={{ color: 'var(--secondary-text)' }}>
              {slide.audio_url && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>
                      audiotrack
                    </span>
                    {slide.audio_url.split('/').pop()?.substring(0, 15)}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>Views: {slide.view_count}</span>
              <span>•</span>
              <span>{slide.layout_type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="p-6 max-w-md w-full mx-4"
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
                className="px-4 py-2 transition-opacity hover:opacity-80"
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
                className="px-4 py-2 transition-opacity hover:opacity-80"
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
  const [selectedSlideIds, setSelectedSlideIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Update local slides when prop changes (e.g., after a delete or external update)
  useEffect(() => {
    setLocalSlides(slides);
    // Clear selections when slides refresh
    setSelectedSlideIds(new Set());
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

  // Toggle slide selection
  const handleToggleSelect = (slideId: string) => {
    setSelectedSlideIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slideId)) {
        newSet.delete(slideId);
      } else {
        newSet.add(slideId);
      }
      return newSet;
    });
  };

  // Select all slides
  const handleSelectAll = () => {
    if (selectedSlideIds.size === localSlides.length) {
      setSelectedSlideIds(new Set());
    } else {
      setSelectedSlideIds(new Set(localSlides.map((s) => s.id)));
    }
  };

  // Bulk publish/unpublish
  const handleBulkPublish = async (isPublished: boolean) => {
    if (selectedSlideIds.size === 0) return;

    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/slides/bulk-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slide_ids: Array.from(selectedSlideIds),
          is_published: isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update slides');
      }

      // Refresh to get updated data
      await onRefresh();
      setSelectedSlideIds(new Set());
    } catch (err) {
      console.error('Error updating slides:', err);
      alert('Failed to update slides. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Bulk Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
              {row.slide_count} {row.slide_count === 1 ? 'slide' : 'slides'} in this row
            </p>
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              Use checkboxes to select slides, chevron buttons to reorder
            </p>
          </div>

          <Link
            href={`/admin/slides/${row.id}/slide/new`}
            className="px-4 py-2 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#dc2626',
              color: 'white'
            }}
          >
            + Add New Slide
          </Link>
        </div>

        {/* Bulk Actions Bar */}
        {localSlides.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-3 p-4"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSlideIds.size === localSlides.length && localSlides.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: '#dc2626' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                Select All ({selectedSlideIds.size} of {localSlides.length} selected)
              </span>
            </div>

            {selectedSlideIds.size > 0 && (
              <>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />
                <button
                  onClick={() => handleBulkPublish(true)}
                  disabled={bulkActionLoading}
                  className="px-4 py-1.5 text-sm transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                  }}
                >
                  {bulkActionLoading ? 'Publishing...' : 'Publish Selected'}
                </button>
                <button
                  onClick={() => handleBulkPublish(false)}
                  disabled={bulkActionLoading}
                  className="px-4 py-1.5 text-sm transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                  }}
                >
                  {bulkActionLoading ? 'Unpublishing...' : 'Unpublish Selected'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Slide List */}
      {localSlides.length === 0 ? (
        <div
          className="p-8 text-center"
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
            className="inline-block px-4 py-2 transition-opacity hover:opacity-80"
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
              isSelected={selectedSlideIds.has(slide.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
