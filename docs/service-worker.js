if(!self.define){let e,o={};const l=(l,r)=>(l=new URL(l+".js",r).href,o[l]||new Promise((o=>{if("document"in self){const e=document.createElement("script");e.src=l,e.onload=o,document.head.appendChild(e)}else e=l,importScripts(l),o()})).then((()=>{let e=o[l];if(!e)throw new Error(`Module ${l} didn’t register its module`);return e})));self.define=(r,n)=>{const s=e||("document"in self?document.currentScript.src:"")||location.href;if(o[s])return;let i={};const c=e=>l(e,s),d={module:{uri:s},exports:i,require:c};o[s]=Promise.all(r.map((e=>d[e]||c(e)))).then((e=>(n(...e),i)))}}define(["./workbox-f4e16cad"],(function(e){"use strict";e.setCacheNameDetails({prefix:"wordle-solver"}),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/wordle-solver/css/app.2c7993d9.css",revision:null},{url:"/wordle-solver/css/vendor.bc36fd08.css",revision:null},{url:"/wordle-solver/favicon.ico",revision:"c6eb7c97415d26bca5fa1e8a9f8c4d9e"},{url:"/wordle-solver/fonts/KFOkCnqEu92Fr1MmgVxIIzQ.9391e6e2.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmEU9fBBc-.ddd11dab.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmSU5fBBc-.877b9231.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmWUlfBBc-.0344cc3c.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmYUtfBBc-.b555d228.woff",revision:null},{url:"/wordle-solver/fonts/KFOmCnqEu92Fr1Mu4mxM.9b78ea3b.woff",revision:null},{url:"/wordle-solver/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.1dd1bb36.woff",revision:null},{url:"/wordle-solver/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.f54bbe10.woff2",revision:null},{url:"/wordle-solver/icons/apple-icon-120x120.png",revision:"6bb4dd5d8f48888f3da9c55cddaa2e0f"},{url:"/wordle-solver/icons/apple-icon-152x152.png",revision:"283ff0de4081a55eb76934533143d12d"},{url:"/wordle-solver/icons/apple-icon-167x167.png",revision:"025686cfca6ea43428f79002d4ad9783"},{url:"/wordle-solver/icons/apple-icon-180x180.png",revision:"18cadfcf546ff1480432eb38687aa492"},{url:"/wordle-solver/icons/apple-launch-1125x2436.png",revision:"0565faee0166639762cdd4313e91589c"},{url:"/wordle-solver/icons/apple-launch-1170x2532.png",revision:"76df7cbc56a48ccb83404d9d81e576b0"},{url:"/wordle-solver/icons/apple-launch-1242x2208.png",revision:"ffc9f2a7d5f0010b0d8a0865b9c52291"},{url:"/wordle-solver/icons/apple-launch-1242x2688.png",revision:"f4477928ab6dabd9755ea8d1c08f4a06"},{url:"/wordle-solver/icons/apple-launch-1284x2778.png",revision:"a735c693f708e0a80c68061160d650a2"},{url:"/wordle-solver/icons/apple-launch-1536x2048.png",revision:"a33390d0c52721bfaf6b9431db8ad0f0"},{url:"/wordle-solver/icons/apple-launch-1620x2160.png",revision:"9480eb48b0504527a910c0cdcac2e690"},{url:"/wordle-solver/icons/apple-launch-1668x2224.png",revision:"4454659855fe0c9146d78d13dcdfc9ef"},{url:"/wordle-solver/icons/apple-launch-1668x2388.png",revision:"7058bbac014a3bf3e9dba66378a7cf39"},{url:"/wordle-solver/icons/apple-launch-2048x2732.png",revision:"d98f208a156327d869596e3a0568f380"},{url:"/wordle-solver/icons/apple-launch-750x1334.png",revision:"49fa45ca5a0dcf1b7dfaebcb7f4e98b7"},{url:"/wordle-solver/icons/apple-launch-828x1792.png",revision:"41efe0027dc96f92d6b8bc9a3e451146"},{url:"/wordle-solver/icons/favicon-128x128.png",revision:"60c2dfef1b25aa68fef598dc99f942af"},{url:"/wordle-solver/icons/favicon-16x16.png",revision:"79ea646767e480d529924ee1523f0795"},{url:"/wordle-solver/icons/favicon-32x32.png",revision:"ee07086d78e7d1d8d07ec40ddb1d0b36"},{url:"/wordle-solver/icons/favicon-96x96.png",revision:"31801f5aa63e90805df0376c28bc93cd"},{url:"/wordle-solver/icons/icon-128x128.png",revision:"60c2dfef1b25aa68fef598dc99f942af"},{url:"/wordle-solver/icons/icon-192x192.png",revision:"1f8ab10a4e4dea5d4dca45ff11ee2030"},{url:"/wordle-solver/icons/icon-256x256.png",revision:"c36046e349c59543ea94514933e0efda"},{url:"/wordle-solver/icons/icon-384x384.png",revision:"8c4772de8e14cb58dab790a1136f1ac0"},{url:"/wordle-solver/icons/icon-512x512.png",revision:"6ce075d137486ace6ecf62e284948ba5"},{url:"/wordle-solver/icons/ms-icon-144x144.png",revision:"515b073c79f8793ac505bb516a797f42"},{url:"/wordle-solver/icons/safari-pinned-tab.svg",revision:"53da4e1c53201f1066bd0a1247db514f"},{url:"/wordle-solver/index.html",revision:"e60195035769dbe93927fab509c4f783"},{url:"/wordle-solver/js/4.5a91740d.js",revision:null},{url:"/wordle-solver/js/608.aa8547b7.js",revision:null},{url:"/wordle-solver/js/app.5d220f0e.js",revision:null},{url:"/wordle-solver/js/vendor.6c91ae20.js",revision:null},{url:"/wordle-solver/manifest.json",revision:"37809c20b9bf866e0cbfe303f7d2a771"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/wordle-solver/index.html"),{denylist:[/service-worker\.js$/,/workbox-(.)*\.js$/]}))}));
