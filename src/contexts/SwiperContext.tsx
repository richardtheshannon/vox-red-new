'use client';

import { createContext, useContext, ReactNode } from 'react';

interface SwiperContextType {
  slidePrev: () => void;
  slideNext: () => void;
  scrollUp: () => void;
  scrollDown: () => void;
}

const SwiperContext = createContext<SwiperContextType | null>(null);

export const useSwiperContext = () => {
  const context = useContext(SwiperContext);
  if (!context) {
    return {
      slidePrev: () => {},
      slideNext: () => {},
      scrollUp: () => {},
      scrollDown: () => {}
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
}

export const SwiperProvider = ({ children, slidePrev, slideNext, scrollUp, scrollDown }: SwiperProviderProps) => {
  return (
    <SwiperContext.Provider value={{ slidePrev, slideNext, scrollUp, scrollDown }}>
      {children}
    </SwiperContext.Provider>
  );
};