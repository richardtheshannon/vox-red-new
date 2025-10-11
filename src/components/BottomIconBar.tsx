'use client';

import { useSwiperContext } from '@/contexts/SwiperContext';

export default function BottomIconBar() {
  const { slidePrev, slideNext, scrollUp, scrollDown } = useSwiperContext();
  console.log('BottomIconBar context methods:', { slidePrev, slideNext, scrollUp, scrollDown });

  return (
    <footer className="icon-container fixed bottom-0 left-0 right-0 flex justify-between items-center z-10" style={{padding: '0.2rem'}}>
      <div className="flex items-center">
        <span className="material-symbols-outlined" title="Refresh">refresh</span>
        <span className="material-symbols-outlined" title="Comment">comment</span>
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Scroll Up"
          onClick={scrollUp}
        >
          arrow_circle_up
        </span>
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Scroll Down"
          onClick={scrollDown}
        >
          arrow_circle_down
        </span>
      </div>
      <div className="flex items-center">
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Previous Slide"
          onClick={() => {
            console.log('Left arrow clicked');
            slidePrev();
          }}
        >
          arrow_circle_left
        </span>
        <span
          className="material-symbols-outlined cursor-pointer hover:text-blue-600 transition-colors"
          title="Next Slide"
          onClick={() => {
            console.log('Right arrow clicked');
            slideNext();
          }}
        >
          arrow_circle_right
        </span>
        <span className="material-symbols-outlined" title="Bottom Panel Open">bottom_panel_open</span>
        <span className="material-symbols-outlined" title="Menu">menu</span>
      </div>
    </footer>
  );
}