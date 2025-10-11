'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import EssentialAudioPlayer from './EssentialAudioPlayer';

interface MainContentProps {
  setSwiperRef: (swiper: SwiperType | null) => void;
  handleSlideChange: (swiper: SwiperType) => void;
}

export default function MainContent({ setSwiperRef, handleSlideChange }: MainContentProps) {
  return (
      <main className="absolute inset-0 overflow-hidden" style={{padding: '50px'}}>
      <div className="hidden md:block h-full">
        {/* Full width main content with Swiper */}
        <div className="h-full">
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            className="h-full"
            onSwiper={(swiper) => {
              console.log('Desktop Swiper initialized:', swiper);
              setSwiperRef(swiper);
              // Initialize with first slide
              setTimeout(() => handleSlideChange(swiper), 100);
            }}
            onSlideChange={handleSlideChange}
          >
            <SwiperSlide>
              <div className="h-full overflow-y-auto p-4 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4 text-black">Audio Library</h1>
                <EssentialAudioPlayer
                  audioUrl="/media/meditation-sample.mp3"
                  preload={true}
                  className="max-w-md"
                />
                <p className="text-black">
                  Browse meditation tracks, yoga sessions, and spiritual courses.
                </p>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="h-full overflow-y-auto p-4 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4 text-black">Playlists</h1>
                <EssentialAudioPlayer
                  audioUrl="/media/playlist-sample.mp3"
                  preload={true}
                  className="max-w-md"
                />
                <p className="text-black">
                  Create and manage your personal playlists. Organize your favorite content by mood, activity, or spiritual practice.
                </p>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="h-full overflow-y-auto p-4 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4 text-black">Service Commitments</h1>
                <EssentialAudioPlayer
                  audioUrl="/media/service-sample.mp3"
                  preload={true}
                  className="max-w-md"
                />
                <p className="text-black">
                  Daily service prompts and spiritual practices to deepen your journey and commitment to growth.
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      {/* Mobile fallback with Swiper */}
      <div className="md:hidden h-full">
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          className="h-full"
          onSwiper={(swiper) => {
            // Only set ref for mobile if we're actually on mobile
            if (window.innerWidth < 768) {
              setSwiperRef(swiper);
              setTimeout(() => handleSlideChange(swiper), 100);
            }
          }}
          onSlideChange={handleSlideChange}
        >
          <SwiperSlide>
            <div className="h-full overflow-y-auto p-4 flex flex-col justify-center items-start">
              <h1 className="text-4xl font-bold mb-4 text-black">Audio Library</h1>
              <EssentialAudioPlayer
                audioUrl="/media/meditation-sample.mp3"
                preload={true}
                className="w-full max-w-md mb-4"
              />
              <p className="text-black">
                Browse meditation tracks, yoga sessions, and spiritual courses.
              </p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="h-full overflow-y-auto p-4 flex flex-col justify-center items-start">
              <h1 className="text-4xl font-bold mb-4 text-black">Playlists</h1>
              <EssentialAudioPlayer
                audioUrl="/media/playlist-sample.mp3"
                preload={true}
                className="w-full max-w-md mb-4"
              />
              <p className="text-black">
                Create and manage your personal playlists. Organize your favorite content by mood, activity, or spiritual practice.
              </p>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="h-full overflow-y-auto p-4 flex flex-col justify-center items-start">
              <h1 className="text-4xl font-bold mb-4 text-black">Service Commitments</h1>
              <EssentialAudioPlayer
                audioUrl="/media/service-sample.mp3"
                preload={true}
                className="w-full max-w-md mb-4"
              />
              <p className="text-black">
                Daily service prompts and spiritual practices to deepen your journey and commitment to growth.
              </p>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </main>
  );
}