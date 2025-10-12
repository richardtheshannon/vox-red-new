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
                <div className="flex justify-start gap-4 mb-4">
                  <span className="material-symbols-rounded text-2xl">check_circle</span>
                  <span className="material-symbols-rounded text-2xl">schedule</span>
                  <span className="material-symbols-rounded text-2xl">check_box</span>
                </div>
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
                <div className="flex justify-start gap-4 mb-4">
                  <span className="material-symbols-rounded text-2xl">check_circle</span>
                  <span className="material-symbols-rounded text-2xl">schedule</span>
                  <span className="material-symbols-rounded text-2xl">check_box</span>
                </div>
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
                <div className="flex justify-start gap-4 mb-4">
                  <span className="material-symbols-rounded text-2xl">check_circle</span>
                  <span className="material-symbols-rounded text-2xl">schedule</span>
                  <span className="material-symbols-rounded text-2xl">check_box</span>
                </div>
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

            <SwiperSlide>
              <div className="h-full overflow-y-auto p-4 flex flex-col justify-center">
                <div className="flex justify-start gap-4 mb-4">
                  <span className="material-symbols-rounded text-2xl">check_circle</span>
                  <span className="material-symbols-rounded text-2xl">schedule</span>
                  <span className="material-symbols-rounded text-2xl">check_box</span>
                </div>
                <h1 className="text-4xl font-bold mb-4 text-black">Spiritual Teachings</h1>
                <EssentialAudioPlayer
                  audioUrl="/media/meditation-sample.mp3"
                  preload={true}
                  className="max-w-md mb-4"
                />
                <div className="text-black space-y-4">
                  <p>Welcome to our comprehensive collection of spiritual teachings and wisdom traditions that have guided seekers for millennia. These ancient practices offer profound insights into the nature of consciousness, the path to inner peace, and the cultivation of compassion in daily life.</p>

                  <p>The journey of spiritual development begins with self-awareness and the recognition that true fulfillment comes not from external circumstances, but from inner transformation. Through meditation, contemplation, and mindful living, we develop the capacity to observe our thoughts, emotions, and reactions without becoming entangled in them.</p>

                  <p>Eastern wisdom traditions such as Buddhism, Hinduism, and Taoism emphasize the interconnectedness of all beings and the illusion of separateness that causes suffering. The Buddhist concept of emptiness teaches that all phenomena arise through interdependence, without inherent existence. This understanding naturally leads to compassion for all sentient beings.</p>

                  <p>The practice of mindfulness, derived from ancient Buddhist meditation techniques, has been proven by modern neuroscience to literally rewire the brain, increasing areas associated with attention, emotional regulation, and empathy while decreasing the activity in regions linked to anxiety and stress.</p>

                  <p>Western contemplative traditions, including Christian mysticism, Jewish Kabbalah, and Islamic Sufism, offer complementary approaches to spiritual development. These paths emphasize the direct experience of the divine through prayer, contemplation, and surrender of the ego-mind to a higher reality.</p>

                  <p>The Hindu tradition of Advaita Vedanta points to the fundamental truth that individual consciousness and universal consciousness are one and the same. This recognition, achieved through inquiry and meditation, dissolves the illusion of separation and reveals our true nature as pure awareness.</p>

                  <p>In the Zen tradition, enlightenment is understood as the sudden recognition of what has always been present - our original Buddha nature. Through the practice of sitting meditation (zazen) and koan study, practitioners develop the ability to see beyond the conceptual mind to the reality that underlies all experience.</p>

                  <p>The Sufi path emphasizes the purification of the heart through love, remembrance of the divine, and service to others. The whirling meditation of the dervishes, the poetry of Rumi and Hafez, and the practice of dhikr (remembrance) all serve to dissolve the ego and awaken divine consciousness.</p>

                  <p>Contemporary spiritual teachers like Eckhart Tolle, Adyashanti, and Rupert Spira have made these ancient teachings accessible to modern seekers, emphasizing the simplicity of awakening to our true nature in the present moment. Their teachings point to the fact that what we seek is not something to be attained in the future, but recognized as our current reality.</p>

                  <p>The practice of yoga, literally meaning &ldquo;union,&rdquo; offers a complete system for physical, mental, and spiritual development. Through asanas (postures), pranayama (breath work), and meditation, practitioners prepare the body and mind for deeper states of consciousness and ultimately, samadhi or union with the divine.</p>

                  <p>Sacred texts such as the Bhagavad Gita, the Tao Te Ching, the Bible, the Quran, and the Buddhist sutras contain timeless wisdom that speaks to the deepest questions of human existence. Regular study and contemplation of these texts, combined with personal practice, provides guidance for navigating the challenges of spiritual growth.</p>

                  <p>The cultivation of virtues such as patience, compassion, humility, and wisdom naturally arises as we deepen our spiritual practice. These qualities are not mere ethical guidelines but spontaneous expressions of our awakened nature, manifesting as we align more closely with truth and love.</p>
                </div>
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
              <div className="flex justify-start gap-4 mb-4 w-full">
                <span className="material-symbols-rounded text-2xl">check_circle</span>
                <span className="material-symbols-rounded text-2xl">schedule</span>
                <span className="material-symbols-rounded text-2xl">check_box</span>
              </div>
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
              <div className="flex justify-start gap-4 mb-4 w-full">
                <span className="material-symbols-rounded text-2xl">check_circle</span>
                <span className="material-symbols-rounded text-2xl">schedule</span>
                <span className="material-symbols-rounded text-2xl">check_box</span>
              </div>
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
              <div className="flex justify-start gap-4 mb-4 w-full">
                <span className="material-symbols-rounded text-2xl">check_circle</span>
                <span className="material-symbols-rounded text-2xl">schedule</span>
                <span className="material-symbols-rounded text-2xl">check_box</span>
              </div>
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

          <SwiperSlide>
            <div className="h-full overflow-y-auto p-4 flex flex-col justify-center items-start">
              <div className="flex justify-start gap-4 mb-4 w-full">
                <span className="material-symbols-rounded text-2xl">check_circle</span>
                <span className="material-symbols-rounded text-2xl">schedule</span>
                <span className="material-symbols-rounded text-2xl">check_box</span>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-black">Spiritual Teachings</h1>
              <EssentialAudioPlayer
                audioUrl="/media/meditation-sample.mp3"
                preload={true}
                className="w-full max-w-md mb-4"
              />
              <div className="text-black space-y-4">
                <p>Welcome to our comprehensive collection of spiritual teachings and wisdom traditions that have guided seekers for millennia. These ancient practices offer profound insights into the nature of consciousness, the path to inner peace, and the cultivation of compassion in daily life.</p>

                <p>The journey of spiritual development begins with self-awareness and the recognition that true fulfillment comes not from external circumstances, but from inner transformation. Through meditation, contemplation, and mindful living, we develop the capacity to observe our thoughts, emotions, and reactions without becoming entangled in them.</p>

                <p>Eastern wisdom traditions such as Buddhism, Hinduism, and Taoism emphasize the interconnectedness of all beings and the illusion of separateness that causes suffering. The Buddhist concept of emptiness teaches that all phenomena arise through interdependence, without inherent existence. This understanding naturally leads to compassion for all sentient beings.</p>

                <p>The practice of mindfulness, derived from ancient Buddhist meditation techniques, has been proven by modern neuroscience to literally rewire the brain, increasing areas associated with attention, emotional regulation, and empathy while decreasing the activity in regions linked to anxiety and stress.</p>

                <p>Western contemplative traditions, including Christian mysticism, Jewish Kabbalah, and Islamic Sufism, offer complementary approaches to spiritual development. These paths emphasize the direct experience of the divine through prayer, contemplation, and surrender of the ego-mind to a higher reality.</p>

                <p>The Hindu tradition of Advaita Vedanta points to the fundamental truth that individual consciousness and universal consciousness are one and the same. This recognition, achieved through inquiry and meditation, dissolves the illusion of separation and reveals our true nature as pure awareness.</p>

                <p>In the Zen tradition, enlightenment is understood as the sudden recognition of what has always been present - our original Buddha nature. Through the practice of sitting meditation (zazen) and koan study, practitioners develop the ability to see beyond the conceptual mind to the reality that underlies all experience.</p>

                <p>The Sufi path emphasizes the purification of the heart through love, remembrance of the divine, and service to others. The whirling meditation of the dervishes, the poetry of Rumi and Hafez, and the practice of dhikr (remembrance) all serve to dissolve the ego and awaken divine consciousness.</p>

                <p>Contemporary spiritual teachers like Eckhart Tolle, Adyashanti, and Rupert Spira have made these ancient teachings accessible to modern seekers, emphasizing the simplicity of awakening to our true nature in the present moment. Their teachings point to the fact that what we seek is not something to be attained in the future, but recognized as our current reality.</p>

                <p>The practice of yoga, literally meaning &ldquo;union,&rdquo; offers a complete system for physical, mental, and spiritual development. Through asanas (postures), pranayama (breath work), and meditation, practitioners prepare the body and mind for deeper states of consciousness and ultimately, samadhi or union with the divine.</p>

                <p>Sacred texts such as the Bhagavad Gita, the Tao Te Ching, the Bible, the Quran, and the Buddhist sutras contain timeless wisdom that speaks to the deepest questions of human existence. Regular study and contemplation of these texts, combined with personal practice, provides guidance for navigating the challenges of spiritual growth.</p>

                <p>The cultivation of virtues such as patience, compassion, humility, and wisdom naturally arises as we deepen our spiritual practice. These qualities are not mere ethical guidelines but spontaneous expressions of our awakened nature, manifesting as we align more closely with truth and love.</p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </main>
  );
}