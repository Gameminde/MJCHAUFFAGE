Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
AnalyticsProvider.tsx:37 Analytics provider initialized
AnalyticsProvider.tsx:37 Analytics provider initialized
realtimeService.ts:85 WebSocket connection to 'ws://localhost:3001/socket.io/?EIO=4&transport=websocket' failed: WebSocket is closed before the connection is established.
doClose @ websocket.js:90
close @ transport.js:64
_onClose @ socket.js:525
close @ socket.js:461
close @ socket.js:490
onclose @ manager.js:315
_close @ manager.js:293
_destroy @ manager.js:261
destroy @ socket.js:639
disconnect @ socket.js:662
disconnect @ realtimeService.ts:85
disconnect @ useRealtime.ts:55
eval @ useRealtime.ts:21
safelyCallDestroy @ react-dom.development.js:20869
commitHookEffectListUnmount @ react-dom.development.js:21051
invokePassiveEffectUnmountInDEV @ react-dom.development.js:24033
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26829
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this warning
realtimeService.ts:21 Connected to real-time server
analyticsService.ts:187  POST http://localhost:3000/api/analytics/events 400 (Bad Request)
flushEvents @ analyticsService.ts:187
queueEvent @ analyticsService.ts:176
initializeSession @ analyticsService.ts:123
await in initializeSession
init @ analyticsService.ts:78
AnalyticsService @ analyticsService.ts:70
eval @ analyticsService.ts:449
(app-pages-browser)/./src/services/analyticsService.ts @ layout.js:82
options.factory @ webpack.js?v=1760804575116:715
__webpack_require__ @ webpack.js?v=1760804575116:37
fn @ webpack.js?v=1760804575116:371
eval @ AnalyticsProvider.tsx:9
(app-pages-browser)/./src/components/analytics/AnalyticsProvider.tsx @ layout.js:60
options.factory @ webpack.js?v=1760804575116:715
__webpack_require__ @ webpack.js?v=1760804575116:37
fn @ webpack.js?v=1760804575116:371
Promise.then
eval @ next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22C%3A%5C%5CUsers%5C%5Cyoucefcheriet%5C%5CMJCHAUFFAGE%5C%5Cfrontend%5C%5Csrc%5C%5Ccomponents%5C%5Canalytics%5C%5CAnalyticsProvider.tsx%22%2C%22ids%22%3A%5B%22AnalyticsProvider%22%5D%7D&modules=%7B%22request%22%3A%22C%3A%5C%5CUsers%5C%5Cyoucefcheriet%5C%5CMJCHAUFFAGE%5C%5Cnode_modules%5C%5Cnext%5C%5Cfont%5C%5Cgoogle%5C%5Ctarget.css%3F%7B%5C%22path%5C%22%3A%5C%22src%5C%5C%5C%5Capp%5C%5C%5C%5Clayout.tsx%5C%22%2C%5C%22import%5C%22%3A%5C%22Inter%5C%22%2C%5C%22arguments%5C%22%3A%5B%7B%5C%22subsets%5C%22%3A%5B%5C%22latin%5C%22%5D%2C%5C%22variable%5C%22%3A%5C%22--font-inter%5C%22%2C%5C%22display%5C%22%3A%5C%22swap%5C%22%2C%5C%22preload%5C%22%3Atrue%2C%5C%22fallback%5C%22%3A%5B%5C%22ui-sans-serif%5C%22%2C%5C%22system-ui%5C%22%2C%5C%22sans-serif%5C%22%5D%7D%5D%2C%5C%22variableName%5C%22%3A%5C%22inter%5C%22%7D%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22C%3A%5C%5CUsers%5C%5Cyoucefcheriet%5C%5CMJCHAUFFAGE%5C%5Cfrontend%5C%5Csrc%5C%5Cstyles%5C%5Cglobals.css%22%2C%22ids%22%3A%5B%5D%7D&server=false!:1
(app-pages-browser)/../node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22C%3A%5C%5CUsers%5C%5Cyoucefcheriet%5C%5CMJCHAUFFAGE%5C%5Cfrontend%5C%5Csrc%5C%5Ccomponents%5C%5Canalytics%5C%5CAnalyticsProvider.tsx%22%2C%22ids%22%3A%5B%22AnalyticsProvider%22%5D%7D&modules=%7B%22request%22%3A%22C%3A%5C%5CUsers%5C%5Cyoucefcheriet%5C%5CMJCHAUFFAGE%5C%5Cnode_modules%5C%5Cnext%5C%5Cfont%5C%5Cgoogle%5C%5Ctarget.css%3F%7B%5C%22path%5C%22%3A%5C%22src%5C%5C%5C%5Capp%5C%5C%5C%5Clayout.tsx%5C%22%2C%5C%22import%5C%22%3A%5C%22Inter%5C%22%2C%5C%22arguments%5C%22%3A%5B%7B%5C%22subsets%5C%22%3A%5B%5C%22latin%5C%22%5D%2C%5C%22variable%5C%22%3A%5C%22--font-inter%5C%22%2C%5C%22display%5C%22%3A%5C%22swap%5C%22%2C%5C%22preload%5C%22%3Atrue%2C%5C%22fallback%5C%22%3A%5B%5C%22ui-sans-serif%5C%22%2C%5C%22system-ui%5C%22%2C%5C%22sans-serif%5C%22%5D%7D%5D%2C%5C%22variableName%5C%22%3A%5C%22inter%5C%22%7D%22%2C%22ids%22%3A%5B%5D%7D&modules=%7B%22request%22%3A%22C%3A%5C%5CUsers%5C%5Cyoucefcheriet%5C%5CMJCHAUFFAGE%5C%5Cfrontend%5C%5Csrc%5C%5Cstyles%5C%5Cglobals.css%22%2C%22ids%22%3A%5B%5D%7D&server=false! @ layout.js:17
options.factory @ webpack.js?v=1760804575116:715
__webpack_require__ @ webpack.js?v=1760804575116:37
__webpack_exec__ @ layout.js:186
(anonymous) @ layout.js:187
__webpack_require__.O @ webpack.js?v=1760804575116:86
webpackJsonpCallback @ webpack.js?v=1760804575116:1397
(anonymous) @ main-app.js?v=1760804575116:9Understand this error
analyticsService.ts:187  POST http://localhost:3000/api/analytics/events 400 (Bad Request)
flushEvents @ analyticsService.ts:187
destroy @ analyticsService.ts:444
eval @ AnalyticsProvider.tsx:43
safelyCallDestroy @ react-dom.development.js:20869
commitHookEffectListUnmount @ react-dom.development.js:21051
invokePassiveEffectUnmountInDEV @ react-dom.development.js:24033
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26829
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:77  GET http://localhost:3000/api/auth/session 404 (Not Found)
_callee$ @ _utils.js:49
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
_fetchData @ _utils.js:77
fetchData @ _utils.js:17
_callee3$ @ index.js:127
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
_getSession2 @ index.js:145
getSession @ index.js:117
addAuthHeader @ api.ts:77
request @ api.ts:158
get @ api.ts:189
getProducts @ productService.ts:112
fetchData @ ProductsManagement.tsx:113
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
commitHookPassiveMountEffects @ react-dom.development.js:23154
commitPassiveMountOnFiber @ react-dom.development.js:23259
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370

recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23267
commitPassiveMountEffects @ react-dom.development.js:23225
flushPassiveEffectsImpl @ react-dom.development.js:26497
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:77  GET http://localhost:3000/api/auth/session 404 (Not Found)
_callee$ @ _utils.js:49
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
fetchData @ _utils.js:17
_callee3$ @ index.js:127
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
getSession @ index.js:117
addAuthHeader @ api.ts:77
request @ api.ts:158
get @ api.ts:189
getProducts @ productService.ts:112
fetchData @ ProductsManagement.tsx:113
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
invokePassiveEffectMountInDEV @ react-dom.development.js:23980
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26835
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:77 [next-auth][error][CLIENT_FETCH_ERROR] 
https://next-auth.js.org/errors#client_fetch_error Route /api/auth/session not found {error: {…}, url: '/api/auth/session', message: 'Route /api/auth/session not found'}
window.console.error @ app-index.js:33
console.error @ hydration-error-info.js:63
error @ logger.js:37
_callee$ @ logger.js:70
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
eval @ logger.js:102
_callee$ @ _utils.js:66
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
fetchData @ _utils.js:17
_callee3$ @ index.js:127
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
getSession @ index.js:117
addAuthHeader @ api.ts:77
request @ api.ts:158
get @ api.ts:189
getProducts @ productService.ts:112
fetchData @ ProductsManagement.tsx:113
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
invokePassiveEffectMountInDEV @ react-dom.development.js:23980
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26835
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:77  POST http://localhost:3000/api/auth/_log 404 (Not Found)
_callee$ @ logger.js:85
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
eval @ logger.js:102
_callee$ @ _utils.js:66
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
_fetchData @ _utils.js:77
fetchData @ _utils.js:17
_callee3$ @ index.js:127
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
_getSession2 @ index.js:145
getSession @ index.js:117
addAuthHeader @ api.ts:77
request @ api.ts:158
get @ api.ts:189
getProducts @ productService.ts:112
fetchData @ ProductsManagement.tsx:113
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
commitHookPassiveMountEffects @ react-dom.development.js:23154
commitPassiveMountOnFiber @ react-dom.development.js:23259
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountE
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:77 [next-auth][error][CLIENT_FETCH_ERROR] 
https://next-auth.js.org/errors#client_fetch_error Route /api/auth/session not found {error: {…}, url: '/api/auth/session', message: 'Route /api/auth/session not found'}
window.console.error @ app-index.js:33
console.error @ hydration-error-info.js:63
error @ logger.js:37
_callee$ @ logger.js:70
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
eval @ logger.js:102
_callee$ @ _utils.js:66
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
fetchData @ _utils.js:17
_callee3$ @ index.js:127
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
getSession @ index.js:117
addAuthHeader @ api.ts:77
request @ api.ts:158
get @ api.ts:189
getManufacturers @ productService.ts:149
fetchData @ ProductsManagement.tsx:131
await in fetchData
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
invokePassiveEffectMountInDEV @ react-dom.development.js:23980
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26835
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
productService.ts:154 Error fetching manufacturers: ApiError: Route /api/manufacturers not found
    at handleResponse (api.ts:120:11)
    at async Object.getManufacturers (productService.ts:149:22)
    at async fetchData (ProductsManagement.tsx:131:37)
