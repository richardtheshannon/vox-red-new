'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import EssentialAudioPlayer from './EssentialAudioPlayer';
import { useSwiperContext } from '@/contexts/SwiperContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Slide } from '@/lib/queries/slides';
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter';

interface MainContentProps {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
  setActiveRow: (rowId: string) => void;
  setActiveSlideImageUrl: (imageUrl: string | null) => void;
  setActiveSlideVideoUrl: (videoUrl: string | null) => void;
  activeSlideVideoUrl: string | null;
  isQuickSlideMode: boolean;
  onUnpublishDialogOpen: (slideId: string, rowId: string) => void;
  unpublishCallbackRef: React.MutableRefObject<((slideId: string, rowId: string) => void) | null>;
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
  icon_set: string[]; // Already parsed by API
  theme_color: string | null;
  created_at: string;
  updated_at: string;
}

export default function MainContent({ setSwiperRef, handleSlideChange, setActiveRow, setActiveSlideImageUrl, setActiveSlideVideoUrl, activeSlideVideoUrl, isQuickSlideMode, onUnpublishDialogOpen, unpublishCallbackRef }: MainContentProps) {
  const [slideRows, setSlideRows] = useState<SlideRow[]>([]);
  const [slidesCache, setSlidesCache] = useState<Record<string, Slide[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get swiper context to register horizontal swipers
  const { setHorizontalSwiper, getHorizontalSwiper, activeRowId } = useSwiperContext();

  // Store vertical swiper ref locally for navigation
  const verticalSwiperRef = React.useRef<SwiperType | null>(null);

  // Get global theme
  const { theme: globalTheme } = useTheme();

  // Filter rows based on Quick Slide mode
  const filteredSlideRows = useMemo(() => {
    console.log('[MainContent] Filtering rows. Quick Slide Mode:', isQuickSlideMode);
    console.log('[MainContent] Total slide rows:', slideRows.length);

    if (isQuickSlideMode) {
      // Show only QUICKSLIDE rows
      const quickslideRows = slideRows.filter(row => row.row_type === 'QUICKSLIDE');
      console.log('[MainContent] QUICKSLIDE rows found:', quickslideRows.length);
      quickslideRows.forEach(row => console.log('  - ', row.title, row.is_published ? '(published)' : '(unpublished)'));
      return quickslideRows;
    } else {
      // Show all rows EXCEPT QUICKSLIDE
      const normalRows = slideRows.filter(row => row.row_type !== 'QUICKSLIDE');
      console.log('[MainContent] Normal rows (excluding QUICKSLIDE):', normalRows.length);
      return normalRows;
    }
  }, [slideRows, isQuickSlideMode]);

  // Memoize icon sets (already parsed by API, no need to parse again)
  const iconSetsCache = useMemo(() => {
    console.log('[MainContent] Building icon cache from slideRows...');
    const cache: Record<string, string[]> = {};
    slideRows.forEach(row => {
      // icon_set is already an array from the API
      cache[row.id] = Array.isArray(row.icon_set) ? row.icon_set : [];
      if (cache[row.id].length > 0) {
        console.log(`  - ${row.title}: ${JSON.stringify(cache[row.id])}`);
      }
    });
    console.log('[MainContent] Icon cache built:', Object.keys(cache).length, 'rows');
    return cache;
  }, [slideRows]);

  // Fetch published slide rows on mount
  useEffect(() => {
    const fetchSlideRows = async () => {
      try {
        setLoading(true);
        console.log('[MainContent] Fetching slide rows...');
        const response = await fetch('/api/slides/rows?published=true', {
          // Enable caching for better performance
          next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        const data = await response.json();
        console.log('[MainContent] Fetched slide rows:', data);

        if (data.status === 'success' && data.rows) {
          console.log('[MainContent] Total rows fetched:', data.rows.length);
          data.rows.forEach((row: SlideRow) => {
            console.log(`  - ${row.title} (${row.row_type}) - Published: ${row.is_published}`);
          });
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
          console.error('[MainContent] Failed to load rows:', data);
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

  // Preload slides when Quick Slide mode changes
  useEffect(() => {
    console.log('[MainContent] Quick Slide mode changed:', isQuickSlideMode);
    console.log('[MainContent] Filtered slide rows:', filteredSlideRows.length);

    if (filteredSlideRows.length > 0) {
      const firstRow = filteredSlideRows[0];
      console.log('[MainContent] First filtered row:', firstRow.title, firstRow.id);
      console.log('[MainContent] Slides cached for this row:', !!slidesCache[firstRow.id]);

      // Load slides for the first filtered row if not already cached
      if (!slidesCache[firstRow.id]) {
        console.log('[MainContent] Loading slides for row:', firstRow.id);
        loadSlidesForRow(firstRow.id);
      }
    } else {
      console.warn('[MainContent] No filtered slide rows available!');
    }
  }, [isQuickSlideMode, filteredSlideRows, slidesCache]);

  // Load slides for a specific row
  const loadSlidesForRow = async (rowId: string) => {
    // Check if already cached
    if (slidesCache[rowId]) {
      console.log(`[MainContent] Slides already cached for row ${rowId}`);
      return;
    }

    try {
      console.log(`[MainContent] Loading slides for row ${rowId}...`);
      const response = await fetch(`/api/slides/rows/${rowId}/slides?published=true`);
      const data = await response.json();
      console.log(`[MainContent] Slides response for row ${rowId}:`, data);

      if (data.status === 'success' && data.slides) {
        console.log(`[MainContent] Found ${data.slides.length} slides for row ${rowId}`);
        setSlidesCache(prev => ({
          ...prev,
          [rowId]: data.slides
        }));
      } else {
        console.warn(`[MainContent] No slides or error for row ${rowId}:`, data);
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

  // Get slides for a row (filtered by schedule) - using useCallback to avoid re-creation
  const getSlidesForRow = useCallback((rowId: string): Slide[] => {
    const allSlides = slidesCache[rowId] || [];
    // Filter slides based on scheduling (time/day restrictions)
    return filterVisibleSlides(allSlides);
  }, [slidesCache]);

  // Handle unpublish icon click - delegate to parent
  const handleUnpublishClick = (slideId: string, rowId: string) => {
    onUnpublishDialogOpen(slideId, rowId);
  };

  // Set up the unpublish callback for parent to call after API success
  React.useEffect(() => {
    unpublishCallbackRef.current = (slideId: string, rowId: string) => {
      console.log('[MainContent] Unpublish callback called for slide:', slideId, 'in row:', rowId);

      // Get the horizontal swiper for this row
      const horizontalSwiper = getHorizontalSwiper(rowId);
      if (!horizontalSwiper) {
        console.warn('[MainContent] No horizontal swiper found for row:', rowId);
        return;
      }

      // Get current slides for the row
      const currentSlides = getSlidesForRow(rowId);
      const currentSlideIndex = currentSlides.findIndex(s => s.id === slideId);

      console.log('[MainContent] Current slides count:', currentSlides.length);
      console.log('[MainContent] Current slide index:', currentSlideIndex);

      // Remove the slide from cache
      setSlidesCache(prev => {
        const updatedSlides = (prev[rowId] || []).filter(s => s.id !== slideId);
        return {
          ...prev,
          [rowId]: updatedSlides
        };
      });

      // Determine navigation strategy
      setTimeout(() => {
        const updatedSlides = getSlidesForRow(rowId);
        console.log('[MainContent] Updated slides count after removal:', updatedSlides.length);

        if (updatedSlides.length === 0) {
          // No slides remain in this row - navigate to first row
          console.log('[MainContent] No slides left, navigating to first row');
          if (verticalSwiperRef.current) {
            verticalSwiperRef.current.slideTo(0);
            // Update active row and background
            if (filteredSlideRows.length > 0) {
              const firstRow = filteredSlideRows[0];
              setActiveRow(firstRow.id);
              const firstRowSlides = getSlidesForRow(firstRow.id);
              if (firstRowSlides.length > 0) {
                setActiveSlideImageUrl(firstRowSlides[0].image_url || null);
                setActiveSlideVideoUrl(firstRowSlides[0].video_url || null);
              }
            }
          }
        } else {
          // Slides remain - navigate to next or previous slide
          let targetIndex = currentSlideIndex;

          // If we removed the last slide, go to the new last slide
          if (currentSlideIndex >= updatedSlides.length) {
            targetIndex = updatedSlides.length - 1;
          }

          console.log('[MainContent] Navigating to slide index:', targetIndex);
          horizontalSwiper.slideTo(targetIndex);

          // Update background image/video
          const targetSlide = updatedSlides[targetIndex];
          if (targetSlide) {
            setActiveSlideImageUrl(targetSlide.image_url || null);
            setActiveSlideVideoUrl(targetSlide.video_url || null);
          }
        }
      }, 100); // Small delay to ensure state updates
    };

    return () => {
      unpublishCallbackRef.current = null;
    };
  }, [unpublishCallbackRef, getHorizontalSwiper, getSlidesForRow, filteredSlideRows, setActiveRow, setActiveSlideImageUrl, setActiveSlideVideoUrl]);

  // Render slide content
  const renderSlideContent = (slide: Slide, rowIcons: string[], row: SlideRow, isMobile: boolean = false, isActive: boolean = true) => {
    // Log audio URL for debugging (only for active slides to reduce noise)
    if (slide.audio_url && isActive) {
      console.log('[MainContent] Active Slide:', slide.id, 'Audio URL:', slide.audio_url);
    }

    // Use per-slide icons if available, otherwise fallback to row icons
    const slideIcons = slide.icon_set ? parseIconSet(slide.icon_set) : rowIcons;

    const containerClass = slide.layout_type === 'OVERFLOW'
      ? (isMobile ? 'h-full overflow-y-auto p-4 flex flex-col justify-start items-start' : 'h-full overflow-y-auto p-4 flex flex-col justify-center')
      : (isMobile ? 'h-full overflow-y-auto p-4 flex flex-col justify-center items-start' : 'h-full overflow-y-auto p-4 flex flex-col justify-center');

    // If video exists, only show audio player (if present) and allow clicks to pass through
    if (slide.video_url) {
      // Get text color for pill styling
      const effectiveTheme = slide.content_theme || globalTheme;
      const textColor = effectiveTheme === 'light' ? '#ffffff' : '#000000';

      return (
        <div className={containerClass} style={{ pointerEvents: 'none' }}>
          {/* Audio Player (if audio_url exists AND slide is active) */}
          {slide.audio_url && isActive && (
            <div style={{ pointerEvents: 'auto' }}>
              <EssentialAudioPlayer
                key={`audio-${slide.id}`}
                audioUrl={slide.audio_url}
                preload={false}
                className={isMobile ? 'w-full max-w-md mb-4' : 'max-w-md mb-4'}
              />
              {/* Row Description, Subtitle and Row Type Pills */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {row.description && (
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: textColor === '#ffffff'
                        ? 'rgba(0, 0, 0, 0.3)'
                        : 'rgba(255, 255, 255, 0.3)',
                      color: textColor
                    }}
                  >
                    {row.description}
                  </div>
                )}
                {slide.subtitle && (
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: textColor === '#ffffff'
                        ? 'rgba(0, 0, 0, 0.3)'
                        : 'rgba(255, 255, 255, 0.3)',
                      color: textColor
                    }}
                  >
                    {slide.subtitle}
                  </div>
                )}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: textColor === '#ffffff'
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: textColor
                  }}
                >
                  {row.row_type.charAt(0) + row.row_type.slice(1).toLowerCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Determine text color based on slide-specific theme or global theme
    const getTextColor = () => {
      // Determine which theme to use: slide override or global theme
      const effectiveTheme = slide.content_theme || globalTheme;

      if (effectiveTheme === 'light') {
        return '#ffffff'; // White text for light theme
      } else if (effectiveTheme === 'dark') {
        return '#000000'; // Black text for dark theme
      }
      return undefined; // Fallback
    };

    const textColor = getTextColor();

    // Helper to create semi-transparent background style
    const createBgStyle = (opacity: number | undefined) => {
      // Convert to number and check if valid
      const numOpacity = Number(opacity) || 0;
      if (numOpacity === 0) return {};

      // Determine which theme to use: slide override or global theme
      const effectiveTheme = slide.content_theme || globalTheme;

      // Use effective theme to determine background color
      const bgColor = effectiveTheme === 'light'
        ? `rgba(0, 0, 0, ${numOpacity})` // Dark background for light text
        : `rgba(255, 255, 255, ${numOpacity})`; // Light background for dark text

      return {
        backgroundColor: bgColor,
        padding: '5px',
        display: 'inline-block',
        width: 'fit-content',
        maxWidth: '100%'
      };
    };

    return (
      <div className={containerClass}>
        {/* Icons - Show per-slide icons if available, otherwise show row icons */}
        {slideIcons.length > 0 && (
          <div className={`flex justify-start gap-4 mb-4 ${isMobile ? 'w-full' : ''}`}>
            {slideIcons.map((icon, idx) => {
              const isUnpublishIcon = icon === 'select_check_box';
              return (
                <span
                  key={idx}
                  className="material-symbols-rounded"
                  onClick={isUnpublishIcon ? () => handleUnpublishClick(slide.id, slide.slide_row_id) : undefined}
                  style={{
                    fontSize: '24px',
                    fontWeight: '100',
                    fontVariationSettings: "'FILL' 0, 'wght' 100, 'GRAD' 0, 'opsz' 24",
                    color: isUnpublishIcon ? '#ef4444' : (textColor || 'var(--icon-color)'),
                    cursor: isUnpublishIcon ? 'pointer' : 'default',
                    opacity: isUnpublishIcon ? 0.7 : 1,
                    transition: 'opacity 150ms ease',
                    pointerEvents: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (isUnpublishIcon) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isUnpublishIcon) {
                      e.currentTarget.style.opacity = '0.7';
                    }
                  }}
                >
                  {icon}
                </span>
              );
            })}
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

        {/* Audio Player (if audio_url exists AND slide is active) */}
        {slide.audio_url && isActive && (
          <>
            <EssentialAudioPlayer
              key={`audio-${slide.id}`}
              audioUrl={slide.audio_url}
              preload={false}
              className={isMobile ? 'w-full max-w-md mb-4' : 'max-w-md mb-4'}
            />
            {/* Row Description, Subtitle and Row Type Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {row.description && (
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: textColor === '#ffffff'
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: textColor || '#000000'
                  }}
                >
                  {row.description}
                </div>
              )}
              {slide.subtitle && (
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: textColor === '#ffffff'
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.3)',
                    color: textColor || '#000000'
                  }}
                >
                  {slide.subtitle}
                </div>
              )}
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: textColor === '#ffffff'
                    ? 'rgba(0, 0, 0, 0.3)'
                    : 'rgba(255, 255, 255, 0.3)',
                  color: textColor || '#000000'
                }}
              >
                {row.row_type.charAt(0) + row.row_type.slice(1).toLowerCase()}
              </div>
            </div>
          </>
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
    // row.icon_set is already an array from the API, no need to parse
    const icons = iconSetsCache[row.id] || row.icon_set || [];
    console.log(`[MainContent] Rendering row ${row.title} (${row.id}) with icons:`, icons);

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
            {({ isActive }) => renderSlideContent(slide, icons, row, isMobile, isActive)}
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  // Loading state
  if (loading) {
    return (
      <main className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{padding: '50px', zIndex: 20, backgroundColor: 'transparent'}}>
        <div className="text-center">
          <p className="text-xl text-black">Loading content...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{padding: '50px', zIndex: 20, backgroundColor: 'transparent'}}>
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
  if (filteredSlideRows.length === 0) {
    return (
      <main className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{padding: '50px', zIndex: 20, backgroundColor: 'transparent'}}>
        <div className="text-center">
          <p className="text-xl text-black">No content available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="absolute inset-0 overflow-hidden" style={{padding: '50px', zIndex: 20, backgroundColor: 'transparent', pointerEvents: 'none'}}>
      {/* Desktop View - Vertical Swiper with nested Horizontal Swipers */}
      <div className="hidden md:block h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
        <div className="h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
          <Swiper
            direction="vertical"
            spaceBetween={20}
            slidesPerView={1}
            className="h-full"
            onSwiper={(swiper) => {
              console.log('Desktop Vertical Swiper initialized:', swiper);
              verticalSwiperRef.current = swiper;
              setSwiperRef(swiper);
              setTimeout(() => handleSlideChange(swiper), 100);
            }}
            onSlideChange={(swiper) => {
              handleSlideChange(swiper);

              // Load slides for the active row and update active row ID
              const activeRow = filteredSlideRows[swiper.activeIndex];
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
                if (nextIndex < filteredSlideRows.length) {
                  loadSlidesForRow(filteredSlideRows[nextIndex].id);
                }
                if (prevIndex >= 0) {
                  loadSlidesForRow(filteredSlideRows[prevIndex].id);
                }
              }
            }}
          >
            {filteredSlideRows.map((row) => {
              const slides = getSlidesForRow(row.id);

              return (
                <SwiperSlide key={row.id}>
                  <div className="h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
                    {renderHorizontalSwiper(row, slides, false)}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Mobile View - Vertical Swiper with nested Horizontal Swipers */}
      <div className="md:hidden h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
        <Swiper
          direction="vertical"
          spaceBetween={20}
          slidesPerView={1}
          className="h-full"
          onSwiper={(swiper) => {
            if (window.innerWidth < 768) {
              verticalSwiperRef.current = swiper;
              setSwiperRef(swiper);
              setTimeout(() => handleSlideChange(swiper), 100);
            }
          }}
          onSlideChange={(swiper) => {
            handleSlideChange(swiper);

            // Load slides for the active row and update active row ID
            const activeRow = filteredSlideRows[swiper.activeIndex];
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
              if (nextIndex < filteredSlideRows.length) {
                loadSlidesForRow(filteredSlideRows[nextIndex].id);
              }
              if (prevIndex >= 0) {
                loadSlidesForRow(filteredSlideRows[prevIndex].id);
              }
            }
          }}
        >
          {filteredSlideRows.map((row) => {
            const slides = getSlidesForRow(row.id);

            return (
              <SwiperSlide key={row.id}>
                <div className="h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
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
