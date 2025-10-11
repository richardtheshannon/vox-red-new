'use client';

import { useEffect, useRef, useState } from 'react';

interface EssentialAudioPlayerProps {
  audioUrl: string;
  loop?: boolean;
  scratch?: boolean;
  preload?: boolean;
  className?: string;
}

export default function EssentialAudioPlayer({
  audioUrl,
  loop = false,
  scratch = false,
  preload = true,
  className = ""
}: EssentialAudioPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag to true after component mounts
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Initialize Essential Audio Player only on client side
    if (isClient && typeof window !== 'undefined') {
      const essentialAudio = (window as unknown as { Essential_Audio?: { init: () => void } }).Essential_Audio;
      if (essentialAudio) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          essentialAudio.init();
        }, 100);
      }
    }
  }, [isClient]);

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

  const playerProps: Record<string, string> = {
    'data-url': audioUrl,
  };

  if (loop) playerProps['data-loop'] = '';
  if (scratch) playerProps['data-scratch'] = '';
  if (preload) playerProps['data-preload'] = '';

  return (
    <div className={`my-4 ${className}`}>
      <div
        ref={playerRef}
        className="essential_audio"
        {...playerProps}
      />
    </div>
  );
}