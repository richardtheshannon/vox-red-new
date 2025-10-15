interface AdminRightIconBarProps {
  isExpanded: boolean;
}

export default function AdminRightIconBar({ isExpanded }: AdminRightIconBarProps) {
  return (
    <aside className={`admin-sidebar icon-container fixed right-0 flex flex-col justify-between z-10 ${isExpanded ? 'expanded' : 'collapsed'}`} style={{padding: '0.2rem'}}>
      <div className="flex flex-col">
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Analytics</span>}
          <span className="material-symbols-outlined" title="Analytics">analytics</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Monitoring</span>}
          <span className="material-symbols-outlined" title="Monitoring">monitor</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Dashboard</span>}
          <span className="material-symbols-outlined" title="Dashboard">dashboard</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Settings</span>}
          <span className="material-symbols-outlined" title="Settings">settings</span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Storage</span>}
          <span className="material-symbols-outlined" title="Storage">storage</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Library</span>}
          <span className="material-symbols-outlined" title="Library">local_library</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Audio</span>}
          <span className="material-symbols-outlined" title="Audio">audiotrack</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isExpanded && <span>Reports</span>}
          <span className="material-symbols-outlined" title="Reports">assessment</span>
        </div>
      </div>
    </aside>
  );
}