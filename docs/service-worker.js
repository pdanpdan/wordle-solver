if(!self.define){let e,o={};const r=(r,l)=>(r=new URL(r+".js",l).href,o[r]||new Promise((o=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=o,document.head.appendChild(e)}else e=r,importScripts(r),o()})).then((()=>{let e=o[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(l,s)=>{const n=e||("document"in self?document.currentScript.src:"")||location.href;if(o[n])return;let i={};const d=e=>r(e,n),f={module:{uri:n},exports:i,require:d};o[n]=Promise.all(l.map((e=>f[e]||d(e)))).then((e=>(s(...e),i)))}}define(["./workbox-cb3ce6c3"],(function(e){"use strict";e.setCacheNameDetails({prefix:"wordle-solver"}),self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"/wordle-solver/css/app.31d6cfe0.css",revision:null},{url:"/wordle-solver/css/vendor.2cae89f6.css",revision:null},{url:"/wordle-solver/favicon.ico",revision:"f4facfeaed834544d622544acfbb7722"},{url:"/wordle-solver/fonts/KFOkCnqEu92Fr1MmgVxIIzQ.9391e6e2.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmEU9fBBc-.ddd11dab.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmSU5fBBc-.877b9231.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmWUlfBBc-.0344cc3c.woff",revision:null},{url:"/wordle-solver/fonts/KFOlCnqEu92Fr1MmYUtfBBc-.b555d228.woff",revision:null},{url:"/wordle-solver/fonts/KFOmCnqEu92Fr1Mu4mxM.9b78ea3b.woff",revision:null},{url:"/wordle-solver/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNa.1dd1bb36.woff",revision:null},{url:"/wordle-solver/fonts/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.f54bbe10.woff2",revision:null},{url:"/wordle-solver/icons/apple-icon-120x120.png",revision:"d082235f6e6d2109e84e397f66fa868d"},{url:"/wordle-solver/icons/apple-icon-152x152.png",revision:"3c728ce3e709b7395be487becf76283a"},{url:"/wordle-solver/icons/apple-icon-167x167.png",revision:"3fec89672a18e4b402ede58646917c2d"},{url:"/wordle-solver/icons/apple-icon-180x180.png",revision:"aa47843bd47f34b7ca4b99f65dd25955"},{url:"/wordle-solver/icons/favicon-128x128.png",revision:"ab92df0270f054ca388127c9703a4911"},{url:"/wordle-solver/icons/favicon-16x16.png",revision:"e4b046d41e08e6fa06626d6410ab381d"},{url:"/wordle-solver/icons/favicon-32x32.png",revision:"410858b01fa6d3d66b7bf21447c5f1fc"},{url:"/wordle-solver/icons/favicon-96x96.png",revision:"db2bde7f824fb4057ffd1c42f6ed756e"},{url:"/wordle-solver/icons/icon-128x128.png",revision:"ab92df0270f054ca388127c9703a4911"},{url:"/wordle-solver/icons/icon-192x192.png",revision:"7659f0d3e9602e71811f8b7cf2ce0e8e"},{url:"/wordle-solver/icons/icon-256x256.png",revision:"cf5ad3498fb6fda43bdafd3c6ce9b824"},{url:"/wordle-solver/icons/icon-384x384.png",revision:"fdfc1b3612b6833a27a7b260c9990247"},{url:"/wordle-solver/icons/icon-512x512.png",revision:"2c2dc987945806196bd18cb6028d8bf4"},{url:"/wordle-solver/icons/ms-icon-144x144.png",revision:"8de1b0e67a62b881cd22d935f102a0e6"},{url:"/wordle-solver/icons/safari-pinned-tab.svg",revision:"3e4c3730b00c89591de9505efb73afd3"},{url:"/wordle-solver/index.html",revision:"f8d057d577089abd7183e162b668d5af"},{url:"/wordle-solver/js/296.eda6ba71.js",revision:null},{url:"/wordle-solver/js/434.b7d3b156.js",revision:null},{url:"/wordle-solver/js/app.f10128cd.js",revision:null},{url:"/wordle-solver/js/vendor.3f2bb5f6.js",revision:null},{url:"/wordle-solver/manifest.json",revision:"37809c20b9bf866e0cbfe303f7d2a771"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/wordle-solver/index.html"),{denylist:[/service-worker\.js$/,/workbox-(.)*\.js$/]}))}));
