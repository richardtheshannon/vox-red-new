'use client';

import { useEffect, useRef, useState } from 'react';
import { SpaTrack } from '@/lib/queries/spaTracks';

interface SpaAudioPlayerProps {
  isPlaying: boolean;
  onLoadError?: () => void;
}

/**
 * SpaAudioPlayer component
 * Plays background ambient music based on scheduled spa tracks
 * Server handles all schedule filtering (day/time restrictions)
 * Automatically reloads every 5 minutes to respect schedule changes
 */
export default function SpaAudioPlayer({ isPlaying, onLoadError }: SpaAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpaTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Component mount logging
  useEffect(() => {
    const now = new Date();
    console.log('[SpaAudioPlayer] Component mounted at:', now.toLocaleTimeString(), {
      currentTime: `${now.getHours()}:${now.getMinutes()}`,
      isPlaying,
    });
    return () => {
      console.log('[SpaAudioPlayer] Component unmounting');
    };
  }, []);

  // Load active track on mount
  useEffect(() => {
    console.log('[SpaAudioPlayer] Initial load - calling loadActiveTrack()');
    loadActiveTrack();
  }, []);

  // Periodic reload to respect time-based schedule changes
  // Re-checks every 5 minutes to ensure tracks respect publish_time_start/end boundaries
  useEffect(() => {
    const RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

    console.log('[SpaAudioPlayer] Setting up periodic reload interval (5 minutes)');
    const intervalId = setInterval(() => {
      console.log('[SpaAudioPlayer] Periodic reload triggered - calling loadActiveTrack()');
      loadActiveTrack();
    }, RELOAD_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      console.log('[SpaAudioPlayer] Clearing periodic reload interval');
      clearInterval(intervalId);
    };
  }, []);

  // Handle play/pause based on isPlaying prop and apply volume
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    // Set volume BEFORE playing (convert percentage 0-100 to decimal 0.0-1.0)
    const volumeDecimal = (currentTrack.volume ?? 50) / 100;
    audioRef.current.volume = Math.max(0, Math.min(1, volumeDecimal)); // Clamp to 0.0-1.0

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Error playing spa audio:', err);
        setError('Failed to play audio');
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const loadActiveTrack = async () => {
    try {
      console.log('[SpaAudioPlayer] Fetching active spa track from /api/spa/tracks/active');
      const response = await fetch('/api/spa/tracks/active');
      const data = await response.json();

      console.log('[SpaAudioPlayer] API response:', {
        status: data.status,
        hasData: !!data.data,
        message: data.message,
        trackId: data.data?.id,
        trackTitle: data.data?.title,
      });

      if (data.status === 'success' && data.data) {
        const track = data.data;

        console.log('[SpaAudioPlayer] Track received:', {
          id: track.id,
          title: track.title,
          publish_time_start: track.publish_time_start,
          publish_time_end: track.publish_time_end,
          publish_days: track.publish_days,
        });

        // Server has already filtered by schedule, trust it
        // Only update if track actually changed (prevents audio restart on same track)
        setCurrentTrack(prevTrack => {
          if (prevTrack?.id === track.id) {
            console.log('[SpaAudioPlayer] Same track, keeping existing');
            return prevTrack; // Same track, no update needed
          }
          console.log('[SpaAudioPlayer] New track detected, updating state');
          return track; // New track, update state
        });
        setError(null);
      } else {
        console.log('[SpaAudioPlayer] No track data in response');
        setCurrentTrack(null);
        setError(data.message || 'No spa tracks available');
        if (onLoadError) onLoadError();
      }
    } catch (err) {
      console.error('[SpaAudioPlayer] Error loading active spa track:', err);
      setError('Failed to load spa track');
      if (onLoadError) onLoadError();
    }
  };

  // Handle audio ended - loop the track
  const handleAudioEnded = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.error('Error replaying spa audio:', err);
      });
    }
  };

  // Don't render anything if no track or error
  if (!currentTrack || error) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      src={currentTrack.audio_url}
      loop
      onEnded={handleAudioEnded}
      onError={() => {
        console.error('Error loading spa audio file');
        setError('Failed to load audio file');
        if (onLoadError) onLoadError();
      }}
      style={{ display: 'none' }}
    />
  );
}
