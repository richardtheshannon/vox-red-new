'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Swiper as SwiperType } from 'swiper';

interface SwiperContextType {
  slidePrev: () => void;
  slideNext: () => void;
  scrollUp: () => void;
  scrollDown: () => void;
  // New multi-level navigation
  setHorizontalSwiper: (rowId: string, swiper: SwiperType) => void;
  getHorizontalSwiper: (rowId: string) => SwiperType | null;
  activeRowId: string | null;
}

const SwiperContext = createContext<SwiperContextType | null>(null);

export const useSwiperContext = () => {
  const context = useContext(SwiperContext);
  if (!context) {
    return {
      slidePrev: () => {},
      slideNext: () => {},
      scrollUp: () => {},
      scrollDown: () => {},
      setHorizontalSwiper: () => {},
      getHorizontalSwiper: () => null,
      activeRowId: null
    };
  }
  return context;
};

interface SwiperProviderProps {
  children: ReactNode;
  slidePrev: () => void;
  slideNext: () => void;
  scrollUp: () => void;
  scrollDown: () => void;
  setHorizontalSwiper: (rowId: string, swiper: SwiperType) => void;
  getHorizontalSwiper: (rowId: string) => SwiperType | null;
  activeRowId: string | null;
}

export const SwiperProvider = ({
  children,
  slidePrev,
  slideNext,
  scrollUp,
  scrollDown,
  setHorizontalSwiper,
  getHorizontalSwiper,
  activeRowId
}: SwiperProviderProps) => {
  return (
    <SwiperContext.Provider value={{
      slidePrev,
      slideNext,
      scrollUp,
      scrollDown,
      setHorizontalSwiper,
      getHorizontalSwiper,
      activeRowId
    }}>
      {children}
    </SwiperContext.Provider>
  );
};