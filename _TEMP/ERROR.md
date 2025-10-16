Runtime ReferenceError


activeSlideVideoUrl is not defined

src\components\MainContent.tsx (366:70) @ MainContent


  364 |     <main className="absolute inset-0 overflow-hidden" style={{padding: '50px', zIndex: 20, backgroundColor: 'transparent', pointerEvents: 'none'}}>
  365 |       {/* Desktop View - Vertical Swiper with nested Horizontal Swipers */}
> 366 |       <div className="hidden md:block h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
      |                                                                      ^
  367 |         <div className="h-full" style={{pointerEvents: activeSlideVideoUrl ? 'none' : 'auto'}}>
  368 |           <Swiper
  369 |             direction="vertical"
Call Stack
15

Show 12 ignore-listed frame(s)
MainContent
src\components\MainContent.tsx (366:70)
MainContentWithRef
src\app\page.tsx (150:5)
Home
src\app\page.tsx (122:11)

C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\src\components\BottomIconBar.tsx:11 BottomIconBar context methods: Object
hook.js:377 BottomIconBar context methods: Object
C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\src\components\MainContent.tsx:366 Uncaught ReferenceError: activeSlideVideoUrl is not defined
    at MainContent (C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\src\components\MainContent.tsx:366:70)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:23584:20)
    at renderWithHooks (react-dom-client.development.js:6793:22)
    at updateFunctionComponent (react-dom-client.development.js:9247:19)
    at beginWork (react-dom-client.development.js:10858:18)
    at runWithFiberInDEV (react-dom-client.development.js:872:30)
    at performUnitOfWork (react-dom-client.development.js:15727:22)
    at workLoopSync (react-dom-client.development.js:15547:41)
    at renderRootSync (react-dom-client.development.js:15527:11)
    at performWorkOnRoot (react-dom-client.development.js:15034:44)
    at performWorkOnRootViaSchedulerTask (react-dom-client.development.js:16816:7)
    at MessagePort.performWorkUntilDeadline (scheduler.development.js:45:48)
