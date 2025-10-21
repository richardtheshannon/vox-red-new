'use client';

import { useEffect, useRef, useState } from 'react';
import { SpaTrack } from '@/lib/queries/spaTracks';

interface SpaAudioPlayerProps {
  isPlaying: boolean;
  onLoadError?: () => void;
}

/**
 * SpaAudioPlayer component
 * Plays background ambient music based on active spa track
 * Handles scheduling, randomization, and audio playback
 */
export default function SpaAudioPlayer({ isPlaying, onLoadError }: SpaAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpaTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load active track
  useEffect(() => {
    loadActiveTrack();
  }, []);

  // Handle play/pause based on isPlaying prop
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

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
      const response = await fetch('/api/spa/tracks/active');
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        const track = data.data;

        // Apply client-side schedule filtering
        if (isTrackVisibleNow(track)) {
          setCurrentTrack(track);
          setError(null);
        } else {
          setCurrentTrack(null);
          setError('No spa tracks available at this time');
          if (onLoadError) onLoadError();
        }
      } else {
        setCurrentTrack(null);
        setError(data.message || 'No spa tracks available');
        if (onLoadError) onLoadError();
      }
    } catch (err) {
      console.error('Error loading active spa track:', err);
      setError('Failed to load spa track');
      if (onLoadError) onLoadError();
    }
  };

  /**
   * Client-side schedule filtering (same logic as slides)
   * Checks if track should be visible based on time/day settings
   */
  const isTrackVisibleNow = (track: SpaTrack): boolean => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    // Check day-of-week restrictions
    if (track.publish_days) {
      try {
        const allowedDays: number[] = JSON.parse(track.publish_days);

        if (allowedDays.length > 0 && !allowedDays.includes(currentDay)) {
          return false;
        }
      } catch (error) {
        console.error('Error parsing publish_days:', error);
      }
    }

    // Check time-of-day restrictions
    const hasTimeStart = track.publish_time_start !== null && track.publish_time_start !== undefined;
    const hasTimeEnd = track.publish_time_end !== null && track.publish_time_end !== undefined;

    if (hasTimeStart || hasTimeEnd) {
      const startMinutes = hasTimeStart ? parseTimeToMinutes(track.publish_time_start!) : 0;
      const endMinutes = hasTimeEnd ? parseTimeToMinutes(track.publish_time_end!) : 1439; // 23:59

      // Handle overnight time ranges (e.g., 22:00 - 03:00)
      if (startMinutes > endMinutes) {
        // Overnight: visible if EITHER after start OR before end
        if (currentTime < startMinutes && currentTime >= endMinutes) {
          return false;
        }
      } else {
        // Normal range: visible if between start and end
        if (currentTime < startMinutes || currentTime >= endMinutes) {
          return false;
        }
      }
    }

    return true;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
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
