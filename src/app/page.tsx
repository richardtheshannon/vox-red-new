'use client';

import { useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import type { Slide } from '@/lib/queries/slides';
import TopIconBar from '@/components/TopIconBar';
import LeftIconBar from '@/components/LeftIconBar';
import RightIconBar from '@/components/RightIconBar';
import BottomIconBar from '@/components/BottomIconBar';
import MainContent from '@/components/MainContent';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { SwiperProvider } from '@/contexts/SwiperContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PlaylistProvider } from '@/contexts/PlaylistContext';
import QuickSlideModal from '@/components/QuickSlideModal';
import LoginModal from '@/components/LoginModal';
import LogoutModal from '@/components/LogoutModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import SpaAudioPlayer from '@/components/SpaAudioPlayer';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  // Vertical swiper (for rows)
  const verticalSwiperRef = useRef<SwiperType | null>(null);

  // Horizontal swipers (for slides within each row)
  const horizontalSwipersRef = useRef<Record<string, SwiperType>>({});

  // Track active row and slide
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeSlideImageUrl, setActiveSlideImageUrl] = useState<string | null>(null);
  const [activeSlideVideoUrl, setActiveSlideVideoUrl] = useState<string | null>(null);
  const [videoDisplayMode, setVideoDisplayMode] = useState<'cover' | 'contained'>('cover');

  // Track active slide overlay settings for full viewport overlay
  const [activeSlideOverlayOpacity, setActiveSlideOverlayOpacity] = useState<number>(0);
  const [activeSlideContentTheme, setActiveSlideContentTheme] = useState<'light' | 'dark' | null>(null);

  // Quick Slide Modal state
  const [isQuickSlideModalOpen, setIsQuickSlideModalOpen] = useState(false);

  // Login Modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Logout Modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Quick Slide Mode state (toggle between all rows and Quick Slide row only)
  const [isQuickSlideMode, setIsQuickSlideMode] = useState(false);

  // Unpublish confirmation dialog state
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [slideToUnpublish, setSlideToUnpublish] = useState<{ slideId: string; rowId: string } | null>(null);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  // Spa Mode state
  const [isSpaPlaying, setIsSpaPlaying] = useState(false);

  // Playlist state - tracks current row data and slides for playlist feature
  const playlistDataRef = useRef<{
    rowId: string | null;
    delaySeconds: number;
    slides: Slide[];
    swiper: SwiperType | null;
  }>({ rowId: null, delaySeconds: 0, slides: [], swiper: null });
  const [hasAudioSlides, setHasAudioSlides] = useState(false);

  // Slide counter state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  // Navigation functions for footer arrows
  // Left/Right arrows navigate horizontal slides only
  const slidePrev = () => {
    console.log('slidePrev called');
    if (activeRowId && horizontalSwipersRef.current[activeRowId]) {
      horizontalSwipersRef.current[activeRowId].slidePrev();
    }
  };

  const slideNext = () => {
    console.log('slideNext called');
    if (activeRowId && horizontalSwipersRef.current[activeRowId]) {
      horizontalSwipersRef.current[activeRowId].slideNext();
    }
  };

  // Up/Down arrows navigate vertical rows
  const scrollUp = () => {
    console.log('scrollUp called - navigating to previous row');
    verticalSwiperRef.current?.slidePrev();
  };

  const scrollDown = () => {
    console.log('scrollDown called - navigating to next row');
    verticalSwiperRef.current?.slideNext();
  };

  // Store reference to a horizontal swiper
  const setHorizontalSwiper = (rowId: string, swiper: SwiperType) => {
    horizontalSwipersRef.current[rowId] = swiper;
  };

  // Get reference to a horizontal swiper
  const getHorizontalSwiper = (rowId: string): SwiperType | null => {
    return horizontalSwipersRef.current[rowId] || null;
  };

  // Handle slide change for any swiper (vertical or horizontal)
  const handleSlideChange = (swiper: SwiperType) => {
    // Add safety checks to prevent runtime errors
    if (!swiper || typeof swiper.activeIndex === 'undefined' || !swiper.slides) {
      return;
    }
    // Slide change handled - no content scrolling needed
  };

  // Set vertical swiper ref from MainContent
  const setVerticalSwiperRef = (swiper: SwiperType | null) => {
    verticalSwiperRef.current = swiper;
  };

  // Set active row ID when row changes
  const setActiveRow = (rowId: string) => {
    setActiveRowId(rowId);
  };

  // Toggle video display mode
  const toggleVideoMode = () => {
    setVideoDisplayMode(prev => prev === 'cover' ? 'contained' : 'cover');
  };

  // Handle Quick Slide Modal
  const handleQuickSlideClick = () => {
    setIsQuickSlideModalOpen(true);
  };

  const handleQuickSlideSuccess = () => {
    // Reload the page to show the new quick slide
    window.location.reload();
  };

  // Handle Login/Logout Modal
  const handleGroupClick = () => {
    if (session) {
      setIsLogoutModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Toggle Quick Slide Mode
  const toggleQuickSlideMode = () => {
    setIsQuickSlideMode(prev => !prev);
  };

  // Handle unpublish dialog open
  const handleUnpublishDialogOpen = (slideId: string, rowId: string) => {
    setSlideToUnpublish({ slideId, rowId });
    setShowUnpublishDialog(true);
  };

  // Callback ref for MainContent to handle post-unpublish navigation
  const mainContentUnpublishCallbackRef = useRef<((slideId: string, rowId: string) => void) | null>(null);

  // Confirm unpublish
  const handleConfirmUnpublish = async () => {
    if (!slideToUnpublish) return;

    const { slideId, rowId } = slideToUnpublish;
    setIsUnpublishing(true);

    try {
      // Call API to unpublish the slide
      const response = await fetch(`/api/slides/rows/${rowId}/slides/${slideId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: false,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Call MainContent's callback to handle navigation
        if (mainContentUnpublishCallbackRef.current) {
          mainContentUnpublishCallbackRef.current(slideId, rowId);
        }

        // Close dialog
        setIsUnpublishing(false);
        setShowUnpublishDialog(false);
        setSlideToUnpublish(null);
      } else {
        console.error('Failed to unpublish slide:', data.message);
        setIsUnpublishing(false);
        setShowUnpublishDialog(false);
        setSlideToUnpublish(null);
      }
    } catch (err) {
      console.error('Error unpublishing slide:', err);
      setIsUnpublishing(false);
      setShowUnpublishDialog(false);
      setSlideToUnpublish(null);
    }
  };

  // Cancel unpublish
  const handleCancelUnpublish = () => {
    setShowUnpublishDialog(false);
    setSlideToUnpublish(null);
  };

  // Toggle Spa Mode
  const toggleSpaMode = () => {
    setIsSpaPlaying(prev => !prev);
  };

  // Callback to receive playlist data from MainContent
  const updatePlaylistData = (rowId: string, delaySeconds: number, slides: Slide[], swiper: SwiperType | null, hasAudio: boolean) => {
    playlistDataRef.current = { rowId, delaySeconds, slides, swiper };
    setHasAudioSlides(hasAudio);
  };

  // Callback to update slide counter from MainContent
  const updateSlideCounter = (currentIndex: number, total: number) => {
    setCurrentSlideIndex(currentIndex + 1); // Convert 0-based to 1-based
    setTotalSlides(total);
  };

  // Get playlist data for toggle
  const getPlaylistData = () => {
    return playlistDataRef.current;
  };

  return (
    <PlaylistProvider>
      <div
        className="fixed inset-0 transition-all duration-500"
          style={activeSlideImageUrl ? {
            backgroundImage: `url(${activeSlideImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {
            backgroundColor: 'var(--content-bg)'
          }}
        >
          {/* Full viewport overlay (above background, below all content) */}
          <OverlayLayer
            activeSlideContentTheme={activeSlideContentTheme}
            activeSlideOverlayOpacity={activeSlideOverlayOpacity}
            activeSlideImageUrl={activeSlideImageUrl}
          />

          {/* YouTube video layer (behind content, above background image and overlay) */}
          <YouTubeEmbed videoUrl={activeSlideVideoUrl} displayMode={videoDisplayMode} />

          <SwiperProvider
            slidePrev={slidePrev}
            slideNext={slideNext}
            scrollUp={scrollUp}
            scrollDown={scrollDown}
            setHorizontalSwiper={setHorizontalSwiper}
            getHorizontalSwiper={getHorizontalSwiper}
            activeRowId={activeRowId}
          >
          <TopIconBar
            hasBackgroundImage={!!activeSlideImageUrl}
            isSpaPlaying={isSpaPlaying}
            onSpaToggle={toggleSpaMode}
            hasAudioSlides={hasAudioSlides}
            getPlaylistData={getPlaylistData}
            currentSlideIndex={currentSlideIndex}
            totalSlides={totalSlides}
          />
          <LeftIconBar hasBackgroundImage={!!activeSlideImageUrl} />
          <RightIconBar
            hasVideo={!!activeSlideVideoUrl}
            onVideoToggle={toggleVideoMode}
            videoMode={videoDisplayMode}
            hasBackgroundImage={!!activeSlideImageUrl}
            isQuickSlideMode={isQuickSlideMode}
            onAtrClick={toggleQuickSlideMode}
            onGroupClick={handleGroupClick}
          />
          <BottomIconBar
            hasBackgroundImage={!!activeSlideImageUrl}
            onQuickSlideClick={handleQuickSlideClick}
          />
          <MainContentWithRef
            setSwiperRef={setVerticalSwiperRef}
            handleSlideChange={handleSlideChange}
            setActiveRow={setActiveRow}
            setActiveSlideImageUrl={setActiveSlideImageUrl}
            setActiveSlideVideoUrl={setActiveSlideVideoUrl}
            activeSlideVideoUrl={activeSlideVideoUrl}
            setActiveSlideOverlayOpacity={setActiveSlideOverlayOpacity}
            setActiveSlideContentTheme={setActiveSlideContentTheme}
            isQuickSlideMode={isQuickSlideMode}
            onUnpublishDialogOpen={handleUnpublishDialogOpen}
            unpublishCallbackRef={mainContentUnpublishCallbackRef}
            updatePlaylistData={updatePlaylistData}
            updateSlideCounter={updateSlideCounter}
          />
        </SwiperProvider>

        {/* Quick Slide Modal */}
        <QuickSlideModal
          isOpen={isQuickSlideModalOpen}
          onClose={() => setIsQuickSlideModalOpen(false)}
          onSuccess={handleQuickSlideSuccess}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        {/* Logout Modal */}
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
        />

        {/* Unpublish Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showUnpublishDialog}
          onConfirm={handleConfirmUnpublish}
          onCancel={handleCancelUnpublish}
          title="Have you completed this slide?"
          message="Are you sure you want to complete this slide? It will no longer be visible to you."
          confirmText="Complete Slide"
          cancelText="Cancel"
          isProcessing={isUnpublishing}
        />

        {/* Spa Audio Player */}
        <SpaAudioPlayer isPlaying={isSpaPlaying} />
      </div>
    </PlaylistProvider>
  );
}

// Wrapper component to pass refs to MainContent
function MainContentWithRef({
  setSwiperRef,
  handleSlideChange,
  setActiveRow,
  setActiveSlideImageUrl,
  setActiveSlideVideoUrl,
  activeSlideVideoUrl,
  setActiveSlideOverlayOpacity,
  setActiveSlideContentTheme,
  isQuickSlideMode,
  onUnpublishDialogOpen,
  unpublishCallbackRef,
  updatePlaylistData,
  updateSlideCounter
}: {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
  setActiveRow: (rowId: string) => void;
  setActiveSlideImageUrl: (imageUrl: string | null) => void;
  setActiveSlideVideoUrl: (videoUrl: string | null) => void;
  activeSlideVideoUrl: string | null;
  setActiveSlideOverlayOpacity: (opacity: number) => void;
  setActiveSlideContentTheme: (theme: 'light' | 'dark' | null) => void;
  isQuickSlideMode: boolean;
  onUnpublishDialogOpen: (slideId: string, rowId: string) => void;
  unpublishCallbackRef: React.MutableRefObject<((slideId: string, rowId: string) => void) | null>;
  updatePlaylistData: (rowId: string, delaySeconds: number, slides: Slide[], swiper: SwiperType | null, hasAudio: boolean) => void;
  updateSlideCounter: (currentIndex: number, total: number) => void;
}) {
  return (
    <MainContent
      setSwiperRef={setSwiperRef}
      handleSlideChange={handleSlideChange}
      setActiveRow={setActiveRow}
      setActiveSlideImageUrl={setActiveSlideImageUrl}
      setActiveSlideVideoUrl={setActiveSlideVideoUrl}
      activeSlideVideoUrl={activeSlideVideoUrl}
      setActiveSlideOverlayOpacity={setActiveSlideOverlayOpacity}
      setActiveSlideContentTheme={setActiveSlideContentTheme}
      isQuickSlideMode={isQuickSlideMode}
      onUnpublishDialogOpen={onUnpublishDialogOpen}
      unpublishCallbackRef={unpublishCallbackRef}
      updatePlaylistData={updatePlaylistData}
      updateSlideCounter={updateSlideCounter}
    />
  );
}

// Component for full viewport overlay - sits inside ThemeProvider to access global theme
function OverlayLayer({
  activeSlideContentTheme,
  activeSlideOverlayOpacity,
  activeSlideImageUrl
}: {
  activeSlideContentTheme: 'light' | 'dark' | null;
  activeSlideOverlayOpacity: number;
  activeSlideImageUrl: string | null;
}) {
  // Get global theme from context
  const { theme: globalTheme } = useTheme();

  // Don't render if no opacity or no background image
  if (activeSlideOverlayOpacity === 0 || !activeSlideImageUrl) return null;

  // Use slide theme if explicitly set, otherwise fall back to global theme
  const effectiveTheme = activeSlideContentTheme || globalTheme;

  // Calculate overlay color based on effective theme
  const overlayColor = effectiveTheme === 'light'
    ? `rgba(255, 255, 255, ${activeSlideOverlayOpacity})` // White overlay for light theme
    : `rgba(0, 0, 0, ${activeSlideOverlayOpacity})`; // Black overlay for dark theme

  return (
    <div
      className="transition-all duration-500"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: overlayColor,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
}