window.console.error @ app-index.js:33
console.error @ hydration-error-info.js:63
getManufacturers @ productService.ts:154
await in getManufacturers
fetchData @ ProductsManagement.tsx:131
await in fetchData
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
commitHookPassiveMountEffects @ react-dom.development.js:23154
commitPassiveMountOnFiber @ react-dom.development.js:23259
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
 react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23267
commitPassiveMountEffects @ react-dom.development.js:23225
flushPassiveEffectsImpl @ react-dom.development.js:26497
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:77  POST http://localhost:3000/api/auth/_log 404 (Not Found)
_callee$ @ logger.js:85
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
eval @ logger.js:102
_callee$ @ _utils.js:66
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
Promise.then
asyncGeneratorStep @ asyncToGenerator.js:8
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
fetchData @ _utils.js:17
_callee3$ @ index.js:127
eval @ regeneratorRuntime.js:52
eval @ regenerator.js:52
eval @ regeneratorDefine.js:11
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
eval @ asyncToGenerator.js:22
eval @ asyncToGenerator.js:14
getSession @ index.js:117
addAuthHeader @ api.ts:77
request @ api.ts:158
get @ api.ts:189
getManufacturers @ productService.ts:149
fetchData @ ProductsManagement.tsx:131
await in fetchData
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
invokePassiveEffectMountInDEV @ react-dom.development.js:23980
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26835
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
api.ts:163  GET http://localhost:3001/api/manufacturers 404 (Not Found)
request @ api.ts:163
await in request
get @ api.ts:189
getManufacturers @ productService.ts:149
fetchData @ ProductsManagement.tsx:131
await in fetchData
eval @ ProductsManagement.tsx:145
commitHookEffectListMount @ react-dom.development.js:21102
invokePassiveEffectMountInDEV @ react-dom.development.js:23980
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26835
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534Understand this error
productService.ts:154 Error fetching manufacturers: ApiError: Route /api/manufacturers not found
    at handleResponse (api.ts:120:11)
    at async Object.getManufacturers (productService.ts:149:22)
    at async fetchData (ProductsManagement.tsx:131:37)
    api.ts:77 
 GET http://localhost:3000/api/auth/session 404 (Not Found)

api.ts:77 [next-auth][error][CLIENT_FETCH_ERROR] 
https://next-auth.js.org/errors#client_fetch_error Route /api/auth/session not found 
{error: {…}, url: '/api/auth/session', message: 'Route /api/auth/session not found'}
api.ts:163 
 POST http://localhost:3001/api/products 403 (Forbidden)
productService.ts:181 Error creating product: ApiError: Invalid or expired token
    at handleResponse (api.ts:120:11)
    at async Object.createProduct (productService.ts:172:22)
    at async handleSubmit (ProductsManagement.tsx:321:28)
ProductsManagement.tsx:333 Error saving product: ApiError: Invalid or expired token
    at handleResponse (api.ts:120:11)
    at async Object.createProduct (productService.ts:172:22)
    at async handleSubmit (ProductsManagement.tsx:321:28)
api.ts:77 
 POST http://localhost:3000/api/auth/_log 404 (Not Found)
﻿

WHEN I CREAT A PRODUCT : Erreur: Invalid or expired token