'use client';

import { useEffect, useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import EssentialAudioPlayer from './EssentialAudioPlayer';
import { useSwiperContext } from '@/contexts/SwiperContext';
import { Slide } from '@/lib/queries/slides';

interface MainContentProps {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
  setActiveRow: (rowId: string) => void;
  setActiveSlideImageUrl: (imageUrl: string | null) => void;
  setActiveSlideVideoUrl: (videoUrl: string | null) => void;
}

// TypeScript interfaces for API data
interface SlideRow {
  id: string;
  title: string;
  description: string | null;
  row_type: string;
  is_published: boolean;
  display_order: number;
  slide_count: number;
  icon_set: string;
  theme_color: string | null;
  created_at: string;
  updated_at: string;
}

export default function MainContent({ setSwiperRef, handleSlideChange, setActiveRow, setActiveSlideImageUrl, setActiveSlideVideoUrl }: MainContentProps) {
  const [slideRows, setSlideRows] = useState<SlideRow[]>([]);
  const [slidesCache, setSlidesCache] = useState<Record<string, Slide[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get swiper context to register horizontal swipers
  const { setHorizontalSwiper } = useSwiperContext();

  // Memoize parsed icon sets to avoid repeated JSON parsing
  const iconSetsCache = useMemo(() => {
    const cache: Record<string, string[]> = {};
    slideRows.forEach(row => {
      try {
        const parsed = JSON.parse(row.icon_set || '[]');
        cache[row.id] = Array.isArray(parsed) ? parsed : [];
      } catch {
        cache[row.id] = [];
      }
    });
    return cache;
  }, [slideRows]);

  // Fetch published slide rows on mount
  useEffect(() => {
    const fetchSlideRows = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/slides/rows?published=true', {
          // Enable caching for better performance
          next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        const data = await response.json();

        if (data.status === 'success' && data.rows) {
          setSlideRows(data.rows);

          // Preload slides for first 2 rows for better UX
          if (data.rows.length > 0) {
            await loadSlidesForRow(data.rows[0].id);
            if (data.rows.length > 1) {
              // Preload second row in background
              loadSlidesForRow(data.rows[1].id);
            }
          }
        } else {
          setError('Failed to load slide rows');
        }
      } catch (err) {
        console.error('Error fetching slide rows:', err);
        setError('Error loading content');
      } finally {
        setLoading(false);
      }
    };

    fetchSlideRows();
  }, []);

  // Set initial background image and video when first row's slides are loaded
  useEffect(() => {
    if (slideRows.length > 0) {
      const firstRowId = slideRows[0].id;
      const slides = slidesCache[firstRowId];
      if (slides && slides.length > 0) {
        setActiveSlideImageUrl(slides[0].image_url || null);
        setActiveSlideVideoUrl(slides[0].video_url || null);
      }
    }
  }, [slidesCache, slideRows, setActiveSlideImageUrl, setActiveSlideVideoUrl]);

  // Load slides for a specific row
  const loadSlidesForRow = async (rowId: string) => {
    // Check if already cached
    if (slidesCache[rowId]) {
      return;
    }

    try {
      const response = await fetch(`/api/slides/rows/${rowId}/slides`);
      const data = await response.json();

      if (data.status === 'success' && data.slides) {
        setSlidesCache(prev => ({
          ...prev,
          [rowId]: data.slides
        }));
      }
    } catch (err) {
      console.error(`Error fetching slides for row ${rowId}:`, err);
    }
  };

  // Parse icon_set JSON string to array
  const parseIconSet = (iconSet: string | null): string[] => {
    if (!iconSet) return [];
    try {
      const parsed = JSON.parse(iconSet);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Render slide content
  const renderSlideContent = (slide: Slide, icons: string[], isMobile: boolean = false) => {
    const containerClass = slide.layout_type === 'OVERFLOW'
      ? (isMobile ? 'h-full overflow-y-auto p-4 flex flex-col justify-start items-start' : 'h-full overflow-y-auto p-4 flex flex-col justify-center')
      : (isMobile ? 'h-full overflow-y-auto p-4 flex flex-col justify-center items-start' : 'h-full overflow-y-auto p-4 flex flex-col justify-center');

    // Determine text color based on slide-specific theme or default to black
    const getTextColor = () => {
      if (slide.content_theme === 'light') {
        return '#ffffff'; // White text for light theme
      } else if (slide.content_theme === 'dark') {
        return '#000000'; // Black text for dark theme
      }
      return undefined; // Use default (var(--text-color) or existing classes)
    };

    const textColor = getTextColor();

    // Helper to create semi-transparent background style
    const createBgStyle = (opacity: number | undefined) => {
      if (!opacity || opacity === 0) return {};

      // Use slide theme to determine background color, or fallback to black with opacity
      const bgColor = slide.content_theme === 'light'
        ? `rgba(0, 0, 0, ${opacity})` // Dark background for light text
        : `rgba(255, 255, 255, ${opacity})`; // Light background for dark text

      return {
        backgroundColor: bgColor,
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'inline-block',
        width: 'fit-content',
        maxWidth: '100%'
      };
    };

    return (
      <div className={containerClass}>
        {/* Icons */}
        {icons.length > 0 && (
          <div className={`flex justify-start gap-4 mb-4 ${isMobile ? 'w-full' : ''}`}>
            {icons.map((icon, idx) => (
              <span
                key={idx}
                className="material-symbols-rounded"
                style={{
                  fontSize: '24px',
                  fontWeight: '100',
                  fontVariationSettings: "'FILL' 0, 'wght' 100, 'GRAD' 0, 'opsz' 24",
                  color: textColor || 'var(--icon-color)'
                }}
              >
                {icon}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <div style={createBgStyle(slide.title_bg_opacity)}>
          <h1
            className="text-4xl font-bold mb-4"
            style={{
              color: textColor || '#000000',
              marginBottom: slide.title_bg_opacity ? '0' : undefined
            }}
          >
            {slide.title}
          </h1>
        </div>

        {/* Subtitle (if exists) */}
        {slide.subtitle && (
          <div style={createBgStyle(slide.title_bg_opacity)} className="mt-4">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{
                color: textColor || '#4b5563',
                marginBottom: slide.title_bg_opacity ? '0' : undefined
              }}
            >
              {slide.subtitle}
            </h2>
          </div>
        )}

        {/* Audio Player (if audio_url exists) */}
        {slide.audio_url && (
          <EssentialAudioPlayer
            audioUrl={slide.audio_url}
            preload={true}
            className={isMobile ? 'w-full max-w-md mb-4' : 'max-w-md mb-4'}
          />
        )}

        {/* Body Content */}
        <div style={createBgStyle(slide.body_bg_opacity)}>
          <div
            className="space-y-4"
            style={{ color: textColor || '#000000' }}
            dangerouslySetInnerHTML={{ __html: slide.body_content }}
          />
        </div>
      </div>
    );
  };

  // Render horizontal swiper for a row's slides
  const renderHorizontalSwiper = (row: SlideRow, slides: Slide[], isMobile: boolean = false) => {
    // Use memoized icon cache for better performance
    const icons = iconSetsCache[row.id] || parseIconSet(row.icon_set);

    if (slides.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-xl text-black">Loading slides...</p>
        </div>
      );
    }

    return (
      <Swiper
        key={`horizontal-${row.id}`}
        direction="horizontal"
        spaceBetween={20}
        slidesPerView={1}
        className="h-full"
        onSwiper={(swiper) => {
          // Register this horizontal swiper in context
          setHorizontalSwiper(row.id, swiper);
          // Note: Don't set image/video URL here - let the useEffect handle initial state
          // This prevents race conditions with multiple swipers initializing
        }}
        onSlideChange={(swiper) => {
          // Update the scroll container when horizontal slide changes
          handleSlideChange(swiper);
          // Update background image and video when slide changes
          const currentSlide = slides[swiper.activeIndex];
          setActiveSlideImageUrl(currentSlide?.image_url || null);
          setActiveSlideVideoUrl(currentSlide?.video_url || null);
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {renderSlideContent(slide, icons, isMobile)}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  // Get slides for a row
  const getSlidesForRow = (rowId: string): Slide[] => {
    return slidesCache[rowId] || [];
  };

  // Loading state
  if (loading) {
    return (
      <main className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{padding: '50px'}}>
        <div className="text-center">
          <p className="text-xl text-black">Loading content...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{padding: '50px'}}>
        <div className="text-center">
          <p className="text-xl text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }

  // No content state
  if (slideRows.length === 0) {
    return (
      <main className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{padding: '50px'}}>
        <div className="text-center">
          <p className="text-xl text-black">No content available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="absolute inset-0 overflow-hidden" style={{padding: '50px'}}>
      {/* Desktop View - Vertical Swiper with nested Horizontal Swipers */}
      <div className="hidden md:block h-full">
        <div className="h-full">
          <Swiper
            direction="vertical"
            spaceBetween={20}
            slidesPerView={1}
            className="h-full"
            onSwiper={(swiper) => {
              console.log('Desktop Vertical Swiper initialized:', swiper);
              setSwiperRef(swiper);
              setTimeout(() => handleSlideChange(swiper), 100);
            }}
            onSlideChange={(swiper) => {
              handleSlideChange(swiper);

              // Load slides for the active row and update active row ID
              const activeRow = slideRows[swiper.activeIndex];
              if (activeRow) {
                loadSlidesForRow(activeRow.id);
                setActiveRow(activeRow.id);

                // Update background image and video for first slide of the new row
                const rowSlides = getSlidesForRow(activeRow.id);
                if (rowSlides.length > 0) {
                  setActiveSlideImageUrl(rowSlides[0].image_url || null);
                  setActiveSlideVideoUrl(rowSlides[0].video_url || null);
                }

                // Preload adjacent rows for smoother navigation
                const nextIndex = swiper.activeIndex + 1;
                const prevIndex = swiper.activeIndex - 1;
                if (nextIndex < slideRows.length) {
                  loadSlidesForRow(slideRows[nextIndex].id);
                }
                if (prevIndex >= 0) {
                  loadSlidesForRow(slideRows[prevIndex].id);
                }
              }
            }}
          >
            {slideRows.map((row) => {
              const slides = getSlidesForRow(row.id);

              return (
                <SwiperSlide key={row.id}>
                  <div className="h-full">
                    {renderHorizontalSwiper(row, slides, false)}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Mobile View - Vertical Swiper with nested Horizontal Swipers */}
      <div className="md:hidden h-full">
        <Swiper
          direction="vertical"
          spaceBetween={20}
          slidesPerView={1}
          className="h-full"
          onSwiper={(swiper) => {
            if (window.innerWidth < 768) {
              setSwiperRef(swiper);
              setTimeout(() => handleSlideChange(swiper), 100);
            }
          }}
          onSlideChange={(swiper) => {
            handleSlideChange(swiper);

            // Load slides for the active row and update active row ID
            const activeRow = slideRows[swiper.activeIndex];
            if (activeRow) {
              loadSlidesForRow(activeRow.id);
              setActiveRow(activeRow.id);

              // Update background image and video for first slide of the new row
              const rowSlides = getSlidesForRow(activeRow.id);
              if (rowSlides.length > 0) {
                setActiveSlideImageUrl(rowSlides[0].image_url || null);
                setActiveSlideVideoUrl(rowSlides[0].video_url || null);
              }

              // Preload adjacent rows for smoother navigation
              const nextIndex = swiper.activeIndex + 1;
              const prevIndex = swiper.activeIndex - 1;
              if (nextIndex < slideRows.length) {
                loadSlidesForRow(slideRows[nextIndex].id);
              }
              if (prevIndex >= 0) {
                loadSlidesForRow(slideRows[prevIndex].id);
              }
            }
          }}
        >
          {slideRows.map((row) => {
            const slides = getSlidesForRow(row.id);

            return (
              <SwiperSlide key={row.id}>
                <div className="h-full">
                  {renderHorizontalSwiper(row, slides, true)}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </main>
  );
}
