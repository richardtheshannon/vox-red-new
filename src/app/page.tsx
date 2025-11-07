'use client';

import { useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import TopIconBar from '@/components/TopIconBar';
import LeftIconBar from '@/components/LeftIconBar';
import RightIconBar from '@/components/RightIconBar';
import BottomIconBar from '@/components/BottomIconBar';
import MainContent from '@/components/MainContent';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { SwiperProvider } from '@/contexts/SwiperContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PlaylistProvider } from '@/contexts/PlaylistContext';
import QuickSlideModal from '@/components/QuickSlideModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import SpaAudioPlayer from '@/components/SpaAudioPlayer';

export default function Home() {
  // Vertical swiper (for rows)
  const verticalSwiperRef = useRef<SwiperType | null>(null);

  // Horizontal swipers (for slides within each row)
  const horizontalSwipersRef = useRef<Record<string, SwiperType>>({});

  // Track active row and slide
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeSlideImageUrl, setActiveSlideImageUrl] = useState<string | null>(null);
  const [activeSlideVideoUrl, setActiveSlideVideoUrl] = useState<string | null>(null);
  const [videoDisplayMode, setVideoDisplayMode] = useState<'cover' | 'contained'>('cover');

  // Quick Slide Modal state
  const [isQuickSlideModalOpen, setIsQuickSlideModalOpen] = useState(false);

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
    slides: any[];
    swiper: SwiperType | null;
  }>({ rowId: null, delaySeconds: 0, slides: [], swiper: null });
  const [hasAudioSlides, setHasAudioSlides] = useState(false);

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
  const updatePlaylistData = (rowId: string, delaySeconds: number, slides: any[], swiper: SwiperType | null, hasAudio: boolean) => {
    playlistDataRef.current = { rowId, delaySeconds, slides, swiper };
    setHasAudioSlides(hasAudio);
  };

  // Get playlist data for toggle
  const getPlaylistData = () => {
    return playlistDataRef.current;
  };

  return (
    <ThemeProvider>
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
          {/* YouTube video layer (behind content, above background image) */}
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
          />
          <LeftIconBar hasBackgroundImage={!!activeSlideImageUrl} />
          <RightIconBar
            hasVideo={!!activeSlideVideoUrl}
            onVideoToggle={toggleVideoMode}
            videoMode={videoDisplayMode}
            hasBackgroundImage={!!activeSlideImageUrl}
            isQuickSlideMode={isQuickSlideMode}
            onAtrClick={toggleQuickSlideMode}
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
            isQuickSlideMode={isQuickSlideMode}
            onUnpublishDialogOpen={handleUnpublishDialogOpen}
            unpublishCallbackRef={mainContentUnpublishCallbackRef}
            updatePlaylistData={updatePlaylistData}
          />
        </SwiperProvider>

        {/* Quick Slide Modal */}
        <QuickSlideModal
          isOpen={isQuickSlideModalOpen}
          onClose={() => setIsQuickSlideModalOpen(false)}
          onSuccess={handleQuickSlideSuccess}
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
    </ThemeProvider>
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
  isQuickSlideMode,
  onUnpublishDialogOpen,
  unpublishCallbackRef,
  updatePlaylistData
}: {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
  setActiveRow: (rowId: string) => void;
  setActiveSlideImageUrl: (imageUrl: string | null) => void;
  setActiveSlideVideoUrl: (videoUrl: string | null) => void;
  activeSlideVideoUrl: string | null;
  isQuickSlideMode: boolean;
  onUnpublishDialogOpen: (slideId: string, rowId: string) => void;
  unpublishCallbackRef: React.MutableRefObject<((slideId: string, rowId: string) => void) | null>;
  updatePlaylistData: (rowId: string, delaySeconds: number, slides: any[], swiper: SwiperType | null, hasAudio: boolean) => void;
}) {
  return (
    <MainContent
      setSwiperRef={setSwiperRef}
      handleSlideChange={handleSlideChange}
      setActiveRow={setActiveRow}
      setActiveSlideImageUrl={setActiveSlideImageUrl}
      setActiveSlideVideoUrl={setActiveSlideVideoUrl}
      activeSlideVideoUrl={activeSlideVideoUrl}
      isQuickSlideMode={isQuickSlideMode}
      onUnpublishDialogOpen={onUnpublishDialogOpen}
      unpublishCallbackRef={unpublishCallbackRef}
      updatePlaylistData={updatePlaylistData}
    />
  );
}
