interface AdminBottomIconBarProps {
  onMenuClick: () => void;
}

export default function AdminBottomIconBar({ onMenuClick }: AdminBottomIconBarProps) {
  return (
    <footer className="icon-container fixed bottom-0 left-0 right-0 flex justify-between items-center z-10" style={{padding: '0.2rem', backgroundColor: 'var(--bg-color)'}}>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Import Export">import_export</span>
        <span className="material-symbols-outlined" title="Backup">backup</span>
        <span className="material-symbols-outlined" title="Sync">sync</span>
        <span className="material-symbols-outlined" title="System Update">system_update</span>
      </div>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Refresh">refresh</span>
        <span className="material-symbols-outlined" title="Settings">settings</span>
        <span className="material-symbols-outlined" title="More Options">more_horiz</span>
        <span className="material-symbols-outlined" title="Menu" onClick={onMenuClick}>menu</span>
      </div>
    </footer>
  );
}