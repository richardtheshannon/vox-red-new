
:3000/:1  GET http://localhost:3000/ 500 (Internal Server Error)
index.js:640 Uncaught ModuleParseError: Module parse failed: Duplicate export 'default' (539:24)
File was processed with these loaders:
 * ./node_modules/next/dist/compiled/@next/react-refresh-utils/dist/loader.js
 * ./node_modules/next/dist/build/webpack/loaders/next-flight-client-module-loader.js
 * ./node_modules/next/dist/build/webpack/loaders/next-swc-loader.js
You may need an additional loader to handle the result of these loaders.
| _c = MainContent;
| // Export the methods for external use
> export { MainContent as default };
| var _c;
| $RefreshReg$(_c, "MainContent");
    at <unknown> (File was processed with these loaders:)
    at handleParseError (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\webpack\bundle5.js:29:410378)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\webpack\bundle5.js:29:411994)
    at processResult (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\webpack\bundle5.js:29:407859)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\webpack\bundle5.js:29:408881)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:8727)
    at iterateNormalLoaders (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5565)
    at iterateNormalLoaders (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5650)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5879)
    at r.callback (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4039)
    at Object.ReactRefreshLoader (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\@next\react-refresh-utils\dist\loader.js:14:10)
    at LOADER_EXECUTION (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4134)
    at runSyncOrAsync (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4145)
    at iterateNormalLoaders (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5782)
    at iterateNormalLoaders (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5650)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5879)
    at r.callback (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4039)
    at Object.transformSource (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\build\webpack\loaders\next-flight-client-module-loader.js:45:17)
    at LOADER_EXECUTION (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4134)
    at runSyncOrAsync (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4145)
    at iterateNormalLoaders (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5782)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:5142)
    at r.callback (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\compiled\loader-runner\LoaderRunner.js:1:4039)
    at <unknown> (file://C:\Users\icos\00_DEPLOY\vox-red\_ new-ui\nextjs-app\node_modules\next\dist\build\webpack\loaders\next-swc-loader.js:224:23)
getServerError @ node-stack-frames.js:41
eval @ index.js:640
setTimeout
hydrate @ index.js:618
await in hydrate
pageBootstrap @ page-bootstrap.js:28
eval @ next-dev.js:24
Promise.then
eval @ next-dev.js:22
(pages-dir-browser)/./node_modules/next/dist/client/next-dev.js @ main.js?ts=1760200373796:314
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
__webpack_exec__ @ main.js?ts=1760200373796:1546
(anonymous) @ main.js?ts=1760200373796:1547
webpackJsonpCallback @ webpack.js:1
(anonymous) @ main.js?ts=1760200373796:9
websocket.js:46 [HMR] connected
hook.js:608 ./src/components/MainContent.tsx
Module parse failed: Duplicate export 'default' (537:24)
| }
| // Export the methods for external use
> export { MainContent as default };
|
overrideMethod @ hook.js:608
nextJsHandleConsoleError @ pages-dev-overlay-setup.js:77
handleErrors @ hot-reloader-pages.js:164
processMessage @ hot-reloader-pages.js:228
eval @ hot-reloader-pages.js:72
handleMessage @ websocket.js:69
index.js:1631 {file: {…}}
