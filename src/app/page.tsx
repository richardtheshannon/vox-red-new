'use client';

import { useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import TopIconBar from '@/components/TopIconBar';
import LeftIconBar from '@/components/LeftIconBar';
import RightIconBar from '@/components/RightIconBar';
import BottomIconBar from '@/components/BottomIconBar';
import MainContent from '@/components/MainContent';
import { SwiperProvider } from '@/contexts/SwiperContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Home() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlideElement, setActiveSlideElement] = useState<HTMLElement | null>(null);

  const slidePrev = () => {
    console.log('slidePrev called, swiperRef:', swiperRef.current);
    swiperRef.current?.slidePrev();
  };

  const slideNext = () => {
    console.log('slideNext called, swiperRef:', swiperRef.current);
    swiperRef.current?.slideNext();
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

  const handleSlideChange = (swiper: SwiperType) => {
    // Add safety checks to prevent runtime errors
    if (!swiper || typeof swiper.activeIndex === 'undefined' || !swiper.slides) {
      return;
    }
    const activeSlide = swiper.slides[swiper.activeIndex];
    const scrollContainer = activeSlide?.querySelector('.h-full.overflow-y-auto') as HTMLElement;
    setActiveSlideElement(scrollContainer);
  };

  // Function to set swiper ref from MainContent
  const setSwiperRef = (swiper: SwiperType | null) => {
    swiperRef.current = swiper;
  };

  return (
    <ThemeProvider>
      <SwiperProvider slidePrev={slidePrev} slideNext={slideNext} scrollUp={scrollUp} scrollDown={scrollDown}>
        <TopIconBar />
        <LeftIconBar />
        <RightIconBar />
        <BottomIconBar />
        <MainContentWithRef setSwiperRef={setSwiperRef} handleSlideChange={handleSlideChange} />
      </SwiperProvider>
    </ThemeProvider>
  );
}

// Wrapper component to pass refs to MainContent
function MainContentWithRef({ setSwiperRef, handleSlideChange }: {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
}) {
  return <MainContent setSwiperRef={setSwiperRef} handleSlideChange={handleSlideChange} />;
}