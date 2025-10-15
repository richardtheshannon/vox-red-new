'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

function SortableSlideItem({ slide, rowId, onDelete }: { slide: Slide; rowId: string; onDelete: (id: string) => void }) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBodyPreview = (bodyContent: string) => {
    // Strip HTML tags and get first 100 characters
    const text = bodyContent.replace(/<[^>]*>/g, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="p-6 rounded mb-4"
        {...attributes}
        {...listeners}
      >
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Position Badge */}
          <div className="flex items-start gap-4">
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);

        // Update positions
        const updatedSlides = reordered.map((slide, index) => ({
          ...slide,
          position: index + 1,
        }));

        // Call API to save new order
        onReorderSlides(updatedSlides);

        return updatedSlides;
      });
    }
  };

  // Update local state when slides prop changes
  useState(() => {
    setLocalSlides(slides);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
            {row.slide_count} {row.slide_count === 1 ? 'slide' : 'slides'} in this row
          </p>
          <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
            Drag and drop slides to reorder them
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSlides.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {localSlides.map((slide) => (
              <SortableSlideItem
                key={slide.id}
                slide={slide}
                rowId={row.id}
                onDelete={onDeleteSlide}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
