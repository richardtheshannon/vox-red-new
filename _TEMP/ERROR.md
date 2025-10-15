index.js:440 Uncaught Error: Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.
    at _EditorInstanceManager.getInitialEditor (index.js:440:17)
    at new _EditorInstanceManager (index.js:421:25)
    at eval (index.js:645:83)
    at mountStateImpl (react-dom-client.development.js:7397:24)
    at mountState (react-dom-client.development.js:7418:22)
    at Object.useState (react-dom-client.development.js:23922:18)
    at exports.useState (react.development.js:1252:34)
    at useEditor (index.js:645:76)
    at SlideEditor (C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\src\components\admin\slides\SlideEditor.tsx:51:27)
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

Runtime Error


Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.

src\components\admin\slides\SlideEditor.tsx (51:27) @ SlideEditor


  49 |   const [error, setError] = useState<string | null>(null);
  50 |
> 51 |   const editor = useEditor({
     |                           ^
  52 |     extensions: [
  53 |       StarterKit,
  54 |       Link.configure({
Call Stack
22

Show 20 ignore-listed frame(s)
SlideEditor
src\components\admin\slides\SlideEditor.tsx (51:27)
EditSlidePage
src\app\admin\slides\[id]\slide\[slideId]\page.tsx (184:17)
1