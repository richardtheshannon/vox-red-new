import Link from 'next/link';
import type { Swiper as SwiperType } from 'swiper';
import type { Slide } from '@/lib/queries/slides';
import { useTheme } from '../contexts/ThemeContext';
import { usePlaylist } from '../contexts/PlaylistContext';

interface TopIconBarProps {
  hasBackgroundImage?: boolean;
  isSpaPlaying?: boolean;
  onSpaToggle?: () => void;
  hasAudioSlides?: boolean;
  getPlaylistData?: () => { rowId: string | null; delaySeconds: number; slides: Slide[]; swiper: SwiperType | null };
}

export default function TopIconBar({
  hasBackgroundImage = false,
  isSpaPlaying = false,
  onSpaToggle,
  hasAudioSlides = false,
  getPlaylistData
}: TopIconBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isPlaylistActive, isPaused, startPlaylist, pausePlaylist, resumePlaylist } = usePlaylist();

  // Debug logging
  console.log('[TopIconBar] hasAudioSlides:', hasAudioSlides, 'isPlaylistActive:', isPlaylistActive);

  // Handle playlist toggle
  const handlePlaylistToggle = () => {
    if (!getPlaylistData) return;

    const { rowId, delaySeconds, slides, swiper } = getPlaylistData();
    if (!rowId || !swiper) return;

    if (isPlaylistActive) {
      if (isPaused) {
        resumePlaylist();
      } else {
        pausePlaylist();
      }
    } else {
      startPlaylist(rowId, delaySeconds, swiper, slides);
    }
  };

  // Determine which icon to show
  const getPlaylistIcon = () => {
    if (isPlaylistActive && !isPaused) {
      return 'pause';
    }
    return 'playlist_play';
  };

  const getPlaylistTitle = () => {
    if (isPlaylistActive && !isPaused) {
      return 'Pause Playlist';
    }
    if (isPlaylistActive && isPaused) {
      return 'Resume Playlist';
    }
    return 'Play Playlist';
  };

  return (
    <header className={`icon-container fixed top-0 left-0 right-0 flex justify-between items-center z-20 ${hasBackgroundImage ? 'no-gradient' : ''}`} style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        <span
          className="material-symbols-outlined cursor-pointer hover:opacity-70"
          onClick={() => window.location.href = '/'}
          title="Home (Refresh)"
        >
          home
        </span>
        <span
          className="material-symbols-outlined cursor-pointer hover:opacity-70"
          onClick={onSpaToggle}
          title={isSpaPlaying ? "Stop Spa Mode" : "Play Spa Mode"}
          style={{ opacity: isSpaPlaying ? 1 : 0.6 }}
        >
          spa
        </span>
        {/* Only show playlist icon if current row has audio slides */}
        {hasAudioSlides && (
          <span
            className="material-symbols-outlined cursor-pointer hover:opacity-70"
            onClick={handlePlaylistToggle}
            title={getPlaylistTitle()}
            style={{ opacity: isPlaylistActive ? 1 : 0.6 }}
          >
            {getPlaylistIcon()}
          </span>
        )}
      </div>
      <div className="flex items-center">
        <Link href="/admin">
          <span className="material-symbols-outlined" title="Settings">settings</span>
        </Link>
        <span
          className="material-symbols-outlined cursor-pointer hover:opacity-70"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
        <span className="material-symbols-outlined" title="Menu">menu</span>
      </div>
    </header>
  );
}