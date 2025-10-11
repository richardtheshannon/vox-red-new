export default function AdminLeftIconBar() {
  return (
    <aside className="icon-container fixed left-0 flex flex-col justify-between items-center z-10" style={{padding: '0.2rem', top: '60px', bottom: '60px'}}>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Add User">person_add</span>
        <span className="material-symbols-outlined" title="User Groups">group</span>
        <span className="material-symbols-outlined" title="Moderation">gavel</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Content Management">content_paste</span>
      </div>
    </aside>
  );
}