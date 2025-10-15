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

export default function Home() {
  // Vertical swiper (for rows)
  const verticalSwiperRef = useRef<SwiperType | null>(null);

  // Horizontal swipers (for slides within each row)
  const horizontalSwipersRef = useRef<Record<string, SwiperType>>({});

  // Track active row and slide
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeSlideElement, setActiveSlideElement] = useState<HTMLElement | null>(null);
  const [activeSlideImageUrl, setActiveSlideImageUrl] = useState<string | null>(null);
  const [activeSlideVideoUrl, setActiveSlideVideoUrl] = useState<string | null>(null);
  const [videoDisplayMode, setVideoDisplayMode] = useState<'cover' | 'contained'>('cover');

  // Navigation functions for footer arrows
  const slidePrev = () => {
    console.log('slidePrev called');

    // Try to navigate within the current row's horizontal swiper first
    if (activeRowId && horizontalSwipersRef.current[activeRowId]) {
      const horizontalSwiper = horizontalSwipersRef.current[activeRowId];

      // If we're not at the beginning of the horizontal swiper, go to previous slide
      if (horizontalSwiper.activeIndex > 0) {
        horizontalSwiper.slidePrev();
        return;
      }
    }

    // If we're at the beginning of horizontal swiper, navigate to previous row
    verticalSwiperRef.current?.slidePrev();
  };

  const slideNext = () => {
    console.log('slideNext called');

    // Try to navigate within the current row's horizontal swiper first
    if (activeRowId && horizontalSwipersRef.current[activeRowId]) {
      const horizontalSwiper = horizontalSwipersRef.current[activeRowId];

      // If we're not at the end of the horizontal swiper, go to next slide
      if (horizontalSwiper.activeIndex < horizontalSwiper.slides.length - 1) {
        horizontalSwiper.slideNext();
        return;
      }
    }

    // If we're at the end of horizontal swiper, navigate to next row
    verticalSwiperRef.current?.slideNext();
  };

  const scrollUp = () => {
    if (activeSlideElement) {
      activeSlideElement.scrollBy({ top: -200, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (activeSlideElement) {
      activeSlideElement.scrollBy({ top: 200, behavior: 'smooth' });
    }
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

    const activeSlide = swiper.slides[swiper.activeIndex];
    const scrollContainer = activeSlide?.querySelector('.h-full.overflow-y-auto') as HTMLElement;
    setActiveSlideElement(scrollContainer);
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

  return (
    <ThemeProvider>
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
          <TopIconBar />
          <LeftIconBar />
          <RightIconBar
            hasVideo={!!activeSlideVideoUrl}
            onVideoToggle={toggleVideoMode}
            videoMode={videoDisplayMode}
          />
          <BottomIconBar />
          <MainContentWithRef
            setSwiperRef={setVerticalSwiperRef}
            handleSlideChange={handleSlideChange}
            setActiveRow={setActiveRow}
            setActiveSlideImageUrl={setActiveSlideImageUrl}
            setActiveSlideVideoUrl={setActiveSlideVideoUrl}
          />
        </SwiperProvider>
      </div>
    </ThemeProvider>
  );
}

// Wrapper component to pass refs to MainContent
function MainContentWithRef({
  setSwiperRef,
  handleSlideChange,
  setActiveRow,
  setActiveSlideImageUrl,
  setActiveSlideVideoUrl
}: {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
  setActiveRow: (rowId: string) => void;
  setActiveSlideImageUrl: (imageUrl: string | null) => void;
  setActiveSlideVideoUrl: (videoUrl: string | null) => void;
}) {
  return (
    <MainContent
      setSwiperRef={setSwiperRef}
      handleSlideChange={handleSlideChange}
      setActiveRow={setActiveRow}
      setActiveSlideImageUrl={setActiveSlideImageUrl}
      setActiveSlideVideoUrl={setActiveSlideVideoUrl}
    />
  );
}
