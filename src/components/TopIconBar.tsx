import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function TopIconBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="icon-container fixed top-0 left-0 right-0 flex justify-between items-center z-10" style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        <Link href="https://app.lilde.com">
          <span className="material-symbols-outlined cursor-pointer hover:opacity-70" title="Home">home</span>
        </Link>
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