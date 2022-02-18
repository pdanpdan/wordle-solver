(()=>{"use strict";var e={3762:(e,t,o)=>{var r=o(8880),n=o(9592),s=o(3673);function a(e,t,o,r,n,a){const i=(0,s.up)("router-view");return(0,s.wg)(),(0,s.j4)(i)}const i=(0,s.aZ)({name:"App"});var l=o(4260);const d=(0,l.Z)(i,[["render",a]]),c=d;var u=o(7083),h=o(9582);const p=[{name:"solver",path:"/:gameId?",component:()=>Promise.all([o.e(736),o.e(915)]).then(o.bind(o,7915))},{path:"/:catchAll(.*)*",component:()=>Promise.all([o.e(736),o.e(608)]).then(o.bind(o,1608))}],f=p,_=(0,u.BC)((()=>{const e=h.PO,t=(0,h.p7)({scrollBehavior:()=>({left:0,top:0}),routes:f,history:e("/wordle-solver/")});return t}));async function w(e,t){const o="function"===typeof _?await _({}):_,r=e(c);return r.use(n.Z,t),{app:r,router:o}}var g=o(6395),v=o(6417),b=o(1791);const m={config:{},plugins:{LocalStorage:g.Z,Notify:v.Z,Dialog:b.Z}};var y=o(1413);(0,y.z)("/wordle-solver/service-worker.js",{ready(){},registered(){},cached(){},updatefound(){},updated(){v.Z.create({message:"A new version is available.",timeout:1e5,color:"accent",textColor:"white",onDismiss(){window.location.reload()},actions:[{label:"Reload",color:"white"}]})},offline(){},error(){}}),/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream&&window.navigator.standalone&&o.e(736).then(o.t.bind(o,9501,23));const k="/wordle-solver/",O=/\/\//,S=e=>(k+e).replace(O,"/");async function j({app:e,router:t},o){let r=!1;const n=e=>{try{return S(t.resolve(e).href)}catch(o){}return Object(e)===e?null:e},s=e=>{if(r=!0,"string"===typeof e&&/^https?:\/\//.test(e))return void(window.location.href=e);const t=n(e);null!==t&&(window.location.href=t)},a=window.location.href.replace(window.location.origin,"");for(let l=0;!1===r&&l<o.length;l++)try{await o[l]({app:e,router:t,ssrContext:null,redirect:s,urlPath:a,publicPath:k})}catch(i){return i&&i.url?void s(i.url):void console.error("[Quasar] boot error:",i)}!0!==r&&(e.use(t),e.mount("#q-app"))}w(r.ri,m).then((e=>Promise.all([Promise.resolve().then(o.bind(o,7537))]).then((t=>{const o=t.map((e=>e.default)).filter((e=>"function"===typeof e));j(e,o)}))))},7537:(e,t,o)=>{o.r(t),o.d(t,{default:()=>i});var r=o(7083),n=o(5175);const s=JSON.parse('{"error_404":{"go_home":"Go Home","nothing_here":"Oops. Nothing here..."},"guess":{"btn_undo":"Undo guess"},"help":{"btn_close":"Close","credits":"Credits:","instructions":"Instructions:","instructions_1":"You can use it to guess an unknown word (leave the top row empty) or test against a known word (put the word in the top row) - click the pen icon to edit.","instructions_2":"You can choose Easy or Hard mode, using the wordle standard list of words or the full list.","instructions_3":"If the word is not knows the top row will show hints extracted from the guesses.","instructions_4":"You can click a suggested word (or a matching word) to auto fill the guess row - if the word to guess is known the the guess will be automatically checked and added as a guess.","instructions_5":"In the guess row it tries to auto select the match colors. If you guess an unknown word click a letter to cycle the match color (Green - the letter is in the correct position, Yellow - the letter is in the wrong position). A red dot in the corner of a letter means there is a conflict with a previous guess.","source_code":"Source code:","title":"Wordle puzzle solver"},"keyboard":{"btn_keyboard":"Virtual key {0}"},"solver":{"btn_add_guess":"Add guess","btn_change_color":"Mark letter {0} as {1}","btn_edit_target":"Edit target word","btn_help":"Show help dialog","btn_reset_solver":"Reset solver","btn_save_target":"Save target word","btn_to_dark_mode":"Switch to dark mode","btn_easy_full_mode":"Full / Easy","btn_to_easy_full_mode_tooltip":"Switch to full list easy mode","btn_easy_std_mode":"Std / Easy","btn_to_easy_std_mode_tooltip":"Switch to standard list easy mode","btn_hard_full_mode":"Full / Hard","btn_to_hard_full_mode_tooltip":"Switch to full list hard mode","btn_hard_std_mode":"Std / Hard","btn_to_hard_std_mode_tooltip":"Switch to standard list hard mode","btn_to_light_mode":"Switch to light mode","btn_use_word":"Use word {0} as next guess","guesses":"Guesses: {0}","matching_words":"Matching words: {0}","reset":"Reset","share_url_copied":"The url was copied to clipboard","share_url_not_copied":"Please use other method to copy","suggested_words":"Suggested words: {0}","type_in_place":"present in place","type_not_in_place":"present in another place","type_not_present":"not present"}}'),a={"en-US":s},i=(0,r.xr)((({app:e})=>{const t=(0,n.o)({locale:"en-US",messages:a});e.use(t)}))}},t={};function o(r){var n=t[r];if(void 0!==n)return n.exports;var s=t[r]={exports:{}};return e[r](s,s.exports,o),s.exports}o.m=e,(()=>{var e=[];o.O=(t,r,n,s)=>{if(!r){var a=1/0;for(c=0;c<e.length;c++){for(var[r,n,s]=e[c],i=!0,l=0;l<r.length;l++)(!1&s||a>=s)&&Object.keys(o.O).every((e=>o.O[e](r[l])))?r.splice(l--,1):(i=!1,s<a&&(a=s));if(i){e.splice(c--,1);var d=n();void 0!==d&&(t=d)}}return t}s=s||0;for(var c=e.length;c>0&&e[c-1][2]>s;c--)e[c]=e[c-1];e[c]=[r,n,s]}})(),(()=>{o.n=e=>{var t=e&&e.__esModule?()=>e["default"]:()=>e;return o.d(t,{a:t}),t}})(),(()=>{var e,t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__;o.t=function(r,n){if(1&n&&(r=this(r)),8&n)return r;if("object"===typeof r&&r){if(4&n&&r.__esModule)return r;if(16&n&&"function"===typeof r.then)return r}var s=Object.create(null);o.r(s);var a={};e=e||[null,t({}),t([]),t(t)];for(var i=2&n&&r;"object"==typeof i&&!~e.indexOf(i);i=t(i))Object.getOwnPropertyNames(i).forEach((e=>a[e]=()=>r[e]));return a["default"]=()=>r,o.d(s,a),s}})(),(()=>{o.d=(e,t)=>{for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}})(),(()=>{o.f={},o.e=e=>Promise.all(Object.keys(o.f).reduce(((t,r)=>(o.f[r](e,t),t)),[]))})(),(()=>{o.u=e=>"js/"+e+"."+{608:"aa8547b7",915:"9adbd9b8"}[e]+".js"})(),(()=>{o.miniCssF=e=>"css/"+{143:"app",736:"vendor"}[e]+"."+{143:"2c7993d9",736:"bc36fd08"}[e]+".css"})(),(()=>{o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()})(),(()=>{o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t)})(),(()=>{var e={},t="wordle-solver:";o.l=(r,n,s,a)=>{if(e[r])e[r].push(n);else{var i,l;if(void 0!==s)for(var d=document.getElementsByTagName("script"),c=0;c<d.length;c++){var u=d[c];if(u.getAttribute("src")==r||u.getAttribute("data-webpack")==t+s){i=u;break}}i||(l=!0,i=document.createElement("script"),i.charset="utf-8",i.timeout=120,o.nc&&i.setAttribute("nonce",o.nc),i.setAttribute("data-webpack",t+s),i.src=r),e[r]=[n];var h=(t,o)=>{i.onerror=i.onload=null,clearTimeout(p);var n=e[r];if(delete e[r],i.parentNode&&i.parentNode.removeChild(i),n&&n.forEach((e=>e(o))),t)return t(o)},p=setTimeout(h.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=h.bind(null,i.onerror),i.onload=h.bind(null,i.onload),l&&document.head.appendChild(i)}}})(),(()=>{o.r=e=>{"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}})(),(()=>{o.p="/wordle-solver/"})(),(()=>{var e={143:0};o.f.j=(t,r)=>{var n=o.o(e,t)?e[t]:void 0;if(0!==n)if(n)r.push(n[2]);else{var s=new Promise(((o,r)=>n=e[t]=[o,r]));r.push(n[2]=s);var a=o.p+o.u(t),i=new Error,l=r=>{if(o.o(e,t)&&(n=e[t],0!==n&&(e[t]=void 0),n)){var s=r&&("load"===r.type?"missing":r.type),a=r&&r.target&&r.target.src;i.message="Loading chunk "+t+" failed.\n("+s+": "+a+")",i.name="ChunkLoadError",i.type=s,i.request=a,n[1](i)}};o.l(a,l,"chunk-"+t,t)}},o.O.j=t=>0===e[t];var t=(t,r)=>{var n,s,[a,i,l]=r,d=0;if(a.some((t=>0!==e[t]))){for(n in i)o.o(i,n)&&(o.m[n]=i[n]);if(l)var c=l(o)}for(t&&t(r);d<a.length;d++)s=a[d],o.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return o.O(c)},r=globalThis["webpackChunkwordle_solver"]=globalThis["webpackChunkwordle_solver"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})();var r=o.O(void 0,[736],(()=>o(3762)));r=o.O(r)})();