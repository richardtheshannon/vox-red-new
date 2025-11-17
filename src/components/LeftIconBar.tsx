'use client';

import { useSession } from 'next-auth/react';

interface LeftIconBarProps {
  hasBackgroundImage?: boolean;
}

export default function LeftIconBar({ hasBackgroundImage = false }: LeftIconBarProps) {
  const { data: session } = useSession();
  return (
    <aside className={`icon-container fixed left-0 flex flex-col justify-between items-center ${hasBackgroundImage ? 'no-gradient' : ''}`} style={{padding: '0.2rem', top: '0', bottom: '0', paddingTop: '50px', paddingBottom: '50px', zIndex: 15}}>
      <div className="flex flex-col items-center">



      </div>
      <div className="flex flex-col items-center">
        {session && (
          <span className="material-symbols-outlined" title="Open with">open_with</span>
        )}
      </div>
    </aside>
  );
}