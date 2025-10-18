'use client';

import { useEffect, useRef, useState, memo } from 'react';

interface EssentialAudioPlayerProps {
  audioUrl: string;
  loop?: boolean;
  scratch?: boolean;
  preload?: boolean;
  className?: string;
}

function EssentialAudioPlayer({
  audioUrl,
  loop = false,
  scratch = false,
  preload = true,
  className = ""
}: EssentialAudioPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Set client flag to true after component mounts
    setIsClient(true);

    // Check if Essential Audio is available
    if (typeof window !== 'undefined' && !hasInitialized.current) {
      const essentialAudio = (window as unknown as { Essential_Audio?: { init: () => void; Audio?: object } }).Essential_Audio;
      if (!essentialAudio) {
        console.error('[AudioPlayer] Essential_Audio not found');
        setLoadError('Audio player library not loaded');
      } else {
        // Check if Essential Audio has already initialized players
        const audioPlayers = essentialAudio.Audio;
        const needsInit = !audioPlayers || Object.keys(audioPlayers).length === 0;

        if (needsInit) {
          hasInitialized.current = true;
          const timer = setTimeout(() => {
            try {
              essentialAudio.init();
              console.log('[AudioPlayer] Initialized Essential Audio');
            } catch (error) {
              console.error('[AudioPlayer] Init failed:', error);
            }
          }, 300);

          return () => clearTimeout(timer);
        } else {
          console.log('[AudioPlayer] Essential Audio already initialized');
        }
      }
    }
  }, []); // Empty deps - only run once per mount

  // Show error state if audio failed to load
  if (loadError) {
    return (
      <div className={`my-4 ${className}`}>
        <div className="h-12 bg-red-100 rounded flex items-center justify-start pl-4">
          <span className="text-red-600 text-sm">{loadError} - Check console for details</span>
        </div>
      </div>
    );
  }

  // Don't render audio player on server side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={`my-4 ${className}`}>
        <div className="h-12 bg-gray-100 rounded flex items-center justify-start pl-4">
          <span className="text-gray-500">Loading audio player...</span>
        </div>
      </div>
    );
  }

  // Validate audio URL
  if (!audioUrl || audioUrl.trim() === '') {
    console.warn('[AudioPlayer] Empty or invalid audio URL provided');
    return (
      <div className={`my-4 ${className}`}>
        <div className="h-12 bg-yellow-100 rounded flex items-center justify-start pl-4">
          <span className="text-yellow-700 text-sm">No audio file specified</span>
        </div>
      </div>
    );
  }

  const playerProps: Record<string, string> = {
    'data-url': audioUrl,
  };

  if (loop) playerProps['data-loop'] = '';
  if (scratch) playerProps['data-scratch'] = '';
  if (preload) playerProps['data-preload'] = '';

  console.log('[AudioPlayer] Rendering player - URL:', audioUrl);

  return (
    <div className={`my-4 ${className}`}>
      <div
        key={audioUrl}
        ref={playerRef}
        className="essential_audio"
        {...playerProps}
      />
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(EssentialAudioPlayer, (prevProps, nextProps) => {
  // Only re-render if audioUrl changes
  return prevProps.audioUrl === nextProps.audioUrl &&
         prevProps.loop === nextProps.loop &&
         prevProps.scratch === nextProps.scratch &&
         prevProps.preload === nextProps.preload &&
         prevProps.className === nextProps.className;
});