import Link from 'next/link';

export default function AdminTopIconBar() {
  return (
    <header className="icon-container fixed top-0 left-0 right-0 flex justify-between items-center z-10" style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Dashboard">dashboard</span>
        <span className="material-symbols-outlined" title="Bug Report">bug_report</span>
        <span className="material-symbols-outlined" title="Documentation">description</span>
      </div>
      <div className="flex items-center">
        <Link href="/">
          <span className="material-symbols-outlined" title="Exit to App">exit_to_app</span>
        </Link>
        <span className="material-symbols-outlined" title="Admin Panel">admin_panel_settings</span>
      </div>
    </header>
  );
}