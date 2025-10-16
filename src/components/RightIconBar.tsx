interface RightIconBarProps {
  hasVideo?: boolean;
  onVideoToggle?: () => void;
  videoMode?: 'cover' | 'contained';
  hasBackgroundImage?: boolean;
}

export default function RightIconBar({ hasVideo = false, onVideoToggle, videoMode = 'cover', hasBackgroundImage = false }: RightIconBarProps) {
  return (
    <aside className={`icon-container fixed right-0 flex flex-col justify-between items-center ${hasBackgroundImage ? 'no-gradient' : ''}`} style={{padding: '0.2rem', top: '0', bottom: '0', paddingTop: '50px', paddingBottom: '50px', zIndex: 15}}>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Group">group</span>
        <span className="material-symbols-outlined" title="ATR">atr</span>
        <span className="material-symbols-outlined" title="Credit Card">credit_card</span>
        <span className="material-symbols-outlined" title="Payment">payment</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Tag">tag</span>
        <span className="material-symbols-outlined" title="Analytics">analytics</span>
        <span className="material-symbols-outlined" title="Photo Library">photo_library</span>
        {hasVideo && (
          <span
            className="material-symbols-outlined"
            title={videoMode === 'cover' ? 'Switch to Contained View' : 'Switch to Cover View'}
            onClick={onVideoToggle}
            style={{ cursor: 'pointer' }}
          >
            videocam
          </span>
        )}
      </div>
    </aside>
  );
}