export default function BottomIconBar() {
  return (
    <footer className="icon-container fixed bottom-0 left-0 right-0 flex justify-between items-center z-10" style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Refresh">refresh</span>
        <span className="material-symbols-outlined" title="Comment">comment</span>
        <span className="material-symbols-outlined" title="Arrow Circle Up">arrow_circle_up</span>
        <span className="material-symbols-outlined" title="Arrow Circle Down">arrow_circle_down</span>
      </div>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Arrow Circle Left">arrow_circle_left</span>
        <span className="material-symbols-outlined" title="Arrow Circle Right">arrow_circle_right</span>
        <span className="material-symbols-outlined" title="Bottom Panel Open">bottom_panel_open</span>
        <span className="material-symbols-outlined" title="Menu">menu</span>
      </div>
    </footer>
  );
}