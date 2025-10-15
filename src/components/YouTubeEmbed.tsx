'use client';

import { useEffect, useState } from 'react';

interface YouTubeEmbedProps {
  videoUrl: string | null;
  displayMode?: 'cover' | 'contained';
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle youtu.be short links
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      return match ? match[1] : null;
    }

    // Handle youtube.com/watch?v= links
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    }

    // Handle youtube.com/embed/ links
    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([^?&]+)/);
      return match ? match[1] : null;
    }

    // If it's just the video ID itself
    if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export default function YouTubeEmbed({ videoUrl, displayMode = 'cover' }: YouTubeEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (videoUrl) {
      const id = extractVideoId(videoUrl);
      setVideoId(id);
    } else {
      setVideoId(null);
    }
  }, [videoUrl]);

  // Don't render anything if no valid video ID
  if (!videoId) {
    return null;
  }

  // YouTube embed URL with parameters for better UX
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3`;

  return (
    <div className={`youtube-embed-container ${displayMode === 'contained' ? 'youtube-contained' : ''}`}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`youtube-embed-iframe ${displayMode === 'contained' ? 'youtube-iframe-contained' : ''}`}
      />
    </div>
  );
}
