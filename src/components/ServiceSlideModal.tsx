'use client';

import { useState } from 'react';

interface ServiceSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceSlideModal({ isOpen, onClose, onSuccess }: ServiceSlideModalProps) {
  const [title, setTitle] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !bodyContent.trim()) {
      setError('Both title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/slides/service-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body_content: bodyContent.trim(),
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Show success message
        setShowSuccess(true);
        // Reset form
        setTitle('');
        setBodyContent('');
        // Wait 500ms for user feedback, then reload
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setError(data.message || 'Failed to create service slide');
      }
    } catch (err) {
      console.error('Error creating service slide:', err);
      setError('Failed to create service slide. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setBodyContent('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-6 border-b"
          style={{
            borderBottomColor: 'var(--border-color)',
          }}
        >
          <h2 className="text-2xl font-bold">Create Service Slide</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="material-symbols-outlined text-3xl hover:opacity-70 transition-opacity"
            style={{
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            close
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your slide title..."
                className="w-full px-4 py-3 text-xl font-bold border-2 transition-colors"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                }}
              />
            </div>

            {/* Body Content Textarea */}
            <div>
              <label htmlFor="body" className="block text-sm font-semibold mb-2">
                Content
              </label>
              <textarea
                id="body"
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your slide content..."
                rows={10}
                className="w-full px-4 py-3 border-2 transition-colors resize-none"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                }}
              />
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div
                className="p-4"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  border: '1px solid #22c55e',
                }}
              >
                Service slide created successfully! Refreshing...
              </div>
            )}

            {/* Error Message */}
            {error && !showSuccess && (
              <div
                className="p-4"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div
            className="flex justify-end gap-3 p-6 border-t"
            style={{
              borderTopColor: 'var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 font-semibold transition-colors"
              style={{
                backgroundColor: isSubmitting ? 'var(--card-bg)' : 'var(--secondary-text)',
                color: 'var(--text-color)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Service Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
