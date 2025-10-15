'use client';

import { useEffect, useState } from 'react';
import { Slide } from '@/lib/queries/slides';

interface SlidePreviewProps {
  slide: Slide;
}

export default function SlidePreview({ slide }: SlidePreviewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLayoutClasses = () => {
    switch (slide.layout_type) {
      case 'OVERFLOW':
        return 'justify-start overflow-y-auto';
      case 'MINIMAL':
        return 'justify-center items-center';
      case 'STANDARD':
      default:
        return 'justify-center';
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Info */}
      <div
        className="p-3 rounded text-sm"
        style={{
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #93c5fd'
        }}
      >
        <p className="font-semibold">Preview Mode</p>
        <p className="text-xs">This shows how your slide will appear on the frontend</p>
      </div>

      {/* Desktop Preview */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
          Desktop View
        </p>
        <div
          className="rounded overflow-hidden"
          style={{
            backgroundColor: '#f3f4f6',
            border: '2px solid var(--border-color)',
            aspectRatio: '16/9'
          }}
        >
          <div
            className={`h-full p-8 flex flex-col ${getLayoutClasses()}`}
            style={{
              backgroundColor: 'white',
              backgroundImage: slide.image_url ? `url(${slide.image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Title */}
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: 'var(--font-title)',
                color: 'var(--text-color)'
              }}
            >
              {slide.title || 'Untitled Slide'}
            </h1>

            {/* Subtitle */}
            {slide.subtitle && (
              <p
                className="text-lg mb-4"
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--secondary-text)'
                }}
              >
                {slide.subtitle}
              </p>
            )}

            {/* Audio Player Placeholder */}
            {slide.audio_url && isClient && (
              <div
                className="mb-4 p-4 rounded"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--border-color)',
                  maxWidth: '400px'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--icon-color)' }}>
                    play_circle
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-1 rounded"
                      style={{ backgroundColor: 'var(--border-color)' }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--secondary-text)' }}>
                      Audio: {slide.audio_url.split('/').pop()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Body Content */}
            {slide.layout_type !== 'MINIMAL' && (
              <div
                className="prose prose-sm max-w-none"
                style={{
                  fontFamily: 'var(--font-paragraph)',
                  color: 'var(--text-color)'
                }}
                dangerouslySetInnerHTML={{ __html: slide.body_content || '<p>No content yet...</p>' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
          Mobile View
        </p>
        <div className="flex justify-center">
          <div
            className="rounded overflow-hidden"
            style={{
              backgroundColor: '#f3f4f6',
              border: '2px solid var(--border-color)',
              width: '320px',
              height: '568px'
            }}
          >
            <div
              className={`h-full p-6 flex flex-col ${getLayoutClasses()}`}
              style={{
                backgroundColor: 'white',
                backgroundImage: slide.image_url ? `url(${slide.image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Title */}
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--text-color)'
                }}
              >
                {slide.title || 'Untitled Slide'}
              </h1>

              {/* Subtitle */}
              {slide.subtitle && (
                <p
                  className="text-sm mb-3"
                  style={{
                    fontFamily: 'var(--font-title)',
                    color: 'var(--secondary-text)'
                  }}
                >
                  {slide.subtitle}
                </p>
              )}

              {/* Audio Player Placeholder */}
              {slide.audio_url && isClient && (
                <div
                  className="mb-3 p-3 rounded"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded" style={{ fontSize: '20px', color: 'var(--icon-color)' }}>
                      play_circle
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-1 rounded"
                        style={{ backgroundColor: 'var(--border-color)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Body Content */}
              {slide.layout_type !== 'MINIMAL' && (
                <div
                  className="prose prose-sm max-w-none text-sm"
                  style={{
                    fontFamily: 'var(--font-paragraph)',
                    color: 'var(--text-color)'
                  }}
                  dangerouslySetInnerHTML={{ __html: slide.body_content || '<p>No content yet...</p>' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Layout Info */}
      <div
        className="p-3 rounded text-sm"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)'
        }}
      >
        <p className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
          Layout: {slide.layout_type}
        </p>
        <p className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          {slide.layout_type === 'STANDARD' && 'Centered content with vertical alignment'}
          {slide.layout_type === 'OVERFLOW' && 'Scrollable content starting from top'}
          {slide.layout_type === 'MINIMAL' && 'Minimal layout with title and audio only'}
        </p>
      </div>
    </div>
  );
}
