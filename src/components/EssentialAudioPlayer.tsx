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
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  console.log('[AudioPlayer] Rendering HTML5 audio player - URL:', audioUrl);

  return (
    <div className={`my-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        controls
        loop={loop}
        preload={preload ? 'auto' : 'metadata'}
        className="w-full"
        style={{
          maxWidth: '100%',
          height: '48px',
        }}
        onError={(e) => {
          console.error('[AudioPlayer] Audio load error:', e);
          setLoadError('Failed to load audio file');
        }}
        onLoadedMetadata={() => {
          console.log('[AudioPlayer] Audio loaded successfully:', audioUrl);
        }}
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