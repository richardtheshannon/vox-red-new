'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import EssentialAudioPlayer from './EssentialAudioPlayer';
import { useSwiperContext } from '@/contexts/SwiperContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePlaylist } from '@/contexts/PlaylistContext';
import { Slide } from '@/lib/queries/slides';
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter';
import { applyRandomization } from '@/lib/utils/slideRandomizer';
import { useSession } from 'next-auth/react';

interface MainContentProps {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
  setActiveRow: (rowId: string) => void;
  setActiveSlideImageUrl: (imageUrl: string | null) => void;
  setActiveSlideVideoUrl: (videoUrl: string | null) => void;
  activeSlideVideoUrl: string | null;
  setActiveSlideOverlayOpacity: (opacity: number) => void;
  setActiveSlideContentTheme: (theme: 'light' | 'dark' | null) => void;
  isQuickSlideMode: boolean;
  isSimpleShiftMode: boolean;
  isImageSlideMode: boolean;
  isServiceMode: boolean;
  isGoalsMode: boolean;
  onUnpublishDialogOpen: (slideId: string, rowId: string) => void;
  unpublishCallbackRef: React.MutableRefObject<((slideId: string, rowId: string) => void) | null>;
  updatePlaylistData: (rowId: string, delaySeconds: number, slides: Slide[], swiper: SwiperType | null, hasAudio: boolean) => void;
  updateSlideCounter: (currentIndex: number, total: number) => void;
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
  playlist_delay_seconds: number;
  randomize_enabled: boolean;
  randomize_count: number | null;
  randomize_interval: 'hourly' | 'daily' | 'weekly' | null;
  randomize_seed: number | null;
  row_background_image_url: string | null;
  row_layout_type: 'STANDARD' | 'OVERFLOW' | 'MINIMAL' | null;
  created_at: string;
  updated_at: string;
}

