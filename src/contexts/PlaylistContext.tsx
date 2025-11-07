'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Slide } from '@/lib/queries/slides';
import { filterVisibleSlides } from '@/lib/utils/scheduleFilter';

interface PlaylistContextType {
  isPlaylistActive: boolean;
  isPaused: boolean;
  currentRowId: string | null;
  startPlaylist: (rowId: string, delaySeconds: number, swiper: SwiperType | null, slides: Slide[]) => void;
  pausePlaylist: () => void;
  resumePlaylist: () => void;
  stopPlaylist: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

interface PlaylistProviderProps {
  children: ReactNode;
}

export const PlaylistProvider = ({ children }: PlaylistProviderProps) => {
  const [isPlaylistActive, setIsPlaylistActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRowId, setCurrentRowId] = useState<string | null>(null);

  const swiperRef = useRef<SwiperType | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delaySecondsRef = useRef<number>(0);
  const slidesRef = useRef<Slide[]>([]);


  // Clear any pending delay timeout
  const clearDelayTimeout = useCallback(() => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // Find next slide with audio
  const findNextAudioSlide = useCallback((currentIndex: number, visibleSlides: Slide[]): number | null => {
    const audioSlides = visibleSlides.filter(slide => slide.audio_url);
    if (audioSlides.length === 0) return null;

    const currentSlideId = visibleSlides[currentIndex]?.id;
    const currentAudioIndex = audioSlides.findIndex(slide => slide.id === currentSlideId);

    if (currentAudioIndex === -1) {
      // Current slide doesn't have audio, find first audio slide
      const firstAudioSlide = audioSlides[0];
      return visibleSlides.findIndex(slide => slide.id === firstAudioSlide.id);
    }

    // Get next audio slide
    const nextAudioIndex = currentAudioIndex + 1;
    if (nextAudioIndex >= audioSlides.length) {
      // We've reached the end, loop back to first (but we'll stop instead)
      return null; // Signal to stop playlist
    }

    const nextAudioSlide = audioSlides[nextAudioIndex];
    return visibleSlides.findIndex(slide => slide.id === nextAudioSlide.id);
  }, []);

  // Handle audio ended event
  const handleAudioEnded = useCallback(() => {
    if (!isPlaylistActive || !swiperRef.current) return;

    const visibleSlides = filterVisibleSlides(slidesRef.current);
    const currentIndex = swiperRef.current.activeIndex;

    console.log('[Playlist] Audio ended, current index:', currentIndex);

    // Apply delay before advancing
    delayTimeoutRef.current = setTimeout(() => {
      if (!swiperRef.current) return;

      const nextIndex = findNextAudioSlide(currentIndex, visibleSlides);

      if (nextIndex === null) {
        // No more slides, stop playlist
        console.log('[Playlist] Reached end of playlist, stopping');
        stopPlaylist();
        return;
      }

      console.log('[Playlist] Advancing to slide index:', nextIndex);
      swiperRef.current.slideTo(nextIndex);

      // Wait for swiper transition, then broadcast event to activate next track
      setTimeout(() => {
        const nextSlide = visibleSlides[nextIndex];
        if (nextSlide && nextSlide.audio_url) {
          console.log('[Playlist] ▶️ Broadcasting autoRowPlayTrackActive for next slide:', {
            slideId: nextSlide.id,
            rowId: currentRowId,
            audioUrl: nextSlide.audio_url
          });

          // Broadcast event to tell the audio player to start playing
          window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
            detail: {
              slideId: nextSlide.id,
              rowId: currentRowId
            }
          }));
        } else {
          console.warn('[Playlist] No audio found for next slide');
        }
      }, 300); // Wait for swiper transition to complete
    }, delaySecondsRef.current * 1000);
  }, [isPlaylistActive, findNextAudioSlide, currentRowId]);

  // Start playlist
  const startPlaylist = useCallback((rowId: string, delaySeconds: number, swiper: SwiperType | null, slides: Slide[]) => {
    console.log('[Playlist] Starting playlist for row:', rowId, 'with delay:', delaySeconds);

    const visibleSlides = filterVisibleSlides(slides);
    const audioSlides = visibleSlides.filter(slide => slide.audio_url);

    if (audioSlides.length === 0) {
      console.warn('[Playlist] No audio slides found');
      return;
    }

    // IMPORTANT: Stop ALL audio players from ALL rows before starting this playlist
    console.log('[Playlist] Broadcasting stopAll to clear any playing audio from other rows');
    window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
      detail: {
        slideId: null,
        rowId: null,
        action: 'stopAll'
      }
    }));

    setIsPlaylistActive(true);
    setIsPaused(false);
    setCurrentRowId(rowId);
    swiperRef.current = swiper;
    delaySecondsRef.current = delaySeconds;
    slidesRef.current = slides;

    // Get the current active slide
    const currentIndex = swiper?.activeIndex ?? 0;
    const activeSlide = visibleSlides[currentIndex];

    // Broadcast event to activate the current slide's audio player
    setTimeout(() => {
      if (activeSlide && activeSlide.audio_url) {
        console.log('[Playlist] ▶️ Broadcasting autoRowPlayTrackActive for initial slide:', {
          slideId: activeSlide.id,
          rowId: rowId,
          audioUrl: activeSlide.audio_url
        });

        window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
          detail: {
            slideId: activeSlide.id,
            rowId: rowId
          }
        }));
      } else {
        console.warn('[Playlist] Active slide has no audio, finding first audio slide');

        // Find first slide with audio
        const firstAudioSlide = audioSlides[0];
        if (firstAudioSlide) {
          const firstAudioIndex = visibleSlides.findIndex(s => s.id === firstAudioSlide.id);
          if (firstAudioIndex !== -1 && swiper) {
            swiper.slideTo(firstAudioIndex);

            setTimeout(() => {
              console.log('[Playlist] ▶️ Broadcasting autoRowPlayTrackActive for first audio slide:', {
                slideId: firstAudioSlide.id,
                rowId: rowId,
                audioUrl: firstAudioSlide.audio_url
              });

              window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
                detail: {
                  slideId: firstAudioSlide.id,
                  rowId: rowId
                }
              }));
            }, 300);
          }
        }
      }
    }, 500); // Wait for DOM to be ready
  }, [handleAudioEnded]);

  // Pause playlist
  const pausePlaylist = useCallback(() => {
    console.log('[Playlist] Pausing');
    setIsPaused(true);
    clearDelayTimeout();

    // Broadcast pause event (null slideId means pause all)
    window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
      detail: {
        slideId: null,
        rowId: currentRowId,
        action: 'pause'
      }
    }));
  }, [clearDelayTimeout, currentRowId]);

  // Resume playlist
  const resumePlaylist = useCallback(() => {
    console.log('[Playlist] Resuming');
    setIsPaused(false);

    // Get current slide and broadcast resume
    if (swiperRef.current && slidesRef.current.length > 0) {
      const visibleSlides = filterVisibleSlides(slidesRef.current);
      const currentIndex = swiperRef.current.activeIndex;
      const currentSlide = visibleSlides[currentIndex];

      if (currentSlide && currentSlide.audio_url) {
        window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
          detail: {
            slideId: currentSlide.id,
            rowId: currentRowId,
            action: 'resume'
          }
        }));
      }
    }
  }, [currentRowId]);

  // Stop playlist
  const stopPlaylist = useCallback(() => {
    console.log('[Playlist] Stopping');

    // Broadcast stop event
    window.dispatchEvent(new CustomEvent('autoRowPlayTrackActive', {
      detail: {
        slideId: null,
        rowId: currentRowId,
        action: 'stop'
      }
    }));

    setIsPlaylistActive(false);
    setIsPaused(false);
    setCurrentRowId(null);
    clearDelayTimeout();
    swiperRef.current = null;
    slidesRef.current = [];
  }, [clearDelayTimeout, currentRowId]);

  // Listen for audio ended events from EssentialAudioPlayer
  useEffect(() => {
    const handlePlaylistAudioEnded = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { slideId, rowId } = customEvent.detail;

      console.log('[Playlist] Received playlistAudioEnded event:', { slideId, rowId, currentRowId });

      // Only process if this is from the active playlist
      if (rowId === currentRowId && isPlaylistActive && !isPaused) {
        handleAudioEnded();
      }
    };

    window.addEventListener('playlistAudioEnded', handlePlaylistAudioEnded);

    return () => {
      window.removeEventListener('playlistAudioEnded', handlePlaylistAudioEnded);
    };
  }, [handleAudioEnded, currentRowId, isPlaylistActive, isPaused]);

  // Context value
  const contextValue: PlaylistContextType = {
    isPlaylistActive,
    isPaused,
    currentRowId,
    startPlaylist,
    pausePlaylist,
    resumePlaylist,
    stopPlaylist,
  };

  return (
    <PlaylistContext.Provider value={contextValue}>
      {children}
    </PlaylistContext.Provider>
  );
};
