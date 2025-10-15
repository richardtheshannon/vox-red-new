import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminTopIconBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="icon-container fixed top-0 left-0 right-0 flex justify-between items-center z-10" style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Dashboard">dashboard</span>
        <span className="material-symbols-outlined" title="Bug Report">bug_report</span>
        <Link href="/admin/slides">
          <span className="material-symbols-outlined" title="Documentation">description</span>
        </Link>
      </div>
      <div className="flex items-center">
        <Link href="/">
          <span className="material-symbols-outlined" title="Exit to App">exit_to_app</span>
        </Link>
        <span
          className="material-symbols-outlined cursor-pointer hover:opacity-70"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
        <span className="material-symbols-outlined" title="Admin Panel">admin_panel_settings</span>
      </div>
    </header>
  );
}