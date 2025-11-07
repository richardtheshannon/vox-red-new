'use client';

import { useEffect, useRef, useState, memo } from 'react';

interface EssentialAudioPlayerProps {
  audioUrl: string;
  slideId?: string;
  rowId?: string;
  loop?: boolean;
  scratch?: boolean;
  preload?: boolean;
  className?: string;
  onAudioRefChange?: (ref: HTMLAudioElement | null) => void;
}

function EssentialAudioPlayer({
  audioUrl,
  slideId,
  rowId,
  loop = false,
  scratch = false,
  preload = true,
  className = "",
  onAudioRefChange
}: EssentialAudioPlayerProps) {
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaylistActive, setIsPlaylistActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Notify parent when audio ref changes and client-side rendering is ready
  useEffect(() => {
    console.log('[AudioPlayer] useEffect running:', {
      isClient,
      hasAudioRef: !!audioRef.current,
      hasCallback: !!onAudioRefChange,
      audioUrl,
      audioRefSrc: audioRef.current?.src,
      audioRefReadyState: audioRef.current?.readyState
    });

    if (isClient && audioRef.current && onAudioRefChange) {
      console.log('[AudioPlayer] ✅ Calling onAudioRefChange with audio ref - URL:', audioUrl);
      onAudioRefChange(audioRef.current);
    } else {
      console.log('[AudioPlayer] ⚠️ Not calling onAudioRefChange:', {
        reason: !isClient ? 'not client-side yet' : !audioRef.current ? 'no audioRef' : 'no callback'
      });
    }

    return () => {
      if (onAudioRefChange) {
        console.log('[AudioPlayer] 🧹 Cleanup: Clearing audio ref from parent - URL:', audioUrl);
        onAudioRefChange(null);
      }
    };
  }, [isClient, audioUrl, onAudioRefChange]); // Re-run when client status, URL, or callback changes

  // Listen for playlist events
  useEffect(() => {
    if (!slideId || !rowId || !isClient) return;

    const handlePlaylistEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { slideId: activeSlideId, rowId: activeRowId, action } = customEvent.detail;

      const audio = audioRef.current;
      if (!audio) return;

      // Handle stopAll action (stops ALL audio players regardless of row)
      if (action === 'stopAll') {
        console.log('[AudioPlayer] Received stopAll - stopping audio for slide:', slideId, 'in row:', rowId);
        audio.pause();
        audio.currentTime = 0;
        setIsPlaylistActive(false);
        return;
      }

      // For all other actions, only respond to events for our row
      if (!activeRowId || !rowId || activeRowId !== rowId) {
        console.log('[AudioPlayer] Event IGNORED - rowId mismatch:', {
          mySlideId: slideId,
          myRowId: rowId,
          eventSlideId: activeSlideId,
          eventRowId: activeRowId,
          action
        });
        return;
      }

      console.log('[AudioPlayer] Event ACCEPTED - processing for row:', {
        slideId,
        activeSlideId,
        rowId,
        activeRowId,
        action,
        isMatch: activeSlideId === slideId
      });

      // Handle different actions
      if (action === 'pause') {
        // Pause all audio in this row
        audio.pause();
        setIsPlaylistActive(false);
        return;
      }

      if (action === 'stop') {
        // Stop and reset all audio in this row
        audio.pause();
        audio.currentTime = 0;
        setIsPlaylistActive(false);
        return;
      }

      // Check if this is the active slide
      if (activeSlideId === slideId) {
        setIsPlaylistActive(true);

        if (action === 'resume') {
          // Resume from current position
          console.log('[AudioPlayer] Resuming playback for slide:', slideId);
          audio.play().catch(err => {
            console.error('[AudioPlayer] Failed to resume:', err);
          });
        } else {
          // Start from beginning
          console.log('[AudioPlayer] Starting playback for slide:', slideId);
          audio.currentTime = 0;
          audio.play().catch(err => {
            console.error('[AudioPlayer] Failed to play:', err);
          });
        }

        // Attach ended event listener to trigger playlist advancement
        const handleEnded = () => {
          console.log('[AudioPlayer] Audio ended for slide:', slideId);

          // Broadcast 'ended' event to PlaylistContext
          window.dispatchEvent(new CustomEvent('playlistAudioEnded', {
            detail: {
              slideId,
              rowId
            }
          }));
        };

        audio.addEventListener('ended', handleEnded, { once: true });
      } else if (isPlaylistActive) {
        // This slide was active but now another slide is active
        audio.pause();
        setIsPlaylistActive(false);
      }
    };

    window.addEventListener('autoRowPlayTrackActive', handlePlaylistEvent);

    return () => {
      window.removeEventListener('autoRowPlayTrackActive', handlePlaylistEvent);
    };
  }, [slideId, rowId, isClient, isPlaylistActive]);

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
        data-slide-id={slideId}
        data-row-id={rowId}
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
  // Only re-render if audioUrl or other props change (excluding callback)
  return prevProps.audioUrl === nextProps.audioUrl &&
         prevProps.slideId === nextProps.slideId &&
         prevProps.rowId === nextProps.rowId &&
         prevProps.loop === nextProps.loop &&
         prevProps.scratch === nextProps.scratch &&
         prevProps.preload === nextProps.preload &&
         prevProps.className === nextProps.className;
  // Note: We don't compare onAudioRefChange as it may change on every render
});