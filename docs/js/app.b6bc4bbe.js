(()=>{"use strict";var e={3762:(e,r,t)=>{t(71),t(5363);var o=t(8880),n=t(9592),a=t(3673);function i(e,r,t,o,n,i){const s=(0,a.up)("router-view");return(0,a.wg)(),(0,a.j4)(s)}const s=(0,a.aZ)({name:"App"});var l=t(4260);const c=(0,l.Z)(s,[["render",i]]),u=c;var d=t(7083),f=t(9582);const p=[{path:"/",component:()=>Promise.all([t.e(736),t.e(990)]).then(t.bind(t,8990))},{path:"/:catchAll(.*)*",component:()=>Promise.all([t.e(736),t.e(608)]).then(t.bind(t,1608))}],v=p,h=(0,d.BC)((()=>{const e=f.PO,r=(0,f.p7)({scrollBehavior:()=>({left:0,top:0}),routes:v,history:e("/wordle-solver/")});return r}));async function g(e,r){const t="function"===typeof h?await h({}):h,o=e(u);return o.use(n.Z,r),{app:o,router:t}}var w=t(6395),b=t(6594);const m={config:{},plugins:{LocalStorage:w.Z,Notify:b.Z}};var y=t(1413);(0,y.z)("/wordle-solver/service-worker.js",{ready(){},registered(){},cached(){},updatefound(){},updated(){b.Z.create({message:"A new version is available.",timeout:1e5,color:"accent",textColor:"white",onDismiss(){window.location.reload()},actions:[{label:"Reload",color:"white"}]})},offline(){},error(){}}),/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream&&window.navigator.standalone&&t.e(736).then(t.t.bind(t,9501,23));const O="/wordle-solver/",j=/\/\//,P=e=>(O+e).replace(j,"/");async function _({app:e,router:r},t){let o=!1;const n=e=>{try{return P(r.resolve(e).href)}catch(t){}return Object(e)===e?null:e},a=e=>{if(o=!0,"string"===typeof e&&/^https?:\/\//.test(e))return void(window.location.href=e);const r=n(e);null!==r&&(window.location.href=r)},i=window.location.href.replace(window.location.origin,"");for(let l=0;!1===o&&l<t.length;l++)try{await t[l]({app:e,router:r,ssrContext:null,redirect:a,urlPath:i,publicPath:O})}catch(s){return s&&s.url?void a(s.url):void console.error("[Quasar] boot error:",s)}!0!==o&&(e.use(r),e.mount("#q-app"))}g(o.ri,m).then((e=>Promise.all([Promise.resolve().then(t.bind(t,7537))]).then((r=>{const t=r.map((e=>e.default)).filter((e=>"function"===typeof e));_(e,t)}))))},7537:(e,r,t)=>{t.r(r),t.d(r,{default:()=>s});var o=t(7083),n=t(5175);const a=JSON.parse('{"error_404":{"go_home":"Go Home","nothing_here":"Oops. Nothing here..."},"solver":{"guesses":"Guesses: {0}","matching_words":"Matching words: {0}","reset":"Reset","suggested_words":"Suggested words: {0}"}}'),i={"en-US":a},s=(0,o.xr)((({app:e})=>{const r=(0,n.o)({locale:"en-US",messages:i});e.use(r)}))}},r={};function t(o){var n=r[o];if(void 0!==n)return n.exports;var a=r[o]={exports:{}};return e[o](a,a.exports,t),a.exports}t.m=e,(()=>{var e=[];t.O=(r,o,n,a)=>{if(!o){var i=1/0;for(u=0;u<e.length;u++){for(var[o,n,a]=e[u],s=!0,l=0;l<o.length;l++)(!1&a||i>=a)&&Object.keys(t.O).every((e=>t.O[e](o[l])))?o.splice(l--,1):(s=!1,a<i&&(i=a));if(s){e.splice(u--,1);var c=n();void 0!==c&&(r=c)}}return r}a=a||0;for(var u=e.length;u>0&&e[u-1][2]>a;u--)e[u]=e[u-1];e[u]=[o,n,a]}})(),(()=>{t.n=e=>{var r=e&&e.__esModule?()=>e["default"]:()=>e;return t.d(r,{a:r}),r}})(),(()=>{var e,r=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__;t.t=function(o,n){if(1&n&&(o=this(o)),8&n)return o;if("object"===typeof o&&o){if(4&n&&o.__esModule)return o;if(16&n&&"function"===typeof o.then)return o}var a=Object.create(null);t.r(a);var i={};e=e||[null,r({}),r([]),r(r)];for(var s=2&n&&o;"object"==typeof s&&!~e.indexOf(s);s=r(s))Object.getOwnPropertyNames(s).forEach((e=>i[e]=()=>o[e]));return i["default"]=()=>o,t.d(a,i),a}})(),(()=>{t.d=(e,r)=>{for(var o in r)t.o(r,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:r[o]})}})(),(()=>{t.f={},t.e=e=>Promise.all(Object.keys(t.f).reduce(((r,o)=>(t.f[o](e,r),r)),[]))})(),(()=>{t.u=e=>"js/"+e+"."+{608:"54a3f8d7",990:"de9f382f"}[e]+".js"})(),(()=>{t.miniCssF=e=>"css/"+{143:"app",736:"vendor"}[e]+"."+{143:"d9d3f950",736:"429aade8"}[e]+".css"})(),(()=>{t.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()})(),(()=>{t.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r)})(),(()=>{var e={},r="wordle-solver:";t.l=(o,n,a,i)=>{if(e[o])e[o].push(n);else{var s,l;if(void 0!==a)for(var c=document.getElementsByTagName("script"),u=0;u<c.length;u++){var d=c[u];if(d.getAttribute("src")==o||d.getAttribute("data-webpack")==r+a){s=d;break}}s||(l=!0,s=document.createElement("script"),s.charset="utf-8",s.timeout=120,t.nc&&s.setAttribute("nonce",t.nc),s.setAttribute("data-webpack",r+a),s.src=o),e[o]=[n];var f=(r,t)=>{s.onerror=s.onload=null,clearTimeout(p);var n=e[o];if(delete e[o],s.parentNode&&s.parentNode.removeChild(s),n&&n.forEach((e=>e(t))),r)return r(t)},p=setTimeout(f.bind(null,void 0,{type:"timeout",target:s}),12e4);s.onerror=f.bind(null,s.onerror),s.onload=f.bind(null,s.onload),l&&document.head.appendChild(s)}}})(),(()=>{t.r=e=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}})(),(()=>{t.p="/wordle-solver/"})(),(()=>{var e={143:0};t.f.j=(r,o)=>{var n=t.o(e,r)?e[r]:void 0;if(0!==n)if(n)o.push(n[2]);else{var a=new Promise(((t,o)=>n=e[r]=[t,o]));o.push(n[2]=a);var i=t.p+t.u(r),s=new Error,l=o=>{if(t.o(e,r)&&(n=e[r],0!==n&&(e[r]=void 0),n)){var a=o&&("load"===o.type?"missing":o.type),i=o&&o.target&&o.target.src;s.message="Loading chunk "+r+" failed.\n("+a+": "+i+")",s.name="ChunkLoadError",s.type=a,s.request=i,n[1](s)}};t.l(i,l,"chunk-"+r,r)}},t.O.j=r=>0===e[r];var r=(r,o)=>{var n,a,[i,s,l]=o,c=0;if(i.some((r=>0!==e[r]))){for(n in s)t.o(s,n)&&(t.m[n]=s[n]);if(l)var u=l(t)}for(r&&r(o);c<i.length;c++)a=i[c],t.o(e,a)&&e[a]&&e[a][0](),e[a]=0;return t.O(u)},o=self["webpackChunkwordle_solver"]=self["webpackChunkwordle_solver"]||[];o.forEach(r.bind(null,0)),o.push=r.bind(null,o.push.bind(o))})();var o=t.O(void 0,[736],(()=>t(3762)));o=t.O(o)})();