export default function MainContent({ setSwiperRef, handleSlideChange, setActiveRow, setActiveSlideImageUrl, setActiveSlideVideoUrl, activeSlideVideoUrl, setActiveSlideOverlayOpacity, setActiveSlideContentTheme, isQuickSlideMode, isSimpleShiftMode, isImageSlideMode, isServiceMode, isGoalsMode, onUnpublishDialogOpen, unpublishCallbackRef, updatePlaylistData, updateSlideCounter }: MainContentProps) {
  const [slideRows, setSlideRows] = useState<SlideRow[]>([]);
  const [slidesCache, setSlidesCache] = useState<Record<string, Slide[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get session to monitor authentication state changes
  const { data: session, status: sessionStatus } = useSession();

  // Get swiper context to register horizontal swipers
  const { setHorizontalSwiper, getHorizontalSwiper, activeRowId } = useSwiperContext();

  // Store vertical swiper ref locally for navigation
  const verticalSwiperRef = React.useRef<SwiperType | null>(null);

  // Track if initial background has been set (prevent useEffect from overwriting slide changes)
  const initialBackgroundSetRef = React.useRef<boolean>(false);

  // Get global theme
  const { theme: globalTheme } = useTheme();

  // Get playlist context for audio playback management
  const { stopPlaylist } = usePlaylist();

  // Helper function to update slide data (image, video, AND overlay)
  // Accepts optional row parameter to check for row-level background override
  const updateActiveSlideData = (slide: Slide | null, row?: SlideRow | null) => {
    if (slide) {
      // Check for row-level background override first, then fall back to slide image
      const imageUrl = (row?.row_background_image_url) || slide.image_url || null;

      // Explicitly clear background if slide has no image_url (ensures slides without backgrounds show theme color)
      // Use separate checks to ensure null is set when image/video are missing
      setActiveSlideImageUrl(imageUrl);
      setActiveSlideVideoUrl(slide.video_url || null);
      setActiveSlideOverlayOpacity(Number(slide.title_bg_opacity) || 0);
      // Use slide's content_theme if defined, otherwise null (use global theme)
      setActiveSlideContentTheme(slide.content_theme || null);
    } else {
      // Explicitly clear all background/video state
      setActiveSlideImageUrl(null);
      setActiveSlideVideoUrl(null);
      setActiveSlideOverlayOpacity(0);
      setActiveSlideContentTheme(null);
    }
  };

  // Filter rows based on Quick Slide mode, Simple Shift mode, Image Slide mode, Service mode, and Goals mode
  const filteredSlideRows = useMemo(() => {
    console.log('[MainContent] Filtering rows. Quick Slide Mode:', isQuickSlideMode, 'Simple Shift Mode:', isSimpleShiftMode, 'Image Slide Mode:', isImageSlideMode, 'Service Mode:', isServiceMode, 'Goals Mode:', isGoalsMode);
    console.log('[MainContent] Total slide rows:', slideRows.length);

    let rows: SlideRow[];
    if (isGoalsMode) {
      // Show only GOALS rows
      rows = slideRows.filter(row => row.row_type === 'GOALS');
      console.log('[MainContent] GOALS rows found:', rows.length);
      rows.forEach(row => console.log('  - ', row.title, row.is_published ? '(published)' : '(unpublished)'));
    } else if (isServiceMode) {
      // Show only SERVICE rows
      rows = slideRows.filter(row => row.row_type === 'SERVICE');
      console.log('[MainContent] SERVICE rows found:', rows.length);
      rows.forEach(row => console.log('  - ', row.title, row.is_published ? '(published)' : '(unpublished)'));
    } else if (isImageSlideMode) {
      // Show only IMGSLIDES rows
      rows = slideRows.filter(row => row.row_type === 'IMGSLIDES');
      console.log('[MainContent] IMGSLIDES rows found:', rows.length);
      rows.forEach(row => console.log('  - ', row.title, row.is_published ? '(published)' : '(unpublished)'));
    } else if (isSimpleShiftMode) {
      // Show only SIMPLESHIFT rows
      rows = slideRows.filter(row => row.row_type === 'SIMPLESHIFT');
      console.log('[MainContent] SIMPLESHIFT rows found:', rows.length);
      rows.forEach(row => console.log('  - ', row.title, row.is_published ? '(published)' : '(unpublished)'));
    } else if (isQuickSlideMode) {
      // Show only QUICKSLIDE rows
      rows = slideRows.filter(row => row.row_type === 'QUICKSLIDE');
      console.log('[MainContent] QUICKSLIDE rows found:', rows.length);
      rows.forEach(row => console.log('  - ', row.title, row.is_published ? '(published)' : '(unpublished)'));
    } else {
      // Show all rows EXCEPT QUICKSLIDE, SIMPLESHIFT, IMGSLIDES, SERVICE, and GOALS
      rows = slideRows.filter(row => row.row_type !== 'QUICKSLIDE' && row.row_type !== 'SIMPLESHIFT' && row.row_type !== 'IMGSLIDES' && row.row_type !== 'SERVICE' && row.row_type !== 'GOALS');
      console.log('[MainContent] Normal rows (excluding QUICKSLIDE, SIMPLESHIFT, IMGSLIDES, SERVICE, and GOALS):', rows.length);
    }

    // Filter out rows that have zero visible slides (due to scheduling)
    const rowsWithVisibleSlides = rows.filter(row => {
      const slides = slidesCache[row.id] || [];
      const visibleSlides = filterVisibleSlides(slides);
      const hasVisibleSlides = visibleSlides.length > 0;

      if (!hasVisibleSlides && slides.length > 0) {
        console.log(`[MainContent] Hiding row "${row.title}" - all ${slides.length} slides filtered by schedule`);
      }

      return hasVisibleSlides || slides.length === 0; // Include rows not yet loaded
    });

    console.log('[MainContent] Rows with visible slides:', rowsWithVisibleSlides.length);
    return rowsWithVisibleSlides;
  }, [slideRows, isQuickSlideMode, isSimpleShiftMode, isImageSlideMode, isServiceMode, isGoalsMode, slidesCache]);

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

  // Fetch published slide rows on mount and when session status changes
  useEffect(() => {
    // Skip fetching if session is still loading
    if (sessionStatus === 'loading') {
      return;
    }

    const fetchSlideRows = async () => {
      try {
        setLoading(true);
        console.log('[MainContent] Fetching slide rows... (sessionStatus:', sessionStatus, ')');
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
          // Clear slides cache when refetching rows (to ensure fresh data)
          setSlidesCache({});

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
  }, [sessionStatus]);

  // Set initial background image and video when first row's slides are loaded (ONCE only)
  useEffect(() => {
    // Only run this effect ONCE on initial load - don't overwrite slide navigation changes
    if (initialBackgroundSetRef.current) {
      return;
    }

    if (filteredSlideRows.length > 0) {
      const firstRow = filteredSlideRows[0];
      const slides = slidesCache[firstRow.id];
      if (slides && slides.length > 0) {
        updateActiveSlideData(slides[0], firstRow);
        initialBackgroundSetRef.current = true; // Mark as set

        // Update slide counter to first slide
        updateSlideCounter(0, slides.length);

        // Update playlist data for initial row (with small delay to ensure swiper is registered)
        setTimeout(() => {
          const visibleSlides = filterVisibleSlides(slides);
          const hasAudio = visibleSlides.some(slide => slide.audio_url);
          const horizontalSwiper = getHorizontalSwiper(firstRow.id);
          console.log('[MainContent] Initial playlist data update - hasAudio:', hasAudio, 'visibleSlides:', visibleSlides.length, 'horizontalSwiper:', !!horizontalSwiper);
          updatePlaylistData(firstRow.id, firstRow.playlist_delay_seconds, visibleSlides, horizontalSwiper, hasAudio);
        }, 200);
      }
    }
  }, [slidesCache, filteredSlideRows, setActiveSlideImageUrl, setActiveSlideVideoUrl, updatePlaylistData, getHorizontalSwiper, updateSlideCounter]);

  // Preload slides when Quick Slide mode, Simple Shift mode, Image Slide mode, Service mode, or Goals mode changes
  useEffect(() => {
    console.log('[MainContent] Mode changed - Quick Slide:', isQuickSlideMode, 'Simple Shift:', isSimpleShiftMode, 'Image Slide:', isImageSlideMode, 'Service:', isServiceMode, 'Goals:', isGoalsMode);
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
  }, [isQuickSlideMode, isSimpleShiftMode, isImageSlideMode, isServiceMode, isGoalsMode, filteredSlideRows, slidesCache]);

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

  // Get slides for a row (filtered by schedule + randomization) - using useCallback to avoid re-creation
  const getSlidesForRow = useCallback((rowId: string): Slide[] => {
    const allSlides = slidesCache[rowId] || [];

    // First, filter slides based on scheduling (time/day restrictions)
    const visibleSlides = filterVisibleSlides(allSlides);

    // Then, apply randomization if enabled for this row
    const row = slideRows.find(r => r.id === rowId);
    if (row) {
      return applyRandomization(
        visibleSlides,
        row.randomize_enabled,
        row.randomize_count,
        row.randomize_interval
      );
    }

    return visibleSlides;
  }, [slidesCache, slideRows]);

  // Handle unpublish icon click - delegate to parent (permanent unpublish)
  const handleUnpublishClick = (slideId: string, rowId: string) => {
    onUnpublishDialogOpen(slideId, rowId);
  };

  // Handle temporary unpublish icon click (no dialog needed)
  const handleTempUnpublishClick = async (slideId: string, rowId: string) => {
    try {
      console.log('[MainContent] Temp unpublishing slide:', slideId);

      // Call the temp-unpublish API
      const response = await fetch(`/api/slides/rows/${rowId}/slides/${slideId}/temp-unpublish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.status === 'success') {
        console.log('[MainContent] Slide temporarily unpublished until:', data.unpublishUntil);

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
          const updatedSlides = (prev[rowId] || []).map(s => {
            if (s.id === slideId) {
              // Update the slide with temp_unpublish_until timestamp
              return { ...s, temp_unpublish_until: data.unpublishUntil };
            }
            return s;
          });
          return {
            ...prev,
            [rowId]: updatedSlides
          };
        });

        // Determine navigation strategy
        setTimeout(() => {
          const updatedSlides = getSlidesForRow(rowId);
          console.log('[MainContent] Updated slides count after temp unpublish:', updatedSlides.length);

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
                  updateActiveSlideData(firstRowSlides[0], firstRow);
                } else {
                  // Clear background if no slides in first row
                  updateActiveSlideData(null);
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

            // CRITICAL FIX: Clear background FIRST to prevent image persistence
            updateActiveSlideData(null);

            // Then navigate and update with the correct slide data
            horizontalSwiper.slideTo(targetIndex);

            // Update background image/video/overlay with the target slide
            const targetSlide = updatedSlides[targetIndex];
            const currentRow = slideRows.find(r => r.id === rowId);
            updateActiveSlideData(targetSlide || null, currentRow);
          }
        }, 100); // Small delay to ensure state updates
      } else {
        console.error('[MainContent] Failed to temp unpublish slide:', data.message);
      }
    } catch (err) {
      console.error('[MainContent] Error temp unpublishing slide:', err);
    }
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
                updateActiveSlideData(firstRowSlides[0], firstRow);
              } else {
                // Clear background if no slides in first row
                updateActiveSlideData(null);
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

          // CRITICAL FIX: Clear background FIRST to prevent image persistence
          updateActiveSlideData(null);

          // Then navigate and update with the correct slide data
          horizontalSwiper.slideTo(targetIndex);

          // Update background image/video/overlay with the target slide
          const targetSlide = updatedSlides[targetIndex];
          const currentRow = slideRows.find(r => r.id === rowId);
          updateActiveSlideData(targetSlide || null, currentRow);
        }
      }, 100); // Small delay to ensure state updates
    };

    return () => {
      unpublishCallbackRef.current = null;
    };
  }, [unpublishCallbackRef, getHorizontalSwiper, getSlidesForRow, filteredSlideRows, setActiveRow, setActiveSlideImageUrl, setActiveSlideVideoUrl, slideRows]);

  // Render slide content
  const renderSlideContent = (slide: Slide, rowIcons: string[], row: SlideRow, isMobile: boolean = false, isActive: boolean = true, enableAudioRef: boolean = false) => {
    // Note: enableAudioRef parameter is kept for future use but not currently used
    // Playlist now uses DOM query to find active audio element dynamically

    // Use per-slide icons if available, otherwise fallback to row icons
    const slideIcons = slide.icon_set ? parseIconSet(slide.icon_set) : rowIcons;

    // Check for row-level layout override first, then fall back to slide's layout_type
    const effectiveLayoutType = row.row_layout_type || slide.layout_type;

    const containerClass = effectiveLayoutType === 'OVERFLOW'
      ? (isMobile ? 'h-full overflow-y-auto p-4 flex flex-col justify-start items-start' : 'h-full overflow-y-auto p-4 flex flex-col justify-start')
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
                slideId={slide.id}
                rowId={slide.slide_row_id}
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

    return (
      <div className={containerClass}>
        {/* Icons - Show per-slide icons if available, otherwise show row icons */}
        {slideIcons.length > 0 && (
          <div className={`flex justify-start gap-4 mb-4 ${isMobile ? 'w-full' : ''}`}>
            {slideIcons.map((icon, idx) => {
              const isUnpublishIcon = icon === 'select_check_box';
              const isTempUnpublishIcon = icon === 'check_circle_unread';
              const isClickable = isUnpublishIcon || isTempUnpublishIcon;

              return (
                <span
                  key={idx}
                  className="material-symbols-rounded"
                  onClick={
                    isUnpublishIcon
                      ? () => handleUnpublishClick(slide.id, slide.slide_row_id)
                      : isTempUnpublishIcon
                      ? () => handleTempUnpublishClick(slide.id, slide.slide_row_id)
                      : undefined
                  }
                  style={{
                    fontSize: '24px',
                    fontWeight: '100',
                    fontVariationSettings: "'FILL' 0, 'wght' 100, 'GRAD' 0, 'opsz' 24",
                    color: isUnpublishIcon
                      ? '#ef4444'
                      : isTempUnpublishIcon
                      ? '#22c55e'
                      : (textColor || 'var(--icon-color)'),
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: isClickable ? 0.7 : 1,
                    transition: 'opacity 150ms ease',
                    pointerEvents: 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
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
        {slide.title && (
          <h1
            className="text-4xl font-bold mb-4"
            style={{
              color: textColor || '#000000'
            }}
          >
            {slide.title}
          </h1>
        )}

        {/* Audio Player (if audio_url exists AND slide is active) */}
        {slide.audio_url && isActive && (
          <>
            <EssentialAudioPlayer
              key={`audio-${slide.id}`}
              audioUrl={slide.audio_url}
              slideId={slide.id}
              rowId={slide.slide_row_id}
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
        <div
          className="space-y-4"
          style={{ color: textColor || '#000000' }}
          dangerouslySetInnerHTML={{ __html: slide.body_content || '' }}
        />
      </div>
    );
  };

  // Render horizontal swiper for a row's slides
  const renderHorizontalSwiper = (row: SlideRow, slides: Slide[], isMobile: boolean = false, enableAudioRef: boolean = false) => {
    // Use memoized icon cache for better performance
    // row.icon_set is already an array from the API, no need to parse
    const icons = iconSetsCache[row.id] || row.icon_set || [];
    console.log(`[MainContent] Rendering row ${row.title} (${row.id}) with icons:`, icons, 'enableAudioRef:', enableAudioRef);

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
          // Update background image, video, and overlay when slide changes
          // Use getSlidesForRow to get current slides (not stale closure) after unpublish
          const currentSlides = getSlidesForRow(row.id);
          const currentSlide = currentSlides[swiper.activeIndex];
          updateActiveSlideData(currentSlide || null, row);
          // Update slide counter with current slides count
          updateSlideCounter(swiper.activeIndex, currentSlides.length);
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {({ isActive }) => renderSlideContent(slide, icons, row, isMobile, isActive, enableAudioRef)}
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
            mousewheel={{ releaseOnEdges: true }}
            modules={[Mousewheel]}
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

                // Update background image, video, and overlay for first slide of the new row
                const rowSlides = getSlidesForRow(activeRow.id);
                if (rowSlides.length > 0) {
                  updateActiveSlideData(rowSlides[0], activeRow);
                  // Update slide counter to first slide of new row
                  updateSlideCounter(0, rowSlides.length);
                }

                // Update playlist data for top icon bar (use filtered slides for schedule)
                const visibleSlides = filterVisibleSlides(rowSlides);
                const horizontalSwiper = getHorizontalSwiper(activeRow.id);
                const hasAudio = visibleSlides.some(slide => slide.audio_url);
                console.log('[MainContent] Row change playlist data - hasAudio:', hasAudio, 'visibleSlides:', visibleSlides.length, 'totalSlides:', rowSlides.length);
                updatePlaylistData(activeRow.id, activeRow.playlist_delay_seconds, visibleSlides, horizontalSwiper, hasAudio);

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
                    {renderHorizontalSwiper(row, slides, false, true)}
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
          mousewheel={{ releaseOnEdges: true }}
          modules={[Mousewheel]}
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

              // Update background image, video, and overlay for first slide of the new row
              const rowSlides = getSlidesForRow(activeRow.id);
              if (rowSlides.length > 0) {
                updateActiveSlideData(rowSlides[0], activeRow);
                // Update slide counter to first slide of new row
                updateSlideCounter(0, rowSlides.length);
              }

              // Update playlist data for top icon bar (use filtered slides for schedule)
              const visibleSlides = filterVisibleSlides(rowSlides);
              const horizontalSwiper = getHorizontalSwiper(activeRow.id);
              const hasAudio = visibleSlides.some(slide => slide.audio_url);
              console.log('[MainContent] Mobile row change playlist data - hasAudio:', hasAudio, 'visibleSlides:', visibleSlides.length, 'totalSlides:', rowSlides.length);
              updatePlaylistData(activeRow.id, activeRow.playlist_delay_seconds, visibleSlides, horizontalSwiper, hasAudio);

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
                  {renderHorizontalSwiper(row, slides, true, false)}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </main>
  );
}
