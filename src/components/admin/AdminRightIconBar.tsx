export default function AdminRightIconBar() {
  return (
    <aside className="icon-container fixed right-0 flex flex-col justify-between items-center z-10" style={{padding: '0.2rem', top: '60px', bottom: '60px'}}>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Analytics">analytics</span>
        <span className="material-symbols-outlined" title="Library Books">library_books</span>
        <span className="material-symbols-outlined" title="Audio File">audiotrack</span>
        <span className="material-symbols-outlined" title="Documentation">description</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined" title="Monitoring">monitor</span>
        <span className="material-symbols-outlined" title="Assessment">assessment</span>
        <span className="material-symbols-outlined" title="Data Usage">pie_chart</span>
        <span className="material-symbols-outlined" title="Storage">storage</span>
      </div>
    </aside>
  );
}