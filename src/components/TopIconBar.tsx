import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

interface TopIconBarProps {
  hasBackgroundImage?: boolean;
  isSpaPlaying?: boolean;
  onSpaToggle?: () => void;
}

export default function TopIconBar({ hasBackgroundImage = false, isSpaPlaying = false, onSpaToggle }: TopIconBarProps) {
  const { theme, toggleTheme } = useTheme();

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
        <span className="material-symbols-outlined" title="Play Circle">play_circle</span>
        <span className="material-symbols-outlined" title="Playlist Play">playlist_play</span>
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