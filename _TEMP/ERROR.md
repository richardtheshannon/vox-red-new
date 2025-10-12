Runtime TypeError


Cannot read properties of undefined (reading 'undefined')

src\app\page.tsx (39:38) @ handleSlideChange


  37 |
  38 |   const handleSlideChange = (swiper: SwiperType) => {
> 39 |     const activeSlide = swiper.slides[swiper.activeIndex];
     |                                      ^
  40 |     const scrollContainer = activeSlide?.querySelector('.h-full.overflow-y-auto') as HTMLElement;
  41 |     setActiveSlideElement(scrollContainer);
  42 |   };
Call Stack
2

handleSlideChange
src\app\page.tsx (39:38)
eval
src\components\MainContent.tsx (27:32)

Runtime TypeError


Cannot read properties of undefined (reading 'undefined')

src\app\page.tsx (39:38) @ handleSlideChange


  37 |
  38 |   const handleSlideChange = (swiper: SwiperType) => {
> 39 |     const activeSlide = swiper.slides[swiper.activeIndex];
     |                                      ^
  40 |     const scrollContainer = activeSlide?.querySelector('.h-full.overflow-y-auto') as HTMLElement;
  41 |     setActiveSlideElement(scrollContainer);
  42 |   };
Call Stack
2

handleSlideChange
src\app\page.tsx (39:38)
eval
src\components\MainContent.tsx (86:32)