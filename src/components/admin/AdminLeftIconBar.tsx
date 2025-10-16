import Link from 'next/link';

export default function AdminLeftIconBar() {
  return (
    <aside className="icon-container admin-sidebar fixed left-0 flex flex-col justify-end items-center z-10" style={{padding: '0.2rem', top: '60px', bottom: '60px', backgroundColor: 'var(--bg-color)'}}>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Add User">person_add</span>
        <span className="material-symbols-outlined" title="User Groups">group</span>
        <span className="material-symbols-outlined" title="Moderation">gavel</span>
        <span className="material-symbols-outlined" title="Content Management">content_paste</span>
        <Link href="/admin/slides">
          <span className="material-symbols-outlined cursor-pointer hover:opacity-70 transition-opacity" title="Slide Management">view_carousel</span>
        </Link>
      </div>
    </aside>
  );
}