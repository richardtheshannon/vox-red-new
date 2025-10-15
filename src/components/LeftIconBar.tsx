interface LeftIconBarProps {
  hasBackgroundImage?: boolean;
}

export default function LeftIconBar({ hasBackgroundImage = false }: LeftIconBarProps) {
  return (
    <aside className={`icon-container fixed left-0 flex flex-col justify-between items-center z-10 ${hasBackgroundImage ? 'no-gradient' : ''}`} style={{padding: '0.2rem', top: '0', bottom: '0', paddingTop: '50px', paddingBottom: '50px'}}>
      <div className="flex flex-col items-center">



      </div>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Open with">open_with</span>
      </div>
    </aside>
  );
}