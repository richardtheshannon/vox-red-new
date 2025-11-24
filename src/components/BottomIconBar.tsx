'use client';

import { useSwiperContext } from '@/contexts/SwiperContext';
import { useSession } from 'next-auth/react';

interface BottomIconBarProps {
  hasBackgroundImage?: boolean;
  onRefreshClick?: () => void;
  isOfflineReady?: boolean;
}

export default function BottomIconBar({ hasBackgroundImage = false, onRefreshClick, isOfflineReady = false }: BottomIconBarProps) {
  const { data: session } = useSession();
  const { slidePrev, slideNext, scrollUp, scrollDown } = useSwiperContext();
  console.log('BottomIconBar context methods:', { slidePrev, slideNext, scrollUp, scrollDown });

  return (
    <footer className={`icon-container fixed bottom-0 left-0 right-0 flex justify-between items-center z-20 ${hasBackgroundImage ? 'no-gradient' : ''}`} style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        {session && (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <span
              className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
              title={isOfflineReady ? "Update offline content" : "Download for offline use"}
              onClick={onRefreshClick}
              style={{
                color: isOfflineReady ? '#22c55e' : undefined
              }}
            >
              refresh
            </span>
            {isOfflineReady && (
              <span
                className="material-symbols-rounded"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  fontSize: '12px',
                  color: '#22c55e',
                  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 12"
                }}
                title="Offline ready"
              >
                check_circle
              </span>
            )}
          </div>
        )}
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Scroll Up"
          onClick={scrollUp}
        >
          arrow_circle_up
        </span>
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Scroll Down"
          onClick={scrollDown}
        >
          arrow_circle_down
        </span>
      </div>
      <div className="flex items-center">
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Previous Slide"
          onClick={() => {
            console.log('Left arrow clicked');
            slidePrev();
          }}
        >
          arrow_circle_left
        </span>
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Next Slide"
          onClick={() => {
            console.log('Right arrow clicked');
            slideNext();
          }}
        >
          arrow_circle_right
        </span>
        {session && (
          <span className="material-symbols-outlined" title="Bottom Panel Open">bottom_panel_open</span>
        )}
        <span className="material-symbols-outlined" title="Menu">menu</span>
      </div>
    </footer>
  );
}