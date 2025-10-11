export default function RightIconBar() {
  return (
    <aside className="icon-container fixed right-0 flex flex-col justify-between items-center z-10" style={{padding: '0.2rem', top: '60px', bottom: '60px'}}>
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
        <span className="material-symbols-outlined" title="Videocam">videocam</span>
      </div>
    </aside>
  );
}