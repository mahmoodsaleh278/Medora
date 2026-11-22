/* =========================================================
   MEDIX STORE — صفحة المتجر الكاملة (ملف مستقل عن app.js)
   - بيتحمّل كسوليًا فقط لما حدا يفتح /store.
   - المنتجات: جدول Supabase اسمه store_products  (شوف store-setup.sql)
   - إظهار/إخفاء المتجر + نصوص الهيرو: medora_data → المفتاح store_settings
   - السلة والمفضّلة محفوظتين بمتصفح الطالب (localStorage)، والطلب بيروح واتساب.
   - بيستخدم من app.js فقط: supabaseClient, state, setData, escapeHtml,
     isAdminSession, openModal, closeModal, render, currentRoute
   ========================================================= */
try{
(function(){
  'use strict';

  const WA_NUMBER = '962781492144';
  const TABLE = 'store_products', BUCKET = 'store', CUR = 'د.أ';
  const LOGO_URL = '/medix-logo.jpg';
  const TRUCK_URL = '/medora-truck.jpg';   /* ارفع الصورة بنفس مجلد الموقع الرئيسي */

  /* on:false = الصنف مخفي من المتجر كله (المنتجات بتضل بقاعدة البيانات). لإرجاع الأسنان: خلّي on:true */
  const CATS = [
    { id:'nursing',   name:'التمريض',    on:true  },
    { id:'dentistry', name:'طب الأسنان', on:false },
    { id:'bundles',   name:'الباقات',    on:true  },
  ];
  const catName = id => (CATS.find(c => c.id === id) || {}).name || '';
  const catOn = id => { const c = CATS.find(x => x.id === id); return !c || c.on !== false; };
  const visCats = () => CATS.filter(c => c.on !== false);
  const cat = p => p.category || 'nursing';
  const DEFAULTS = {
    headline: 'جهّز نفسك لتميّز سنواتك السريرية.',
    sub: 'أدوات تمريض مختارة بعناية — سماعات، أجهزة ضغط، أقلام فحص وأكثر — وبأسعار تناسب الطلاب. ابدأ سنواتك السريرية بأدوات تثق فيها.',
    promo: 'اطلب بسهولة عبر واتساب — التوصيل والخصومات بنتفق عليها مع فريقنا.',
  };

  const S = { loaded:false, loading:false, error:'', items:[], tab:'all', sort:'new', min:'', max:'', stock:false, fopen:false, slide:0, q:'', cartOpen:false, qv:null, qq:1 };

  /* ---------- أدوات صغيرة ---------- */
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const $ = s => document.querySelector(s);
  const fmt = n => (isFinite(Number(n)) ? Number(n).toFixed(2) : '0.00') + ' ' + CUR;
  const safeUrl = u => (/^https:\/\//i.test(u || '') || (u || '').startsWith('/')) ? u : '';
  const allowed = () => isAdminSession() || !!(state.storeSettings && state.storeSettings.visible === true);
  const cfg = k => (state.storeSettings && state.storeSettings[k]) || DEFAULTS[k];
  const lsGet = (k, d) => { try{ const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; }catch(e){ return d; } };
  const lsSet = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  let cart = lsGet('mx_cart', {});
  let wish = new Set(lsGet('mx_wish', []));
  const saveCart = () => lsSet('mx_cart', cart);
  const saveWish = () => lsSet('mx_wish', [...wish]);
  const by = id => S.items.find(p => String(p.id) === String(id));

  /* ---------- أيقونات ورسومات ---------- */
  const IC = {
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>', plus:'<path d="M5 12h14M12 5v14"/>', minus:'<path d="M5 12h14"/>',
    eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>', l:'<path d="m15 18-6-6 6-6"/>', r:'<path d="m9 18 6-6-6-6"/>',
    check:'<path d="M20 6 9 17l-5-5"/>', moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    wa:'<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5Z"/>',
    trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>',
    sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    shield:'<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'
  };
  const ic = (n, s = 18, x = '', cls = '') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${cls}" ${x}>${IC[n]}</svg>`;
  const K = 'currentColor', T = '#8C8C8C', PL = '#CFCFCF';
  const ART = {
    steth:`<path d="M58 34v44a42 42 0 0 0 84 0V34" stroke="${K}" stroke-width="7"/><path d="M100 120v26" stroke="${K}" stroke-width="7"/><circle cx="58" cy="30" r="7" fill="${K}"/><circle cx="142" cy="30" r="7" fill="${K}"/><circle cx="100" cy="164" r="22" fill="${T}"/><circle cx="100" cy="164" r="10" fill="#fff"/>`,
    mirror:`<path d="M50 176 116 92" stroke="${K}" stroke-width="9"/><path d="M44 184 56 169" stroke="${T}" stroke-width="9"/><circle cx="136" cy="64" r="32" fill="${PL}" stroke="${K}" stroke-width="7"/><path d="M120 54a20 20 0 0 1 16-12" stroke="#fff" stroke-width="5"/>`,
    hammer:`<path d="M100 74v104" stroke="${K}" stroke-width="9"/><path d="M58 30h84l-42 52z" fill="${T}" stroke="${K}" stroke-width="5"/><path d="M92 150h16" stroke="${PL}" stroke-width="5"/>`,
    penlight:`<rect x="88" y="70" width="24" height="112" rx="10" fill="${K}"/><rect x="90" y="52" width="20" height="22" rx="4" fill="${T}"/><path d="M100 38V22M82 42 72 30M118 42l10-12" stroke="${T}" stroke-width="5"/><path d="M100 104v26" stroke="${PL}" stroke-width="4"/>`,
    gauge:`<circle cx="100" cy="82" r="48" fill="#fff" stroke="${K}" stroke-width="7"/><path d="M100 82 126 56" stroke="${T}" stroke-width="6"/><circle cx="100" cy="82" r="5" fill="${K}"/><path d="M100 130c0 24-30 18-30 40" stroke="${K}" stroke-width="6"/><ellipse cx="70" cy="176" rx="14" ry="16" fill="${T}"/>`,
    kit:`<path d="M76 70V58a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v12" stroke="${K}" stroke-width="7"/><rect x="30" y="70" width="140" height="98" rx="16" fill="${K}"/><rect x="82" y="94" width="36" height="12" rx="3" fill="${T}"/><rect x="94" y="82" width="12" height="36" rx="3" fill="${T}"/>`
  };
  const art = k => `<svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[k]}</svg>`;
  const ART_BY_CAT = { nursing:['steth','penlight','gauge','hammer'], dentistry:['mirror','hammer'], bundles:['kit'] };
  function artKey(p){
    const arr = ART_BY_CAT[p.category] || ART_BY_CAT.nursing;
    let h = 0; String(p.id || '').split('').forEach(c => h += c.charCodeAt(0));
    return arr[h % arr.length];
  }
  const imgOf = p => safeUrl(p.image_url);

  /* ---------- CSS ---------- */
  function injectCss(){
    if($('#mxStyles')) return;
    const st = document.createElement('style'); st.id = 'mxStyles';
    st.textContent = `
body.mx-full>header,body.mx-full>footer,body.mx-full #adminBannerWrap{display:none!important}
body.mx-full #app{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}
.mx-root{--m-bg:var(--bg,#f3f8fa);--m-surface:var(--card,#fff);--m-mist:color-mix(in srgb,var(--teal,#177a8c) 8%,var(--m-surface));--m-hero:color-mix(in srgb,var(--teal,#177a8c) 13%,var(--m-bg));--m-fg:var(--ink,#0f2a33);--m-body:var(--text,var(--m-fg));--m-muted:var(--muted,#6b8594);--m-line:var(--border,#d9e2ec);--m-ink:var(--teal,#177a8c);--m-onink:#fff;--m-navy:var(--navy,#0d3b47);--m-red:var(--danger,#d64545);--m-redbg:color-mix(in srgb,var(--m-red) 13%,transparent);--m-lift:0 1px 2px rgba(15,42,51,.05),0 14px 34px -14px rgba(15,42,51,.28);
  background:var(--m-bg);color:var(--m-body);font-family:Cairo,system-ui,sans-serif;min-height:100vh;line-height:1.7;-webkit-font-smoothing:antialiased}
body.dark .mx-root{--m-bg:var(--bg,#0f1f26);--m-surface:var(--card,#15262e);--m-fg:var(--ink,#d9f1f6);--m-body:var(--text,#d5e6ec);--m-muted:var(--muted,#8fb0bb);--m-line:var(--border,#24414c);--m-lift:0 1px 2px rgba(0,0,0,.3),0 14px 34px -14px rgba(0,0,0,.6)}
.mx-root,.mx-root *,.mx-root *::before,.mx-root *::after{box-sizing:border-box}
.mx-root :where(h1,h2,h3,h4,p,ul){margin:0;padding:0}
.mx-root :where(ul){list-style:none}
.mx-root :where(h1,h2,h3,h4){color:var(--m-fg);font-family:inherit;font-weight:900;line-height:1.25}
.mx-root a{color:inherit;text-decoration:none}
.mx-root :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.mx-root svg{display:block;flex:none}.mx-root img{max-width:100%}
.mx-root svg [fill="#fff"]{fill:var(--m-surface)}
.mx-root svg [fill="#8C8C8C"]{fill:color-mix(in srgb,var(--m-ink) 60%,var(--m-surface))}.mx-root svg [stroke="#8C8C8C"]{stroke:color-mix(in srgb,var(--m-ink) 60%,var(--m-surface))}
.mx-root svg [fill="#CFCFCF"]{fill:color-mix(in srgb,var(--m-ink) 22%,var(--m-surface))}.mx-root svg [stroke="#CFCFCF"]{stroke:color-mix(in srgb,var(--m-ink) 22%,var(--m-surface))}
.mx-root :focus-visible{outline:2px solid var(--m-fg);outline-offset:2px;border-radius:6px}
html[dir=rtl] .mx-flip{transform:scaleX(-1)}
.mx-in{max-width:80rem;margin:0 auto;padding:0 1rem}
.mx-muted{color:var(--m-muted)}
/* أزرار */
.mx-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:.85rem 2rem;font-size:.95rem;font-weight:700;transition:opacity .15s,background .15s,border-color .15s,color .15s}
.mx-btn.ink{background:var(--m-ink);color:var(--m-onink)!important}.mx-btn.ink:hover{opacity:.82}
.mx-btn.line{border:1px solid var(--m-line);background:var(--m-surface);color:var(--m-fg)}.mx-btn.line:hover{border-color:var(--m-fg)}
.mx-btn.sm{padding:.55rem 1.1rem;font-size:.85rem}.mx-btn.block{width:100%}
.mx-btn[disabled],.mx-btn.off{opacity:.4;pointer-events:none}
/* شريط الإعلان */
.mx-promo{background:var(--m-navy);color:#fff;font-size:.82rem;text-align:center}
.mx-promo .mx-in{position:relative;padding:.55rem 2.5rem}
.mx-promo a{text-decoration:underline;font-weight:700;margin-inline-start:.5rem;white-space:nowrap}
.mx-promo button{position:absolute;inset-inline-end:.75rem;top:50%;transform:translateY(-50%);color:#fff;padding:.3rem;opacity:.8}
/* شريط المشرف */
.mx-admin{background:var(--m-mist);border-bottom:1.5px dashed var(--m-fg)}
.mx-admin .mx-in{display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;align-items:center;padding-top:.6rem;padding-bottom:.6rem;font-size:.9rem}
.mx-sw{display:flex;align-items:center;gap:.6rem;font-weight:700;color:var(--m-fg);cursor:pointer}
.mx-sw input{width:1.1rem;height:1.1rem;accent-color:var(--m-ink)}
.mx-pill{font-size:.75rem;font-weight:800;padding:.15rem .65rem;border-radius:999px}
.mx-pill.on{background:rgba(30,160,100,.16);color:#12875a}.mx-pill.off{background:rgba(220,60,60,.15);color:#c0392b}
.mx-admin .sp{margin-inline-start:auto;display:flex;gap:.5rem;flex-wrap:wrap}
/* الهيدر */
.mx-head{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--m-line);background:color-mix(in srgb,var(--m-bg) 90%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.mx-head .mx-in{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.5rem;padding-top:.8rem;padding-bottom:.8rem}
.mx-brand{display:flex;flex-wrap:nowrap;align-items:center;gap:.55rem;flex:none;white-space:nowrap}
.mx-brand img{height:2rem;width:auto;border-radius:6px;flex:none}
.mx-root .mx-xs{display:inline-block;flex:none;height:.74em;width:.94em;vertical-align:-.03em;margin-inline:-.02em 0;color:inherit;overflow:visible}
.mx-brand b{direction:ltr;unicode-bidi:isolate;font-size:1.45rem;font-weight:900;color:var(--m-fg);font-family:Lexend,Cairo,system-ui,sans-serif;letter-spacing:-.01em;line-height:1}
.mx-nav{display:none;align-items:center;gap:.25rem}
.mx-nav button{border-radius:999px;padding:.4rem .9rem;font-size:.95rem;font-weight:600}.mx-nav button:hover{background:var(--m-mist)}
.mx-search{position:relative;order:9;width:100%}
.mx-search input{width:100%;border-radius:999px;border:1px solid transparent;background:var(--m-mist);color:var(--m-fg);padding:.65rem 2.8rem;font:inherit;font-size:1rem;outline:0}
.mx-search input:focus{border-color:var(--m-fg)}
.mx-search .si{position:absolute;inset-inline-start:1rem;top:50%;transform:translateY(-50%);color:var(--m-muted);pointer-events:none}
.mx-sl{position:absolute;inset-inline:0;top:calc(100% + .5rem);background:var(--m-surface);border:1px solid var(--m-line);border-radius:1rem;padding:.3rem;box-shadow:var(--m-lift);z-index:5}
.mx-sl[hidden]{display:none}
.mx-sl button,.mx-sl p{display:flex;width:100%;justify-content:space-between;gap:.5rem;text-align:start;border-radius:.7rem;padding:.55rem .75rem;font-size:.9rem}
.mx-sl button:hover{background:var(--m-mist)}.mx-sl p{color:var(--m-muted)}
.mx-acts{display:flex;align-items:center;margin-inline-start:auto}
.mx-acts{gap:.45rem}
.mx-ib{position:relative;border-radius:999px;padding:.62rem;color:var(--m-fg);background:var(--m-mist);border:1.5px solid var(--m-fg);display:grid;place-items:center;transition:background .15s,color .15s}.mx-ib svg{width:22px;height:22px;stroke-width:2.6}.mx-ib:hover{background:var(--m-ink);color:var(--m-onink);border-color:var(--m-ink)}
.mx-badge-n{position:absolute;top:-.25rem;inset-inline-end:-.25rem;min-width:1.1rem;height:1.1rem;border-radius:999px;padding:0 .3rem;font-size:.7rem;font-weight:800;border:2px solid var(--m-bg);background:var(--m-red);color:var(--m-onink);display:grid;place-items:center;line-height:1}
.mx-chips{display:flex;gap:.5rem;overflow-x:auto;border-top:1px solid var(--m-line);padding:.5rem 1rem}
.mx-chips button{flex:none;background:var(--m-mist);border-radius:999px;padding:.3rem 1rem;font-size:.9rem;font-weight:600}
/* شريط الفلاتر العلوي */
.mx-fbar{background:var(--m-surface);border-bottom:1px solid var(--m-line)}
.mx-fbar .mx-in{display:flex;flex-wrap:nowrap;align-items:center;gap:.6rem;overflow-x:auto;padding-top:.6rem;padding-bottom:.6rem;scrollbar-width:none}
.mx-fbar .mx-in::-webkit-scrollbar{display:none}
.mx-fbar .fi{flex:none;color:var(--m-muted)}
.mx-fbar select,.mx-fbar input[type=number]{flex:none;border:1px solid var(--m-line);background:var(--m-mist);color:var(--m-fg);border-radius:999px;padding:.42rem .95rem;font:inherit;font-size:.88rem;font-weight:600;outline:0;cursor:pointer}
.mx-fbar input[type=number]{width:6.5rem;cursor:text}
#mxMin{width:8.5rem!important}
.mx-fbar input[type=number]::-webkit-inner-spin-button,.mx-fbar input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.mx-fbar input[type=number]{-moz-appearance:textfield;appearance:textfield}
.mx-fbar select:focus,.mx-fbar input:focus{border-color:var(--m-ink)}
.mx-fbar select option{color:#000}
.mx-fbar .mx-pr{flex:none;align-items:center}
.mx-fbar .mx-chk{flex:none;white-space:nowrap;font-size:.88rem}
.mx-feat,.mx-hero{scroll-margin-top:5rem}
/* بانر التوصيل */
.mx-deliv{display:grid;gap:0;align-items:center;background:var(--m-mist);border:1px solid var(--m-line);border-radius:1.75rem;padding:.8rem 1.25rem .6rem;overflow:hidden;text-align:center}
.dv-txt b{display:block;white-space:nowrap;font-size:clamp(1.1rem,5.2vw,2.2rem);font-weight:900;line-height:1.3;color:var(--m-fg)}
.dv-txt em{display:block;font-style:normal;color:var(--m-ink);margin-inline-start:0}
.dv-vis{position:relative;direction:ltr;order:-1;display:flex;justify-content:center;align-items:flex-end}
.dv-truck{display:block;width:min(88%,19rem);height:auto;mix-blend-mode:multiply;animation:none}
.dv-road{position:absolute;left:0;right:0;bottom:.3rem;height:4px;border-radius:4px;background:repeating-linear-gradient(90deg,color-mix(in srgb,var(--m-fg) 40%,transparent) 0 26px,transparent 26px 52px);background-size:52px 4px;animation:mxroad .22s linear infinite}
.dv-dust{position:absolute;left:calc(50% - 9.5rem);bottom:.35rem;width:.9rem;height:.9rem;border-radius:50%;background:color-mix(in srgb,var(--m-fg) 28%,transparent);opacity:0;animation:mxdust .7s ease-out infinite}
.dv-dust.d2{animation-delay:.23s;bottom:.75rem}.dv-dust.d3{animation-delay:.46s;bottom:.45rem}
.dv-lines i{position:absolute;height:4px;border-radius:4px;background:var(--m-ink);opacity:0;animation:mxline .5s linear infinite}
.dv-lines i:nth-child(1){left:4%;top:42%;width:3rem}
.dv-lines i:nth-child(2){left:1%;top:56%;width:2.2rem;animation-delay:.3s}
.dv-lines i:nth-child(3){left:6%;top:70%;width:3.4rem;animation-delay:.6s}
body.dark .dv-vis{background:#fff;border-radius:1.1rem}
@keyframes mxbob{0%,100%{transform:translateX(-50%) translateY(0) rotate(0)}25%{transform:translateX(-50%) translateY(-1px) rotate(-.15deg)}50%{transform:translateX(-50%) translateY(0) rotate(0)}75%{transform:translateX(-50%) translateY(-.5px) rotate(.15deg)}}
@keyframes mxdrive{0%,100%{margin-left:-8px}50%{margin-left:8px}}
@keyframes mxdust{0%{transform:translate(0,0) scale(.4);opacity:.55}100%{transform:translate(-3.2rem,-.9rem) scale(1.5);opacity:0}}
@keyframes mxroad{to{background-position-x:-52px}}
@keyframes mxline{0%{transform:translateX(70%);opacity:0}25%{opacity:.4}100%{transform:translateX(-90%);opacity:0}}
@media(min-width:640px){.mx-deliv{grid-template-columns:auto minmax(14rem,20rem);justify-content:center;gap:1rem;padding:1rem 2.25rem;text-align:start}.dv-vis{order:0}.dv-truck{width:100%}.dv-truck{width:min(92%,24rem)}}
/* الهيرو */
.mx-hero{overflow:hidden;background:var(--m-hero)}
.mx-hero .mx-in{display:grid;gap:2rem;align-items:center;padding-top:2.5rem;padding-bottom:2.5rem}
.mx-hero h1{font-size:clamp(2.3rem,7vw,4.2rem);line-height:1.2;max-width:36rem}
.mx-hero .lead{margin-top:1.25rem;max-width:30rem;font-size:1rem;color:var(--m-muted)}
.mx-cta{margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:.75rem}
.mx-stats{margin-top:2rem;display:flex;flex-wrap:wrap;align-items:center;gap:1rem 0}
.mx-stat{padding:0 1.4rem;border-inline-end:1px solid var(--m-line)}
.mx-stat:first-child{padding-inline-start:0}.mx-stat:last-child{border:0}
.mx-stat b{display:block;font-size:clamp(1.6rem,4.5vw,2.4rem);font-weight:900;color:var(--m-fg);line-height:1.15}
.mx-stat span{font-size:.85rem;color:var(--m-muted)}
.mx-stage{position:relative;margin:0 auto;aspect-ratio:1/1;width:100%;max-width:25rem;perspective:1000px}
.mx-tilt{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .15s ease-out}
.mx-plate{position:absolute;inset:8%;border-radius:2.5rem;background:var(--m-surface);box-shadow:var(--m-lift)}
.mx-plate.round{border-radius:50%}
.mx-ha{position:absolute;inset:18%;display:grid;place-items:center;transform:translateZ(60px);filter:drop-shadow(0 18px 18px rgba(0,0,0,.16))}
.mx-ha img{width:100%;height:100%;object-fit:contain}
.mx-ha.logo{inset:14%;filter:none}.mx-ha.logo img{border-radius:50%;object-fit:cover}
.mx-spark{position:absolute;color:var(--m-fg);pointer-events:none;z-index:2}
.mx-spark.s1{width:4.4rem;height:4.4rem;inset-inline-end:0;top:2%}
.mx-spark.s2{width:2.6rem;height:2.6rem;inset-inline-start:0;top:42%}
.mx-fade{animation:mxfade .3s ease both;width:100%;height:100%}@keyframes mxfade{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}
.mx-hcard{margin:1.5rem auto 0;max-width:25rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;border-radius:1.25rem;background:var(--m-surface);padding:.9rem 1rem;box-shadow:var(--m-lift)}
.mx-hcard .t{min-width:0}.mx-hcard b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.92rem;color:var(--m-fg)}
.mx-dots{margin:.75rem auto 0;display:flex;align-items:center;justify-content:center;gap:.6rem}
.mx-dots .d{height:.5rem;width:.5rem;border-radius:999px;background:var(--m-line)}.mx-dots .d.on{width:1.5rem;background:var(--m-ink)}
.mx-dots .ar{border-radius:999px;padding:.4rem;color:var(--m-fg)}.mx-dots .ar:hover{background:var(--m-surface)}
/* شريط القيم الأسود */
.mx-band{background:var(--m-navy);color:#fff}
.mx-band ul{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:1rem 1.25rem;padding:1.25rem 0}
.mx-band li{display:flex;align-items:center;gap:.6rem;white-space:nowrap;min-width:0;font-weight:800;font-size:clamp(.95rem,2.6vw,1.4rem)}
.mx-band svg{color:#fff;width:1.5rem;height:1.5rem}
/* تسوّق حسب الأداة */
.mx-sec{padding:3rem 0 1rem}
.mx-title{text-align:center;font-size:clamp(1.9rem,5vw,3rem)}








/* المتجر: فلاتر + منتجات */
.mx-feat{padding:2.5rem 0 4rem}
.mx-crumb{display:flex;align-items:center;gap:.4rem;font-size:.88rem;color:var(--m-muted)}.mx-crumb b{color:var(--m-fg);font-weight:600}
.mx-layout{margin-top:1rem;display:grid;gap:1.25rem}
.mx-flt{display:none;border:1px solid var(--m-line);border-radius:1.25rem;padding:1.25rem;background:var(--m-surface);align-self:start}
.mx-flt.open{display:block}
.mx-flt>h3{display:flex;align-items:center;justify-content:space-between;font-size:1.2rem;font-weight:800;padding-bottom:.5rem}
.mx-fl{border-top:1px solid var(--m-line);padding:1rem 0}
.mx-fl h4{font-size:1rem;font-weight:800;margin-bottom:.4rem}
.mx-fl .opt{display:flex;width:100%;align-items:center;justify-content:space-between;padding:.35rem 0;color:var(--m-muted);font-size:.95rem;text-align:start}
.mx-fl .opt:hover{color:var(--m-fg)}.mx-fl .opt.on{color:var(--m-fg);font-weight:800}
.mx-fl .opt small{font-size:.78rem}
.mx-pr{display:flex;gap:.5rem}
.mx-pr input{width:100%;min-width:0;border:1px solid transparent;background:var(--m-mist);color:var(--m-fg);border-radius:.8rem;padding:.5rem .75rem;font:inherit;font-size:.92rem;outline:0}
.mx-pr input:focus{border-color:var(--m-fg)}
.mx-chk{display:flex;gap:.55rem;align-items:center;cursor:pointer;font-size:.95rem;font-weight:600;color:var(--m-fg)}
.mx-chk input{width:1.05rem;height:1.05rem;accent-color:var(--m-ink)}
.mx-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem}
.mx-top h2{font-size:clamp(1.7rem,4vw,2.1rem)}
.mx-tbr{display:flex;align-items:center;gap:.6rem}
.mx-sort{display:flex;align-items:center;gap:.4rem;font-size:.9rem;color:var(--m-muted)}
.mx-sort select{border:0;background:transparent;color:var(--m-fg);font:inherit;font-size:.9rem;font-weight:700;outline:0;cursor:pointer;padding:.3rem}
.mx-sort select option{color:#000}
.mx-bl{margin-top:.4rem;display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .75rem;font-size:.9rem;color:var(--m-muted);min-height:1.8rem}
.mx-fchip{display:inline-flex;align-items:center;gap:.4rem;border-radius:999px;background:var(--m-ink);color:var(--m-onink);padding:.2rem .5rem .2rem .85rem;font-size:.82rem;font-weight:700}
.mx-clr{font-size:.85rem;font-weight:700;color:var(--m-fg);text-decoration:underline}
.mx-grid{margin-top:1.1rem;display:grid;gap:1.5rem 1rem;grid-template-columns:repeat(2,1fr)}
.mx-grp{margin-top:2.25rem}.mx-grp:first-child{margin-top:1rem}
.mx-gh{display:flex;align-items:baseline;gap:.75rem;border-bottom:1px solid var(--m-line);padding-bottom:.6rem}
.mx-gh h3{font-size:1.3rem}.mx-gh span{color:var(--m-muted);font-size:.85rem}
.mx-card{position:relative;display:flex;flex-direction:column}
.mx-card.hid{opacity:.55}
.mx-tile{position:relative;display:grid;place-items:center;aspect-ratio:1/1;background:var(--m-mist);border-radius:1.25rem;overflow:hidden;cursor:pointer}
.mx-tile .pimg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:1rem;mix-blend-mode:multiply;transition:transform .3s}
body.dark .mx-tile .pimg{mix-blend-mode:normal}
.mx-tile:hover .pimg,.mx-tile:hover .art7{transform:scale(1.05)}
.mx-tile .art7{width:62%;height:62%;transition:transform .3s}
.mx-tag{position:absolute;top:.7rem;inset-inline-start:.7rem;border-radius:999px;padding:.1rem .7rem;font-size:.72rem;font-weight:700;background:var(--m-ink);color:var(--m-onink)}
.mx-tag.out{background:var(--m-red);color:#fff;top:auto;bottom:.7rem}
.mx-wish{position:absolute;top:.6rem;inset-inline-end:.6rem;border-radius:999px;background:var(--m-surface);color:var(--m-fg);padding:.45rem;box-shadow:0 1px 3px rgba(0,0,0,.14)}
.mx-wish.on{color:var(--m-red)}
.mx-cb{display:flex;flex:1;flex-direction:column;gap:.35rem;padding:.75rem .1rem 0}
.mx-cb h3{font-size:1rem;font-weight:700;line-height:1.5}
.mx-cb .ttl{text-align:start;font-weight:700;color:var(--m-fg)}.mx-cb .ttl:hover{text-decoration:underline}
.mx-cb .mx-btn{margin-top:.35rem}
.mx-prow{display:flex;align-items:center;flex-wrap:wrap;gap:.2rem .55rem}
.mx-price{font-size:1.2rem;font-weight:800;color:var(--m-fg)}
.mx-old{font-size:1.05rem;font-weight:700;color:var(--m-muted);text-decoration:line-through}
.mx-off{background:var(--m-redbg);color:var(--m-red);border-radius:999px;font-size:.75rem;font-weight:700;padding:.1rem .6rem}
.mx-arow{display:flex;gap:.4rem;border-top:1px dashed var(--m-line);padding-top:.6rem;margin-top:.3rem}
.mx-arow button{flex:1;border:1px solid var(--m-line);border-radius:.6rem;padding:.3rem;font-size:.78rem;font-weight:700;background:var(--m-mist)}
.mx-arow .del{color:#c0392b}
.mx-empty{grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--m-muted)}.mx-empty h3{margin-bottom:.4rem}
/* السلة وصفحة المنتج */
.mx-ov{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.5)}.mx-ov[hidden]{display:none}
.mx-drawer{position:fixed;top:0;bottom:0;inset-inline-end:0;z-index:51;width:100%;max-width:28rem;background:var(--m-surface);box-shadow:-10px 0 40px rgba(0,0,0,.25);display:flex;flex-direction:column;visibility:hidden;transition:transform .28s ease,visibility 0s .28s;transform:translateX(100%)}
html[dir=rtl] .mx-drawer{transform:translateX(-100%)}
.mx-drawer.open,html[dir=rtl] .mx-drawer.open{transform:none;visibility:visible;transition:transform .28s ease}
.mx-dh{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem}.mx-dh h2{font-size:1.4rem}
.mx-dl{flex:1;overflow-y:auto;padding:0 1.25rem}
.mx-dl li{display:flex;gap:1rem;padding:1rem 0;border-top:1px solid var(--m-line)}
.mx-dl .th{width:5.8rem;height:5.8rem;border-radius:1rem;flex:none;display:grid;place-items:center;background:var(--m-mist);overflow:hidden}
.mx-dl .th img{width:100%;height:100%;object-fit:contain;padding:.4rem;mix-blend-mode:multiply}body.dark .mx-dl .th img{mix-blend-mode:normal}
.mx-dl .th .a{width:3.6rem;height:3.6rem}
.mx-dl .in{flex:1;min-width:0;display:flex;flex-direction:column;gap:.35rem}
.mx-dl .tr{display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem}
.mx-dl .tr b{font-size:.95rem;font-weight:700;color:var(--m-fg);line-height:1.5}
.mx-rm{color:var(--m-red);padding:.2rem;flex:none}
.mx-dl .br{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:.5rem}
.mx-qty{display:inline-flex;align-items:center;background:var(--m-mist);border-radius:999px}
.mx-qty button{padding:.5rem .75rem}.mx-qty span{min-width:1.5rem;text-align:center;font-size:.92rem;font-weight:700}
.mx-df{border-top:1px solid var(--m-line);padding:1.25rem}
.mx-df h3{font-size:1.2rem;margin-bottom:.75rem}
.mx-df .r{display:flex;justify-content:space-between;font-size:.95rem;color:var(--m-muted);padding:.2rem 0}.mx-df .r b{color:var(--m-fg);font-weight:700}
.mx-df .r.d b{color:var(--m-red)}
.mx-df .r.t{border-top:1px solid var(--m-line);margin-top:.5rem;padding-top:.75rem;font-size:1.1rem;color:var(--m-fg)}.mx-df .r.t b{font-weight:900;font-size:1.3rem}
.mx-df small{display:block;margin:.6rem 0 1rem;color:var(--m-muted);font-size:.78rem}
.mx-dempty{flex:1;display:grid;place-content:center;justify-items:center;gap:.75rem;padding:2rem;text-align:center}
.mx-qv{position:fixed;inset:0;z-index:52;display:grid;place-items:center;overflow-y:auto;padding:1rem}.mx-qv[hidden]{display:none}
.mx-qv .bg{position:absolute;inset:0;background:rgba(0,0,0,.55)}
.mx-qvb{position:relative;display:grid;width:100%;max-width:56rem;overflow:hidden;border-radius:1.75rem;background:var(--m-surface);box-shadow:0 25px 60px rgba(0,0,0,.35)}
.mx-qvb .vis{display:grid;place-items:center;padding:2rem;min-height:15rem;background:var(--m-mist);margin:1rem;border-radius:1.25rem}
.mx-qvb .vis img{width:100%;max-height:22rem;object-fit:contain;mix-blend-mode:multiply}body.dark .mx-qvb .vis img{mix-blend-mode:normal}
.mx-qvb .vis .a{width:11rem;height:11rem}
.mx-qvb .inf{display:flex;flex-direction:column;gap:.9rem;padding:1.25rem 1.5rem 1.75rem}
.mx-qvb h3{font-size:1.8rem;padding-inline-end:2.5rem}
.mx-qvb .xx{position:absolute;top:1.4rem;inset-inline-end:1.4rem;z-index:2;background:var(--m-surface);color:var(--m-fg);border-radius:999px;padding:.5rem;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.mx-div{border-top:1px solid var(--m-line)}
.mx-incl{display:grid;gap:.4rem;font-size:.92rem}.mx-incl li{display:flex;align-items:center;gap:.5rem}.mx-incl svg{color:var(--m-fg)}
.mx-buy{margin-top:auto;display:flex;align-items:center;gap:.75rem}
.mx-buy .mx-qty{padding:.15rem .25rem}
/* الفوتر */
.mx-fin{background:var(--m-navy);color:#fff}
body.dark .mx-promo,body.dark .mx-band,body.dark .mx-fin{background:color-mix(in srgb,var(--m-ink) 24%,var(--m-bg))}
.mx-fin .mx-in{display:flex;flex-wrap:wrap;gap:1.25rem 2rem;justify-content:space-between;align-items:center;padding-top:2.25rem;padding-bottom:2.25rem}
.mx-fin .lg{display:block;white-space:nowrap;direction:ltr;unicode-bidi:isolate;font-size:1.6rem;font-weight:900;font-family:Lexend,Cairo,system-ui,sans-serif}
.mx-fin p{font-size:.9rem;opacity:.7}
.mx-fin .ln{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;font-weight:700;font-size:.92rem}.mx-fin .ln a:hover{text-decoration:underline}
.mx-fin small{width:100%;border-top:1px solid rgba(255,255,255,.15);padding-top:1rem;font-size:.82rem;opacity:.6}
.mx-apply{margin-top:.5rem}
@media(max-width:639px){.mx-cta .mx-btn{flex:1}
.mx-head .mx-in{flex-wrap:wrap;gap:.6rem .5rem;justify-content:space-between;padding-top:.6rem;padding-bottom:.6rem}
.mx-brand b{font-size:1.2rem}.mx-brand img{height:1.8rem}
.mx-acts{gap:.3rem;margin-inline-start:0}.mx-ib{padding:.48rem}.mx-ib svg{width:20px;height:20px}
.mx-search{flex:0 0 100%}
.mx-hero h1{font-size:clamp(1.8rem,7.4vw,2.6rem)}
.mx-hero .mx-in{padding-top:1.75rem;padding-bottom:1.75rem;gap:1.5rem}
.mx-band li{font-size:clamp(.74rem,3.3vw,.95rem);gap:.4rem}.mx-band svg{width:1.15rem;height:1.15rem;flex:none}
.mx-top h2{font-size:1.5rem}
.mx-fin .mx-in{flex-direction:column;align-items:flex-start;gap:1rem}
.mx-fin .ln{gap:.4rem 1.25rem}
.mx-promo{font-size:.78rem}}
@media(min-width:640px){.mx-in{padding:0 1.5rem}}
@media(min-width:768px){.mx-band ul{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem 2rem;padding:1.5rem 0}.mx-nav{display:flex}.mx-chips{display:none}.mx-search{order:0;width:auto;flex:1;max-width:40rem}.mx-acts{margin-inline-start:auto}.mx-qvb{grid-template-columns:1fr 1fr}.mx-hero .mx-in{padding-top:4rem;padding-bottom:4rem}}
@media(min-width:1024px){.mx-hero .mx-in{grid-template-columns:1.05fr 1fr}.mx-grid{grid-template-columns:repeat(4,1fr)}.mx-fbar .mx-in{flex-wrap:wrap;overflow:visible}}
.mx-intro{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#fff;opacity:1;transition:opacity .5s ease;cursor:pointer;perspective:900px;overflow:hidden}
.mx-intro.out{opacity:0;pointer-events:none}
.mx-i-wrap{display:flex;flex-direction:column;align-items:center;gap:1.1rem;padding:1rem;max-width:100%}
.mx-i3{transform-style:preserve-3d;transform:rotateY(-75deg) rotateX(18deg) scale(.8);opacity:0;will-change:transform}
.mx-intro.go .mx-i3{animation:mxI3 1.7s cubic-bezier(.22,.9,.25,1) .05s forwards}
.mx-im{display:block;width:min(62vw,270px);height:auto;overflow:visible;filter:drop-shadow(0 14px 14px rgba(20,92,97,.22))}
.mx-im .dr{fill:none;stroke:#2A9D9A;stroke-width:3.2;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
.mx-im .ex{opacity:0}.mx-im .fl{opacity:0}
.mx-intro.go .mx-im .dr{animation:mxDraw 1.25s ease-in-out .1s forwards,mxFade .4s ease 1.55s forwards reverse}
.mx-intro.go .mx-im .ex{animation:mxFade .6s ease 1.05s forwards}
.mx-intro.go .mx-im .fl{animation:mxFade .55s ease 1.2s forwards}
.mx-it{display:flex;flex-direction:column;align-items:center;gap:.45rem;perspective:700px}
.mx-iname{display:flex;align-items:center;direction:ltr;font:900 clamp(2.2rem,11.5vw,3.5rem)/1 Lexend,Cairo,system-ui,sans-serif;letter-spacing:-.01em;color:#2B3C4D;white-space:nowrap}
.mx-iname>span{display:inline-block;opacity:0;transform-origin:50% 100%;transform:rotateX(-100deg) translateY(.4em)}
.mx-iname .mx-xs{display:block;height:.74em;width:.94em;margin-inline:-.02em 0;overflow:visible}
.mx-intro.go .mx-iname>span{animation:mxLet .6s cubic-bezier(.2,.9,.3,1.15) forwards;animation-delay:calc(1.75s + var(--i)*.09s)}
.mx-istore{display:flex;align-items:center;gap:.9rem;direction:ltr;color:#2A9D9A;font:500 clamp(1rem,4.6vw,1.45rem)/1 Lexend,Cairo,system-ui,sans-serif;letter-spacing:.5em;opacity:0;transform:translateY(8px)}
.mx-istore:before,.mx-istore:after{content:"";height:2px;width:clamp(1.5rem,9vw,3.5rem);background:#2A9D9A;opacity:.7}
.mx-istore b{font-weight:500;margin-right:-.5em}
.mx-itag{font:400 clamp(.5rem,2.3vw,.7rem)/1.4 Lexend,Cairo,system-ui,sans-serif;letter-spacing:.28em;color:#2B3C4D;opacity:0;direction:ltr;text-align:center;margin-top:.4rem}
.mx-intro.go .mx-istore{animation:mxRise .6s ease 2.65s forwards}
.mx-intro.go .mx-itag{animation:mxRise .6s ease 3s forwards}
@keyframes mxI3{0%{opacity:0;transform:rotateY(-75deg) rotateX(18deg) scale(.8)}35%{opacity:1}70%{transform:rotateY(10deg) rotateX(-4deg) scale(1.02)}100%{opacity:1;transform:rotateY(0) rotateX(0) scale(1)}}
@keyframes mxDraw{to{stroke-dashoffset:0}}
@keyframes mxFade{to{opacity:1}}
@keyframes mxLet{to{opacity:1;transform:rotateX(0) translateY(0)}}
@keyframes mxRise{to{opacity:1;transform:none}}
/* ===== صفحة الدفع CliQ ===== */
.mx-co{position:fixed;inset:0;z-index:60;background:var(--m-bg);overflow-y:auto;-webkit-overflow-scrolling:touch}
.mx-co .cw{max-width:62rem;margin:0 auto;padding:1rem 1rem 3rem}
.mx-co .ch{display:flex;align-items:center;justify-content:space-between;padding:.5rem 0 1rem}.mx-co .ch h2{font-size:1.5rem}
.mx-co .cc{background:var(--m-surface);border:1px solid var(--m-line);border-radius:1.1rem;padding:1.1rem;margin-bottom:1rem}
.mx-co .ct{display:flex;align-items:center;gap:.6rem;font-weight:900;color:var(--m-fg);font-size:1.05rem;margin-bottom:.8rem}
.mx-co .cn{width:1.9rem;height:1.9rem;border-radius:50%;background:var(--m-mist);color:var(--m-ink);display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:.9rem;flex:none}
.mx-co .cs{display:grid;gap:.8rem;grid-template-columns:1fr}
.mx-co .cs>div{display:flex;gap:.8rem;align-items:center;background:var(--m-mist);border:1px solid var(--m-line);border-radius:1rem;padding:.9rem}
.mx-co .cs .ico{width:2.6rem;height:2.6rem;border-radius:50%;background:var(--m-ink);color:var(--m-onink);display:flex;align-items:center;justify-content:center;flex:none}
.mx-co .cs b{display:block;color:var(--m-fg);font-size:.95rem}.mx-co .cs span{font-size:.8rem;color:var(--m-muted)}
.mx-co .cq{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.mx-co .cq .logo{font-weight:900;font-size:1.3rem;color:var(--m-fg);background:var(--m-mist);border:1px solid var(--m-line);border-radius:.9rem;padding:1rem 1.4rem}
.mx-co .cq dl{margin:0;display:grid;gap:.25rem;font-size:.88rem}.mx-co .cq dt{display:inline;color:var(--m-muted)}.mx-co .cq dd{display:inline;margin:0;font-weight:800;color:var(--m-fg)}
.mx-co .alias{font-size:1.25rem;font-weight:900;color:var(--m-ink);letter-spacing:1px;direction:ltr;display:inline-block}
.mx-co .cp{display:inline-flex;align-items:center;gap:.3rem;margin-inline-start:.5rem;font-size:.75rem;font-weight:800;border:1px solid var(--m-line);border-radius:999px;padding:.15rem .6rem;color:var(--m-ink);background:var(--m-surface)}
.mx-co .cg{display:grid;gap:1rem;grid-template-columns:1fr}
.mx-co label.lb{display:block;font-size:.8rem;font-weight:800;color:var(--m-fg);margin:.7rem 0 .3rem}
.mx-co input[type=text],.mx-co input[type=tel],.mx-co textarea{width:100%;font:inherit;font-size:.92rem;color:var(--m-fg);background:var(--m-mist);border:1px solid var(--m-line);border-radius:.7rem;padding:.65rem .8rem}
.mx-co textarea{resize:vertical;min-height:4rem}
.mx-co .up{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;width:100%;min-height:7.5rem;border:2px dashed var(--m-line);border-radius:.9rem;background:var(--m-mist);color:var(--m-ink);font-weight:800;font-size:.9rem;text-align:center;padding:1rem}
.mx-co .up small{color:var(--m-muted);font-weight:500}
.mx-co .fl{display:flex;align-items:center;justify-content:space-between;gap:.6rem;background:var(--m-mist);border:1px solid var(--m-line);border-radius:.9rem;padding:.8rem 1rem;font-size:.88rem;color:var(--m-fg);word-break:break-all}
.mx-co .fl button{color:var(--m-red);font-weight:800;flex:none}
.mx-co .sm-l{display:flex;justify-content:space-between;gap:.6rem;font-size:.88rem;padding:.25rem 0;color:var(--m-muted)}.mx-co .sm-l b{color:var(--m-fg)}
.mx-co .sm-l.d b{color:var(--m-red)}
.mx-co .tot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--m-line);margin-top:.7rem;padding-top:.8rem;font-weight:900;color:var(--m-fg)}.mx-co .tot b{font-size:1.5rem;color:var(--m-ink)}
.mx-co .cr{display:flex;gap:.5rem}.mx-co .cr input{flex:1;direction:ltr;text-transform:uppercase;letter-spacing:1px}
.mx-co .chip{display:flex;align-items:center;justify-content:space-between;gap:.5rem;background:var(--m-mist);border:1px solid var(--m-ink);border-radius:.8rem;padding:.55rem .8rem;font-size:.85rem;font-weight:800;color:var(--m-fg)}.mx-co .chip button{color:var(--m-red)}
.mx-co .hint{font-size:.76rem;color:var(--m-muted);margin:.5rem 0}
.mx-co .err{color:var(--m-red);font-size:.84rem;font-weight:700;margin:.6rem 0}
.mx-co .ok{text-align:center;padding:2.5rem 1rem}.mx-co .ok .big{width:4.5rem;height:4.5rem;border-radius:50%;background:var(--m-ink);color:var(--m-onink);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem}
@media(min-width:640px){.mx-co .cs{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.mx-co .cg{grid-template-columns:1.15fr 1fr;align-items:start}}
.mx-co .tb{display:inline-flex;align-items:center;gap:.4rem;border-radius:999px;padding:.3rem .9rem;font-weight:900;font-size:.9rem;color:#fff}
.mx-co .tb.pending{background:#b7791f}.mx-co .tb.approved{background:#2f855a}.mx-co .tb.rejected{background:#c53030}
.mx-co .tr{max-width:34rem;margin:0 auto}
@media(prefers-reduced-motion:reduce){.mx-intro{display:none}}
@media(prefers-reduced-motion:reduce){.mx-root *{animation:none!important;transition-duration:.01ms!important}}`;
    document.head.appendChild(st);
  }

  /* ---------- تحميل المنتجات ---------- */
  async function load(){
    if(S.loading || S.loaded) return;
    S.loading = true; S.error = '';
    try{
      /* مهلة 15 ثانية حتى ما يضل "جارِ التحميل" للأبد إذا تعطّل الاتصال */
      const q = supabaseClient.from(TABLE).select('*').order('created_at', { ascending:false });
      const { data, error } = await Promise.race([q, new Promise((_, rej) => setTimeout(() => rej(new Error('انتهت مهلة الاتصال بقاعدة البيانات')), 15000))]);
      if(error) throw error;
      S.items = data || []; S.loaded = true;
      const ids = new Set(S.items.map(p => String(p.id)));
      Object.keys(cart).forEach(k => { if(!ids.has(k)) delete cart[k]; }); saveCart();
      const visIds = new Set(S.items.filter(p => catOn(cat(p))).map(p => String(p.id)));
      wish = new Set([...wish].filter(k => visIds.has(String(k)))); saveWish();
    }catch(e){
      console.error('MEDIX STORE load failed', e);
      S.error = 'تعذّر تحميل المنتجات حاليًا، حاول مرة ثانية.';
    }
    S.loading = false;
    if(currentRoute() === 'store') render();
  }

  /* ---------- مكوّنات الواجهة ---------- */
  const cartLines = () => Object.entries(cart).map(([id, q]) => ({ p:by(id), q })).filter(x => x.p && x.q > 0);
  const cartCount = () => cartLines().reduce((a, x) => a + x.q, 0);
  const cartTotal = () => cartLines().reduce((a, x) => a + Number(x.p.price) * x.q, 0);
  const cnt = n => n ? `<span class="mx-badge-n">${n}</span>` : '';
  const unitOld = p => Number(p.old_price) > Number(p.price) ? Number(p.old_price) : 0;
  const pct = p => unitOld(p) ? Math.round((1 - Number(p.price) / unitOld(p)) * 100) : 0;
  const priceRow = (p, big) => `<div class="mx-prow"><span class="mx-price"${big ? ' style="font-size:1.9rem"' : ''}>${fmt(p.price)}</span>${unitOld(p) ? `<span class="mx-old"${big ? ' style="font-size:1.4rem"' : ''}>${fmt(p.old_price)}</span><span class="mx-off">-${pct(p)}%</span>` : ''}</div>`;
  const spark = c => `<svg class="mx-spark ${c}" viewBox="0 0 100 100" aria-hidden="true"><path fill="currentColor" d="M50 0C50 28 72 50 100 50 72 50 50 72 50 100 50 72 28 50 0 50 28 50 50 28 50 0Z"/></svg>`;
  const promoText = () => { const v = state.storeSettings && state.storeSettings.promo; return (v === undefined || v === null) ? DEFAULTS.promo : String(v); };
  const baseList = () => { const admin = isAdminSession(); return S.items.filter(p => catOn(cat(p)) && (admin || p.active !== false)); };
  const filtersOn = () => S.tab !== 'all' || S.min !== '' || S.max !== '' || S.stock;

  const XSVG = '<svg class="mx-xs" viewBox="110 100 730 575" aria-hidden="true"><path fill="currentColor" d="M150 115H292Q318 115 338 135L556 372Q564 380 556 390L300 656Q290 662 276 662H128Q116 662 126 650L380 382L146 122Q140 115 150 115Z"/><path fill="#2A9D9A" d="M510 280L668 118Q675 114 690 114H818Q830 114 822 124L604 372Q598 378 592 372L512 290Q506 284 510 280Z"/><path fill="#2A9D9A" d="M490 492L578 400Q584 394 592 400L822 650Q830 660 818 660H650Q638 660 630 652L494 500Q486 494 490 492Z"/></svg>';
  const brandName = () => 'MEDI' + XSVG + ' STORE';

  function actsHtml(){
    return `<button class="mx-ib" data-act="theme" aria-label="تبديل الوضع الليلي">${ic('moon', 20)}</button>
      <button class="mx-ib" data-act="wishnav" aria-label="المفضّلة (${wish.size})">${ic('heart', 20)}${cnt(wish.size)}</button>
      <button class="mx-ib" data-act="track" aria-label="تتبّع طلبي">${ic('receipt', 20)}</button>
      <button class="mx-ib" data-act="cart" aria-label="السلة (${cartCount()})">${ic('bag', 20)}${cnt(cartCount())}</button>`;
  }

  function promoHtml(){
    const t = promoText().trim();
    if(!t || lsGet('mx_promo_x', '') === t) return '';
    return `<div class="mx-promo" id="mxPromo"><div class="mx-in"><span>${esc(t)}</span><a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">اطلب الآن</a>
      <button data-act="xpromo" aria-label="إغلاق الشريط">${ic('x', 16)}</button></div></div>`;
  }

  function adminBarHtml(){
    if(!isAdminSession()) return '';
    const on = !!(state.storeSettings && state.storeSettings.visible);
    return `<div class="mx-admin"><div class="mx-in">
      <label class="mx-sw"><input type="checkbox" id="mxVis" ${on ? 'checked' : ''}> إظهار المتجر للطلاب والزوّار
        <span class="mx-pill ${on ? 'on' : 'off'}">${on ? 'ظاهر للجميع' : 'مخفي — للمشرف فقط'}</span></label>
      <div class="sp">
        <button class="mx-btn ink sm" data-act="new">＋ إضافة منتج</button>
        <button class="mx-btn line sm" data-act="texts">✏️ نصوص الصفحة</button>
        <button class="mx-btn line sm" data-act="orders">📦 الطلبات</button>
        <button class="mx-btn line sm" data-act="coupons">🎟️ الكوبونات</button>
        <a class="mx-btn line sm" href="/home">🛡️ العودة للمنصة</a>
      </div></div></div>`;
  }

  function headHtml(){
    return `<div class="mx-head"><div class="mx-in">
      <a class="mx-brand" href="/home" aria-label="MEDIX Store"><img src="${esc(LOGO_URL)}" alt=""><b>${brandName()}</b></a>
      <div class="mx-search">
        <span class="si">${ic('search', 16)}</span>
        <input id="mxQ" type="search" autocomplete="off" placeholder="ابحث عن سماعة، جهاز ضغط، طقم..." value="${esc(S.q)}" aria-label="بحث">
        <div class="mx-sl" id="mxSl" hidden></div>
      </div>
      <div class="mx-acts" id="mxActs">${actsHtml()}</div>
    </div></div>`;
  }

  /* شريط الفلاتر (تحت الهيدر مباشرة) */
  function catOpts(){
    const base = baseList(), ld = S.loaded;
    const o = (v, l, n) => `<option value="${v}" ${S.tab === v ? 'selected' : ''}>${l}${ld ? ` (${n})` : ''}</option>`;
    return o('all', 'كل التصنيفات', base.length) + visCats().map(c => o(c.id, esc(c.name), base.filter(p => cat(p) === c.id).length)).join('') + (wish.size ? o('wish', '❤ المفضّلة', wish.size) : '');
  }
  function fbarHtml(){
    const o = (v, l) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${l}</option>`;
    return `<div class="mx-fbar" role="search" aria-label="الفلاتر"><div class="mx-in">
      <span class="fi">${ic('sliders', 18)}</span>
      <select id="mxCat" aria-label="التصنيف">${catOpts()}</select>
      <div class="mx-pr"><input id="mxMin" type="number" min="0" step="any" inputmode="decimal" placeholder="السعر من" value="${esc(S.min)}" aria-label="أقل سعر"><input id="mxMax" type="number" min="0" step="any" inputmode="decimal" placeholder="إلى" value="${esc(S.max)}" aria-label="أعلى سعر"></div>
      <label class="mx-chk"><input type="checkbox" id="mxStock" ${S.stock ? 'checked' : ''}> المتوفّر فقط</label>
      <select id="mxSort" aria-label="ترتيب المنتجات">${o('new', 'الأحدث')}${o('asc', 'السعر: الأقل أولًا')}${o('desc', 'السعر: الأعلى أولًا')}</select>
    </div></div>`;
  }

  function heroVisualHtml(){
    /* الشعار ثابت دائمًا — بغض النظر إذا في منتجات أو لا */
    return `<div class="mx-stage" id="mxStage">${spark('s1')}${spark('s2')}<div class="mx-tilt" id="mxTilt">
        <div class="mx-plate round"></div><div class="mx-ha logo"><img src="${esc(LOGO_URL)}" alt="MEDIX STORE"></div></div></div>`;
  }

  function statsHtml(){
    if(!S.loaded) return '';
    const v = baseList().filter(p => p.in_stock !== false);   // العدّاد للمنتجات المتوفرة الآن فقط
    const st = [[v.length, 'منتج متوفّر الآن'], [v.filter(p => cat(p) === 'bundles').length, 'باقة']].filter(x => x[0] > 0);
    return st.length ? `<div class="mx-stats">${st.map(([n, l]) => `<div class="mx-stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>` : '';
  }

  function heroHtml(){
    return `<section class="mx-hero"><div class="mx-in">
      <div><h1>${esc(cfg('headline'))}</h1><p class="lead">${esc(cfg('sub'))}</p>
        <div class="mx-cta"><button class="mx-btn ink" data-act="go" data-id="mxFeat">تسوّق الآن</button></div>
        <div id="mxStats">${statsHtml()}</div></div>
      <div id="mxHero">${heroVisualHtml()}</div></div></section>`;
  }

  function bandHtml(){
    return `<div class="mx-band"><div class="mx-in"><ul>
      <li>${ic('shield', 24)}<span>أدوات مختارة بعناية</span></li><li>${ic('check', 24)}<span>أسعار تناسب الطلاب</span></li>
      <li>${ic('bag', 24)}<span>عروض مناسبة</span></li><li>${ic('wa', 24)}<span>طلب سهل</span></li></ul></div></div>`;
  }

  function list(){
    const mn = parseFloat(S.min), mx = parseFloat(S.max);
    return baseList().filter(p =>
      (S.tab === 'all' || (S.tab === 'wish' ? wish.has(p.id) : cat(p) === S.tab)) &&
      (isNaN(mn) || Number(p.price) >= mn) && (isNaN(mx) || Number(p.price) <= mx) &&
      (!S.stock || p.in_stock !== false));
  }
  function sorted(L){
    const num = p => Number(p.price) || 0, oos = p => p.in_stock === false ? 1 : 0;
    const cmp = S.sort === 'asc' ? (a, b) => num(a) - num(b) : S.sort === 'desc' ? (a, b) => num(b) - num(a) : () => 0;
    return L.map((p, i) => ({ p, i })).sort((a, b) => oos(a.p) - oos(b.p) || cmp(a.p, b.p) || a.i - b.i).map(x => x.p);
  }
  function infoHtml(){
    if(!S.loaded) return '';
    return `<span>عرض ${list().length} منتج</span>${filtersOn() ? `<button class="mx-clr" data-act="clr">مسح الفلاتر</button>` : ''}`;
  }
  function cardHtml(p){
    const admin = isAdminSession(), out = p.in_stock === false, w = wish.has(p.id), img = imgOf(p);
    return `<li class="mx-card ${p.active === false ? 'hid' : ''}">
      <div class="mx-tile" data-act="qv" data-id="${esc(p.id)}">
        ${img ? `<img class="pimg" src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<div class="art7">${art(artKey(p))}</div>`}
        ${p.badge ? `<span class="mx-tag">${esc(p.badge)}</span>` : ''}
        ${out ? '<span class="mx-tag out">نفدت الكمية</span>' : ''}
        <button class="mx-wish ${w ? 'on' : ''}" data-act="wish" data-id="${esc(p.id)}" aria-pressed="${w}" aria-label="مفضّلة">${ic('heart', 18, w ? 'fill="currentColor"' : '')}</button>
      </div>
      <div class="mx-cb"><h3><button class="ttl" data-act="qv" data-id="${esc(p.id)}">${esc(p.title)}</button></h3>
        ${priceRow(p)}
        <button class="mx-btn line sm block ${out ? 'off' : ''}" data-act="add" data-id="${esc(p.id)}">${out ? 'غير متوفر' : 'أضف للسلة'}</button>
        ${admin ? `<div class="mx-arow"><button data-act="edit" data-id="${esc(p.id)}">✏️ تعديل</button><button data-act="tog" data-id="${esc(p.id)}">${p.active === false ? '👁️ إظهار' : '🙈 إخفاء'}</button><button class="del" data-act="del" data-id="${esc(p.id)}">🗑️</button></div>` : ''}
      </div></li>`;
  }
  function gridHtml(){
    const wrap = x => `<ul class="mx-grid">${x}</ul>`;
    if(S.error) return wrap(`<li class="mx-empty"><h3>⚠️ ${esc(S.error)}</h3><button class="mx-btn ink sm" data-act="retry">إعادة المحاولة</button></li>`);
    if(!S.loaded) return wrap(`<li class="mx-empty"><span class="loading-dot"></span> جارِ تحميل المنتجات...</li>`);
    const L = sorted(list());
    if(!L.length) return wrap(`<li class="mx-empty"><h3>لا توجد منتجات هنا بعد</h3><p>${S.items.length ? 'جرّب تغيير الفلاتر.' : 'ترقّبوا منتجاتنا قريبًا!'}</p></li>`);
    if(!filtersOn() && S.sort === 'new'){
      const groups = visCats().map(c => ({ c, items: L.filter(p => cat(p) === c.id) })).filter(g => g.items.length);
      if(groups.length > 1) return groups.map(g => `<section class="mx-grp"><div class="mx-gh"><h3>${esc(g.c.name)}</h3><span>${g.items.length} منتج</span></div>${wrap(g.items.map(cardHtml).join(''))}</section>`).join('');
    }
    return wrap(L.map(cardHtml).join(''));
  }
  function shopHtml(){
    return `<section class="mx-feat" id="mxFeat"><div class="mx-in">
      <div class="mx-lst">
        <div class="mx-deliv">
          <div class="dv-txt"><b>التوصيل مجاني<em>لمحافظة الكرك</em></b></div>
          <div class="dv-vis" aria-hidden="true">
            <img class="dv-truck" src="${esc(TRUCK_URL)}" alt="" loading="lazy" onerror="this.parentNode.style.display='none'">
          </div>
        </div>
        <div class="mx-top" style="margin-top:1.75rem"><h2>منتجات التمريض</h2></div>
        <div class="mx-bl" id="mxInfo">${infoHtml()}</div>
        <div id="mxGrid">${gridHtml()}</div>
      </div></div></section>`;
  }
  function footHtml(){
    return `<div class="mx-fin"><div class="mx-in"><div><b class="lg">${brandName()}</b><p>متجر مستلزمات طلاب التمريض.</p></div>
      <div class="ln"><a href="/home">العودة إلى MEDORA</a><a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">تواصل عبر واتساب</a></div>
      <small>© ${new Date().getFullYear()} MEDIX Store — جزء من منصة MEDORA</small></div></div>`;
  }

  function drawerHtml(){
    const L = cartLines();
    const head = `<div class="mx-dh"><h2>سلتك (${cartCount()})</h2><button class="mx-ib" data-act="close" aria-label="إغلاق">${ic('x', 20)}</button></div>`;
    if(!L.length) return head + `<div class="mx-dempty"><p style="font-weight:800;color:var(--m-fg);font-size:1.1rem">سلتك فارغة</p><p class="mx-muted" style="font-size:.9rem">أضف منتجًا أو باقة لتظهر هنا.</p><button class="mx-btn ink sm" data-act="close">تصفّح المنتجات</button></div>`;
    const tot = cartTotal(), sub = L.reduce((a, x) => a + (unitOld(x.p) || Number(x.p.price)) * x.q, 0), dis = sub - tot, dp = sub > 0 ? Math.round(dis / sub * 100) : 0;
    const msg = `مرحبًا MEDIX STORE 👋\nبدي أطلب:\n` + L.map(x => `• ${x.p.title} × ${x.q} — ${fmt(Number(x.p.price) * x.q)}`).join('\n') + `\n\nالمجموع: ${fmt(tot)}`;
    return head + `<ul class="mx-dl">${L.map(({ p, q }) => `<li>
        <div class="th">${imgOf(p) ? `<img src="${esc(imgOf(p))}" alt="">` : `<div class="a">${art(artKey(p))}</div>`}</div>
        <div class="in"><div class="tr"><b>${esc(p.title)}</b><button class="mx-rm" data-act="rm" data-id="${esc(p.id)}" aria-label="حذف من السلة">${ic('trash', 18)}</button></div>
          <div class="br"><span class="mx-price" style="font-size:1.1rem">${fmt(Number(p.price) * q)}</span>
            <div class="mx-qty"><button data-act="dec" data-id="${esc(p.id)}" aria-label="إنقاص">${ic('minus', 14)}</button><span>${q}</span><button data-act="inc" data-id="${esc(p.id)}" aria-label="زيادة">${ic('plus', 14)}</button></div></div></div></li>`).join('')}</ul>
      <div class="mx-df"><h3>ملخّص الطلب</h3>
        <div class="r"><span>المجموع الفرعي</span><b>${fmt(sub)}</b></div>
        ${dis > 0.004 ? `<div class="r d"><span>الخصم (-${dp}%)</span><b>-${fmt(dis)}</b></div>` : ''}
        <div class="r"><span>التوصيل</span><b>يُتفق عليه</b></div>
        <div class="r t"><span>الإجمالي</span><b>${fmt(tot)}</b></div>
        <small>الدفع عبر CliQ: حوّل المبلغ ثم ارفع صورة الحوالة (أو استخدم كوبون). التوصيل نتفق عليه مع فريقنا.</small>
        <button class="mx-btn ink block" data-act="checkout">${ic('check', 18)} إتمام الشراء ${ic('arrow', 16, '', 'mx-flip')}</button>
        <a class="mx-btn line block sm" style="margin-top:.5rem" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('wa', 16)} استفسار عبر واتساب</a></div>`;
  }
  function qvHtml(){
    const p = by(S.qv); if(!p) return '';
    const inc = String(p.includes || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8);
    const out = p.in_stock === false;
    return `<div class="bg" data-act="close"></div><div class="mx-qvb" role="dialog" aria-modal="true" aria-label="${esc(p.title)}">
      <button class="xx" data-act="close" aria-label="إغلاق">${ic('x', 18)}</button>
      <div class="vis">${imgOf(p) ? `<img src="${esc(imgOf(p))}" alt="${esc(p.title)}">` : `<div class="a">${art(artKey(p))}</div>`}</div>
      <div class="inf"><div>${catName(cat(p)) ? `<span class="mx-muted" style="font-size:.82rem;font-weight:700">${esc(catName(cat(p)))}</span>` : ''}<h3>${esc(p.title)}</h3></div>
        ${priceRow(p, true)}
        ${p.description ? `<p class="mx-muted" style="font-size:.95rem">${esc(p.description)}</p>` : ''}
        ${inc.length ? `<div class="mx-div"></div><h4>محتويات المنتج</h4><ul class="mx-incl">${inc.map(x => `<li>${ic('check', 15)}${esc(x)}</li>`).join('')}</ul>` : ''}
        <div class="mx-div"></div>
        <div class="mx-buy"><div class="mx-qty"><button data-act="qvdec" aria-label="إنقاص">${ic('minus', 16)}</button><span>${S.qq}</span><button data-act="qvinc" aria-label="زيادة">${ic('plus', 16)}</button></div>
          <button class="mx-btn ink ${out ? 'off' : ''}" style="flex:1" data-act="addqv" data-id="${esc(p.id)}">${out ? 'غير متوفر' : 'أضف للسلة'}</button></div></div></div>`;
  }

  /* ---------- انترو الشعار: حرف M ينكتب بشكل ثلاثي الأبعاد ثم اسم المتجر ---------- */
  const INTRO_MARK = '<svg class="mx-im" viewBox="0 0 520 330" aria-hidden="true"><defs><path id="mxSil" fill-rule="evenodd" d="M464.7 188.0 457.7 191.0 453.3 196.0 452.0 204.0 454.3 209.7 458.0 213.3 462.7 215.7 469.0 215.7 473.7 213.3 477.3 209.7 479.7 204.0 479.7 200.7 477.3 195.0 474.0 191.0 470.7 189.0ZM11.0 129.7 11.0 149.0 12.0 150.7 12.0 154.0 16.0 166.0 25.3 183.7 35.3 196.7 49.0 210.3 50.7 211.0 60.0 219.3 73.7 229.0 74.0 305.0 75.3 307.7 80.0 311.7 88.0 311.7 91.0 310.7 137.7 283.3 143.3 278.7 147.7 271.0 147.7 268.3 148.7 267.3 184.7 279.7 187.0 279.7 190.7 281.7 193.0 281.7 204.7 285.7 211.0 286.7 215.7 288.7 223.0 289.7 233.7 292.7 237.0 292.7 238.7 293.7 242.0 293.7 243.7 294.7 247.0 294.7 248.7 295.7 260.0 296.7 261.7 297.7 278.0 298.7 279.7 299.7 325.0 299.7 326.7 298.7 333.0 298.7 334.7 297.7 347.0 296.7 373.0 289.7 376.7 287.7 391.0 282.7 409.7 273.3 423.7 265.3 430.0 260.0 439.7 254.3 454.0 242.0 456.0 241.7 457.7 242.7 474.0 242.7 475.7 241.7 478.0 241.7 486.7 237.3 494.7 231.3 501.3 222.7 504.7 215.0 505.7 206.7 506.7 205.0 506.7 201.7 505.7 200.0 505.7 192.7 499.3 179.0 495.7 174.3 488.7 168.3 475.0 162.0 457.7 162.0 451.7 164.0 443.0 168.3 438.0 172.3 432.3 179.0 426.0 192.7 426.0 212.0 427.0 213.7 427.0 216.0 421.7 223.7 399.7 243.7 391.7 249.7 369.7 262.7 346.0 272.0 343.7 272.0 339.0 274.0 331.7 275.0 330.0 276.0 325.7 276.0 324.0 277.0 319.7 277.0 318.0 278.0 310.7 278.0 309.0 279.0 273.7 279.0 272.0 278.0 263.7 278.0 262.0 277.0 255.7 277.0 254.0 276.0 241.7 275.0 240.0 274.0 235.7 274.0 230.0 272.0 226.7 272.0 221.0 270.0 217.7 270.0 216.0 269.0 201.7 266.0 197.0 264.0 194.7 264.0 184.0 260.0 181.7 260.0 147.7 248.0 140.0 244.0 129.7 240.0 104.0 226.7 81.0 211.7 71.7 203.3 70.0 202.7 57.0 189.7 56.3 188.0 51.0 182.7 45.0 173.7 38.7 161.0 35.7 151.0 35.7 147.7 34.7 146.0 34.7 131.7 37.7 121.7 41.0 115.0 44.0 111.0 53.0 103.0 63.3 97.3 63.3 78.3 58.7 78.0 48.7 82.0 38.0 88.3 29.7 95.0 18.3 109.0 14.0 117.7 14.0 120.0ZM463.7 176.7 468.0 176.7 475.0 178.7 483.7 184.0 487.7 189.0 491.0 198.7 491.0 206.0 490.0 207.7 490.0 210.0 486.7 216.7 480.7 222.7 474.0 226.0 471.7 226.0 470.0 227.0 460.7 227.0 451.0 222.7 444.0 214.7 440.7 206.0 440.7 199.7 441.7 198.0 441.7 194.7 444.0 189.0 447.0 185.0 453.0 180.0ZM79.3 41.0 78.0 45.0 76.3 47.0 74.0 55.7 74.0 194.7 76.0 197.3 77.7 198.0 83.0 203.3 94.0 211.3 97.7 213.0 100.0 215.3 117.0 225.3 142.7 237.7 146.0 238.7 147.7 237.7 147.7 129.3 148.3 128.7 152.7 131.0 157.0 135.3 172.7 147.0 183.0 156.3 220.7 186.0 236.0 199.3 248.7 205.7 251.0 205.7 252.7 206.7 269.0 206.7 279.7 202.3 286.7 197.3 317.0 171.0 318.7 170.3 324.0 165.0 325.7 164.3 331.0 159.0 340.0 152.7 342.0 150.0 359.7 136.3 370.0 127.0 375.0 124.3 376.0 125.3 376.0 245.7 377.0 246.7 380.7 246.3 389.7 240.3 399.7 232.3 416.3 215.7 415.7 194.7 419.7 181.7 423.0 175.0 426.0 171.0 435.0 162.0 443.7 157.3 444.7 155.7 444.7 45.7 443.7 44.0 442.7 37.7 438.7 30.7 436.0 28.7 434.7 26.3 429.0 23.0 423.0 21.0 420.7 21.0 419.0 20.0 401.7 20.0 400.0 21.0 392.7 22.0 376.0 29.3 364.0 38.3 328.7 71.7 327.0 72.3 319.7 79.7 318.0 80.3 290.7 105.7 277.0 116.3 271.7 121.7 268.3 123.7 265.0 122.7 244.0 107.7 239.7 103.3 236.0 101.7 221.0 89.7 215.7 84.3 206.0 77.7 200.7 72.3 182.0 57.7 175.7 51.3 158.0 37.7 153.7 33.3 146.7 28.3 138.0 24.0 128.0 21.0 123.7 21.0 122.0 20.0 107.7 21.0 94.0 26.3 90.0 29.3 81.3 38.0Z"/></defs><g class="ex"><use href="#mxSil" transform="translate(-11.25 11.25)" fill="#0f4e53"/><use href="#mxSil" transform="translate(-10.00 10.00)" fill="#0f4e53"/><use href="#mxSil" transform="translate(-8.75 8.75)" fill="#0f4e53"/><use href="#mxSil" transform="translate(-7.50 7.50)" fill="#0f4e53"/><use href="#mxSil" transform="translate(-6.25 6.25)" fill="#0f4e53"/><use href="#mxSil" transform="translate(-5.00 5.00)" fill="#0f4e53"/><use href="#mxSil" transform="translate(-3.75 3.75)" fill="#17666b"/><use href="#mxSil" transform="translate(-2.50 2.50)" fill="#17666b"/><use href="#mxSil" transform="translate(-1.25 1.25)" fill="#17666b"/></g><g class="fl"><use href="#mxSil" fill="#2e9393"/><path d="M184.0 272.0 184.0 275.0 185.3 277.7 187.7 279.7 194.0 280.7 195.7 281.7 200.0 281.7 201.7 282.7 206.0 282.7 209.7 284.7 212.0 284.7 226.7 290.7 231.0 290.7 232.7 291.7 240.0 291.7 253.7 295.7 266.0 295.7 267.7 296.7 273.0 296.7 274.7 297.7 282.7 296.3 285.7 292.7 285.3 288.0 282.7 285.3 275.0 281.0 269.0 279.0 261.7 279.0 260.0 278.0 254.7 278.0 253.0 277.0 248.7 277.0 242.0 275.0 229.7 274.0 228.0 273.0 219.7 272.0 215.0 270.0 207.7 269.0 198.0 266.0 187.0 267.3ZM497.0 197.3 496.0 199.0 496.3 203.3 498.7 204.7 501.7 204.3 502.7 202.7 502.3 198.3 500.0 197.0ZM463.7 191.0 460.0 192.3 455.3 197.0 455.0 204.0 459.0 210.3 462.0 212.3 468.7 213.7 475.3 208.7 477.7 204.0 477.7 200.7 475.3 196.0 472.7 193.3 467.0 191.0ZM488.0 177.3 487.0 179.0 487.3 185.7 491.0 188.3 493.7 188.3 497.7 183.7 497.7 181.7 496.3 179.0 493.0 177.0ZM478.7 167.3 474.7 167.0 473.0 166.0 462.7 166.0 460.7 167.0 456.7 171.3 452.0 170.0 445.7 170.0 443.7 171.0 442.0 173.7 442.0 176.7 440.3 179.0 440.0 182.0 437.0 184.0 434.0 184.3 431.3 186.3 430.0 189.7 431.0 192.7 431.0 202.0 429.0 205.7 429.0 215.0 428.0 218.0 419.7 227.7 404.3 242.0 403.0 245.7 403.0 249.0 404.3 251.7 409.7 255.0 414.0 260.3 419.7 262.7 424.7 262.3 427.0 260.0 434.7 255.3 438.0 252.0 444.7 248.3 449.0 244.0 455.7 240.7 472.0 240.7 477.0 238.7 481.0 235.0 490.7 231.3 497.3 223.7 498.7 221.0 498.7 218.7 497.3 216.0 495.7 215.0 491.7 215.0 487.0 217.3 483.3 221.0 482.7 222.7 475.7 228.7 470.7 229.0 469.0 228.0 462.7 228.0 461.0 227.0 457.7 227.0 451.0 223.7 446.0 218.7 436.7 204.0 436.7 199.7 441.7 190.0 441.7 187.7 440.7 186.0 440.7 182.7 443.7 180.7 447.7 180.3 451.7 177.3 453.0 175.0 457.0 171.3 462.0 172.7 467.7 175.7 478.0 175.7 480.7 173.7ZM294.0 148.0 294.3 155.7 297.7 158.7 302.7 160.7 305.0 160.7 315.0 166.7 319.0 166.7 324.3 162.7 324.7 158.7 323.7 156.7 320.7 154.3 313.0 153.7 307.7 149.3 300.0 146.0 296.7 146.0ZM77.0 46.7 74.0 57.7 74.0 63.0 78.3 70.7 86.0 77.3 114.7 99.0 129.0 111.3 144.7 123.0 149.0 127.3 157.0 133.3 163.7 137.0 171.7 144.7 178.0 149.3 189.0 149.7 194.7 151.7 202.0 152.7 206.7 150.7 213.0 150.7 214.7 149.7 218.0 149.7 228.7 145.7 231.0 145.7 234.7 147.7 245.7 147.7 249.0 145.7 255.0 145.7 259.7 147.0 262.0 149.3 264.7 149.7 266.7 145.7 277.7 142.3 280.3 138.7 280.3 136.0 276.7 132.3 272.0 130.7 267.7 125.3 256.0 118.7 248.7 111.3 241.0 106.7 223.0 92.7 210.7 81.3 203.0 75.7 195.7 68.3 189.0 63.7 160.7 39.3 145.7 28.3 134.0 23.0 131.7 23.0 126.0 21.0 122.7 21.0 121.0 20.0 114.7 20.0 100.7 24.0 94.0 27.3 91.7 29.7 87.0 32.3 81.3 39.0Z" fill="#31a2a0" fill-rule="evenodd"/><path d="M422.7 264.0 421.7 263.0 419.7 263.0 414.0 260.7 409.7 255.3 405.0 252.7 402.7 249.0 402.7 244.0 401.0 243.0 398.0 244.3 391.7 249.7 369.7 262.7 346.0 272.0 343.7 272.0 335.0 275.0 325.7 276.0 324.0 277.0 319.7 277.0 318.0 278.0 310.7 278.0 309.0 279.0 277.0 279.0 276.0 280.7 282.7 285.0 286.0 289.0 285.7 293.7 281.0 298.0 282.0 299.7 325.0 299.7 326.7 298.7 333.0 298.7 334.7 297.7 340.0 297.7 341.7 296.7 351.0 295.7 373.0 289.7 393.0 281.7 409.7 273.3 421.7 266.3ZM428.7 190.0 427.0 191.0 427.0 194.0 426.0 195.7 426.0 211.7 427.0 212.7 428.7 211.7 428.7 205.7 430.7 202.0 430.7 192.7ZM499.0 182.0 498.0 183.0 497.7 185.7 495.7 187.7 493.0 189.0 489.7 188.0 488.0 189.0 491.0 198.7 491.0 206.0 488.0 214.7 489.0 215.7 491.7 214.7 496.7 215.0 499.0 218.7 499.0 220.7 500.7 221.7 503.7 217.0 505.7 210.0 505.7 194.7 503.7 187.7 501.3 183.0ZM498.0 195.7 500.7 196.0 503.0 199.0 502.7 203.7 499.7 206.0 498.0 205.7 495.7 202.7 495.7 198.7ZM463.3 174.0 461.7 173.0 456.0 173.3 447.7 180.7 443.7 181.0 441.7 182.0 441.0 186.0 442.0 188.0 443.0 188.7 444.7 188.3 447.0 185.0 453.0 180.0 462.7 177.3 463.7 175.7ZM441.3 172.3 439.0 172.3 434.3 177.0 430.3 183.0 430.3 185.3 431.7 185.7 434.0 184.0 436.7 183.7 439.3 181.3 441.7 175.0ZM446.0 168.0 447.0 169.7 457.0 169.7 462.7 165.7 473.0 165.7 474.7 166.7 478.7 167.0 480.0 169.0 480.7 174.3 478.0 176.0 474.0 176.0 473.0 177.7 485.0 184.7 486.7 183.7 486.7 179.0 488.0 177.0 493.7 176.7 494.7 175.7 494.3 174.0 490.7 170.3 484.7 166.3 477.0 163.0 473.7 163.0 472.0 162.0 459.7 162.0 449.7 165.0 447.0 166.3ZM319.7 168.7 318.7 167.0 315.0 168.0 312.7 165.3 307.7 162.3 297.0 158.7 293.0 154.7 292.7 149.7 290.3 145.0 286.7 142.0 278.7 142.0 274.0 144.0 268.7 145.0 266.3 146.3 266.0 148.7 264.7 150.0 262.0 149.7 259.7 147.3 255.0 146.0 249.0 146.0 245.7 148.0 234.7 148.0 231.0 146.0 228.7 146.0 218.0 150.0 214.7 150.0 213.0 151.0 206.7 151.0 202.0 153.0 193.7 152.0 188.0 150.0 184.7 150.0 180.0 152.0 180.3 153.7 183.0 156.3 220.7 186.0 231.0 195.3 244.7 203.7 254.7 206.7 267.0 206.7 274.0 204.7 280.7 201.3 298.7 187.3 304.0 182.0 318.7 170.3ZM75.0 137.0 74.0 138.0 74.0 191.0 77.3 197.7 83.0 203.3 94.0 211.3 117.0 225.3 137.7 235.7 142.0 235.7 144.7 234.3 147.7 230.7 147.3 170.3 145.0 170.3 142.7 172.7 140.0 173.0 137.7 171.3 131.7 170.0 120.0 163.7 115.7 160.3 109.7 159.0 88.0 147.7 84.7 144.3 81.0 143.7 78.0 140.7 76.7 137.7ZM33.0 92.3 21.3 105.0 17.3 111.0 14.0 118.7 12.0 125.7 12.0 129.0 11.0 130.7 11.0 148.0 12.0 149.7 12.0 153.0 15.0 163.0 21.3 176.7 28.3 187.7 36.3 197.7 55.0 215.3 73.7 229.0 74.3 236.3 76.7 236.3 79.0 234.0 82.0 233.7 87.7 237.0 93.7 242.0 93.7 245.7 90.7 248.0 84.7 248.0 81.0 249.0 75.7 245.0 74.0 246.0 74.0 302.0 76.3 306.7 79.0 309.3 86.0 311.7 87.7 310.7 90.0 310.7 100.7 305.3 138.7 282.3 146.3 273.7 147.7 271.0 147.7 269.0 149.0 267.7 160.0 270.7 163.7 272.7 181.7 278.7 184.3 278.3 184.0 271.0 187.0 267.0 189.7 265.7 192.7 265.7 193.7 264.7 192.7 263.0 184.0 260.0 181.7 260.0 147.7 248.0 140.0 244.0 129.7 240.0 104.0 226.7 94.0 220.7 76.0 207.7 71.7 203.3 70.0 202.7 51.0 182.7 45.0 173.7 38.7 161.0 36.7 155.0 35.7 147.7 34.7 146.0 34.7 131.7 35.7 130.0 35.7 126.7 41.0 115.0 49.0 106.0 57.7 100.3 62.3 94.7 63.7 92.0 63.7 85.7 60.7 81.3 58.0 80.0 53.7 80.0 43.0 85.3ZM417.0 20.0 402.7 20.0 401.0 21.0 397.7 21.0 387.7 24.0 378.0 28.3 363.0 39.3 328.7 71.7 327.0 72.3 319.7 79.7 318.0 80.3 310.0 89.0 310.3 90.3 313.0 90.7 317.7 93.0 319.3 95.7 329.7 106.0 336.7 115.0 341.3 125.7 345.3 131.7 348.7 135.0 349.3 142.3 351.7 142.3 373.0 125.0 374.7 124.7 376.0 126.0 376.0 238.7 379.0 242.3 381.7 243.7 384.0 243.7 389.7 240.3 399.7 232.3 412.3 219.7 415.7 213.0 415.7 194.7 419.7 181.7 423.0 175.0 426.0 171.0 442.3 155.7 444.7 151.0 444.7 46.7 443.7 45.0 443.7 41.7 440.3 34.0 434.7 27.3 428.0 23.0Z" fill="#298e8f" fill-rule="evenodd"/><path d="M75.3 238.0 75.3 243.7 80.0 248.3 90.7 247.7 93.3 245.7 93.3 242.0 87.7 237.3 82.0 234.0 79.0 234.3ZM309.0 91.0 300.0 97.3 295.7 101.7 289.0 106.3 283.7 111.7 270.0 122.3 269.0 124.0 269.0 126.7 272.0 130.3 276.7 132.0 280.7 136.0 280.3 141.3 287.7 142.0 292.0 146.7 300.0 145.7 307.7 149.0 313.0 153.3 320.7 154.0 325.0 158.3 328.0 158.7 339.7 151.3 347.3 144.7 348.7 142.0 348.7 136.0 341.0 125.7 336.3 115.0 329.3 106.0 319.0 95.7 317.7 93.3 313.0 91.0ZM74.3 68.3 75.0 134.0 78.3 140.7 81.0 143.3 84.7 144.0 88.0 147.3 109.7 158.7 115.0 159.7 120.0 163.3 131.7 169.7 137.7 171.0 140.0 172.7 142.7 172.3 145.3 169.7 147.7 165.0 147.3 126.0 134.7 115.3 119.0 103.7 104.7 91.3 81.0 73.7 76.7 68.3Z" fill="#1d6f72" fill-rule="evenodd"/></g><path class="dr" pathLength="1" d="M464.7 188.0 457.7 191.0 453.3 196.0 452.0 204.0 454.3 209.7 458.0 213.3 462.7 215.7 469.0 215.7 473.7 213.3 477.3 209.7 479.7 204.0 479.7 200.7 477.3 195.0 474.0 191.0 470.7 189.0ZM11.0 129.7 11.0 149.0 12.0 150.7 12.0 154.0 16.0 166.0 25.3 183.7 35.3 196.7 49.0 210.3 50.7 211.0 60.0 219.3 73.7 229.0 74.0 305.0 75.3 307.7 80.0 311.7 88.0 311.7 91.0 310.7 137.7 283.3 143.3 278.7 147.7 271.0 147.7 268.3 148.7 267.3 184.7 279.7 187.0 279.7 190.7 281.7 193.0 281.7 204.7 285.7 211.0 286.7 215.7 288.7 223.0 289.7 233.7 292.7 237.0 292.7 238.7 293.7 242.0 293.7 243.7 294.7 247.0 294.7 248.7 295.7 260.0 296.7 261.7 297.7 278.0 298.7 279.7 299.7 325.0 299.7 326.7 298.7 333.0 298.7 334.7 297.7 347.0 296.7 373.0 289.7 376.7 287.7 391.0 282.7 409.7 273.3 423.7 265.3 430.0 260.0 439.7 254.3 454.0 242.0 456.0 241.7 457.7 242.7 474.0 242.7 475.7 241.7 478.0 241.7 486.7 237.3 494.7 231.3 501.3 222.7 504.7 215.0 505.7 206.7 506.7 205.0 506.7 201.7 505.7 200.0 505.7 192.7 499.3 179.0 495.7 174.3 488.7 168.3 475.0 162.0 457.7 162.0 451.7 164.0 443.0 168.3 438.0 172.3 432.3 179.0 426.0 192.7 426.0 212.0 427.0 213.7 427.0 216.0 421.7 223.7 399.7 243.7 391.7 249.7 369.7 262.7 346.0 272.0 343.7 272.0 339.0 274.0 331.7 275.0 330.0 276.0 325.7 276.0 324.0 277.0 319.7 277.0 318.0 278.0 310.7 278.0 309.0 279.0 273.7 279.0 272.0 278.0 263.7 278.0 262.0 277.0 255.7 277.0 254.0 276.0 241.7 275.0 240.0 274.0 235.7 274.0 230.0 272.0 226.7 272.0 221.0 270.0 217.7 270.0 216.0 269.0 201.7 266.0 197.0 264.0 194.7 264.0 184.0 260.0 181.7 260.0 147.7 248.0 140.0 244.0 129.7 240.0 104.0 226.7 81.0 211.7 71.7 203.3 70.0 202.7 57.0 189.7 56.3 188.0 51.0 182.7 45.0 173.7 38.7 161.0 35.7 151.0 35.7 147.7 34.7 146.0 34.7 131.7 37.7 121.7 41.0 115.0 44.0 111.0 53.0 103.0 63.3 97.3 63.3 78.3 58.7 78.0 48.7 82.0 38.0 88.3 29.7 95.0 18.3 109.0 14.0 117.7 14.0 120.0ZM463.7 176.7 468.0 176.7 475.0 178.7 483.7 184.0 487.7 189.0 491.0 198.7 491.0 206.0 490.0 207.7 490.0 210.0 486.7 216.7 480.7 222.7 474.0 226.0 471.7 226.0 470.0 227.0 460.7 227.0 451.0 222.7 444.0 214.7 440.7 206.0 440.7 199.7 441.7 198.0 441.7 194.7 444.0 189.0 447.0 185.0 453.0 180.0ZM79.3 41.0 78.0 45.0 76.3 47.0 74.0 55.7 74.0 194.7 76.0 197.3 77.7 198.0 83.0 203.3 94.0 211.3 97.7 213.0 100.0 215.3 117.0 225.3 142.7 237.7 146.0 238.7 147.7 237.7 147.7 129.3 148.3 128.7 152.7 131.0 157.0 135.3 172.7 147.0 183.0 156.3 220.7 186.0 236.0 199.3 248.7 205.7 251.0 205.7 252.7 206.7 269.0 206.7 279.7 202.3 286.7 197.3 317.0 171.0 318.7 170.3 324.0 165.0 325.7 164.3 331.0 159.0 340.0 152.7 342.0 150.0 359.7 136.3 370.0 127.0 375.0 124.3 376.0 125.3 376.0 245.7 377.0 246.7 380.7 246.3 389.7 240.3 399.7 232.3 416.3 215.7 415.7 194.7 419.7 181.7 423.0 175.0 426.0 171.0 435.0 162.0 443.7 157.3 444.7 155.7 444.7 45.7 443.7 44.0 442.7 37.7 438.7 30.7 436.0 28.7 434.7 26.3 429.0 23.0 423.0 21.0 420.7 21.0 419.0 20.0 401.7 20.0 400.0 21.0 392.7 22.0 376.0 29.3 364.0 38.3 328.7 71.7 327.0 72.3 319.7 79.7 318.0 80.3 290.7 105.7 277.0 116.3 271.7 121.7 268.3 123.7 265.0 122.7 244.0 107.7 239.7 103.3 236.0 101.7 221.0 89.7 215.7 84.3 206.0 77.7 200.7 72.3 182.0 57.7 175.7 51.3 158.0 37.7 153.7 33.3 146.7 28.3 138.0 24.0 128.0 21.0 123.7 21.0 122.0 20.0 107.7 21.0 94.0 26.3 90.0 29.3 81.3 38.0Z"/></svg>';
  let introDone = false;
  function showIntro(){
    if(introDone) return; introDone = true;
    try{
      if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      const letters = 'MEDI'.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('') + `<span style="--i:4">${XSVG}</span>`;
      const box = document.createElement('div');
      box.className = 'mx-intro'; box.setAttribute('aria-hidden', 'true');
      box.innerHTML = `<div class="mx-i-wrap"><div class="mx-i3">${INTRO_MARK}</div>
        <div class="mx-it"><div class="mx-iname">${letters}</div>
          <div class="mx-istore"><b>STORE</b></div>
          <div class="mx-itag">FOR MEDICAL &amp; DENTAL STUDENTS</div></div></div>`;
      document.body.appendChild(box);
      const prevOv = document.body.style.overflow; document.body.style.overflow = 'hidden';
      let closed = false;
      const close = () => {
        if(closed) return; closed = true;
        box.classList.add('out'); document.body.style.overflow = prevOv;
        setTimeout(() => box.remove(), 600);
      };
      requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('go')));
      box.addEventListener('click', close);
      setTimeout(close, 4300);
    }catch(e){}
  }

  function page(){
    injectCss();
    if(!allowed()){
      return `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>هذه الصفحة غير متاحة حاليًا</h3><p><a href="/home" style="color:var(--teal);font-weight:800;">العودة للرئيسية</a></p></div></div></section>`;
    }
    showIntro();
    if(!S.loaded && !S.loading && !S.error) load();
    const open = S.cartOpen, qvOpen = !!by(S.qv);
    return `<div class="mx-root" id="mxRoot">
      ${promoHtml()}${adminBarHtml()}${headHtml()}${fbarHtml()}
      <main>${heroHtml()}${bandHtml()}${shopHtml()}</main>
      ${footHtml()}
      <div class="mx-ov" id="mxOv" data-act="close" ${open || qvOpen ? '' : 'hidden'}></div>
      <aside class="mx-drawer ${open ? 'open' : ''}" id="mxDrawer" role="dialog" aria-modal="true" aria-label="السلة" ${open ? '' : 'inert'}>${drawerHtml()}</aside>
      <div class="mx-qv" id="mxQv" ${qvOpen ? '' : 'hidden'}>${qvOpen ? qvHtml() : ''}</div>
    </div>`;
  }

  /* ---------- تحديثات جزئية (بدون إعادة رسم الصفحة كلها) ---------- */
  function updActs(){ const e = $('#mxActs'); if(e) e.innerHTML = actsHtml(); }
  function updFbar(){
    const c = $('#mxCat'), st = $('#mxStock');
    if(c) c.innerHTML = catOpts(); if(st) st.checked = S.stock;
  }
  function updGrid(){
    const g = $('#mxGrid'), i = $('#mxInfo'), s = $('#mxStats');
    if(g) g.innerHTML = gridHtml(); if(i) i.innerHTML = infoHtml(); if(s) s.innerHTML = statsHtml();
    updFbar();
  }
  function updOverlays(){
    const open = S.cartOpen, qvOpen = !!by(S.qv);
    const ov = $('#mxOv'), dr = $('#mxDrawer'), qv = $('#mxQv');
    if(!ov || !dr || !qv) return;
    ov.hidden = !(open || qvOpen);
    dr.innerHTML = drawerHtml(); dr.classList.toggle('open', open);
    if(open) dr.removeAttribute('inert'); else dr.setAttribute('inert', '');
    qv.hidden = !qvOpen; qv.innerHTML = qvOpen ? qvHtml() : '';
    document.body.style.overflow = (open || qvOpen) ? 'hidden' : '';
  }
  function closeAll(){ S.cartOpen = false; S.qv = null; S.qq = 1; updOverlays(); document.body.style.overflow = ''; }
  function scrollTo(id){ const e = document.getElementById(id); if(e) e.scrollIntoView({ behavior:'smooth', block:'start' }); }
  function bindTilt(){
    const st = $('#mxStage'), tl = $('#mxTilt');
    if(!st || !tl || matchMedia('(prefers-reduced-motion:reduce)').matches || !matchMedia('(hover:hover)').matches) return;
    st.onpointermove = e => { const r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tl.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 18}deg)`; };
    st.onpointerleave = () => tl.style.transform = '';
  }

  /* ---------- الأحداث ---------- */
  function onClick(e){
    const sl = $('#mxSl'); if(sl && !e.target.closest('.mx-search')) sl.hidden = true;
    const link = e.target.closest('a[href^="/"]');
    if(link){ S.cartOpen = false; S.qv = null; document.body.style.overflow = ''; return; }   // app.js بيتولّى التنقّل
    const t = e.target.closest('[data-act]'); if(!t) return;
    const act = t.dataset.act, id = t.dataset.id;
    switch(act){
      case 'add': { const p = by(id); if(!p || p.in_stock === false) return; cart[id] = (cart[id] || 0) + 1; saveCart(); S.qv = null; S.qq = 1; S.cartOpen = true; updActs(); updOverlays(); break; }
      case 'addqv': { const p = by(id); if(!p || p.in_stock === false) return; cart[id] = (cart[id] || 0) + (S.qq || 1); saveCart(); S.qv = null; S.qq = 1; S.cartOpen = true; updActs(); updOverlays(); break; }
      case 'inc': cart[id] = (cart[id] || 0) + 1; saveCart(); updActs(); updOverlays(); break;
      case 'dec': cart[id] = (cart[id] || 0) - 1; if(cart[id] <= 0) delete cart[id]; saveCart(); updActs(); updOverlays(); break;
      case 'rm': delete cart[id]; saveCart(); updActs(); updOverlays(); break;
      case 'qvinc': S.qq = Math.min(99, (S.qq || 1) + 1); updOverlays(); break;
      case 'qvdec': S.qq = Math.max(1, (S.qq || 1) - 1); updOverlays(); break;
      case 'wish': wish.has(id) ? wish.delete(id) : wish.add(id); saveWish(); if(S.tab === 'wish' && !wish.size) S.tab = 'all'; updActs(); updGrid(); break;
      case 'qv': { S.qv = id; S.qq = 1; const q = $('#mxQ'); if(q) q.value = ''; S.q = ''; if(sl) sl.hidden = true; updOverlays(); break; }
      case 'tab': S.tab = id; updGrid(); break;
      case 'clr': { S.tab = 'all'; S.min = ''; S.max = ''; S.stock = false; const a = $('#mxMin'), b = $('#mxMax'), c = $('#mxStock'); if(a) a.value = ''; if(b) b.value = ''; if(c) c.checked = false; updGrid(); break; }
      case 'cat': S.tab = id; closeAll(); updGrid(); scrollTo('mxFeat'); break;
      case 'wishnav': if(wish.size){ S.tab = 'wish'; updGrid(); scrollTo('mxFeat'); } break;
      case 'cart': S.cartOpen = true; updOverlays(); break;
      case 'checkout': coOpen(); break;
      case 'track': trOpen(false); break;
      case 'orders': modalOrders(); break;
      case 'coupons': modalCoupons(); break;
      case 'close': closeAll(); break;
      case 'go': scrollTo(id); break;
      case 'xpromo': { lsSet('mx_promo_x', promoText().trim()); const b = $('#mxPromo'); if(b) b.remove(); break; }
      case 'theme': { const b = document.getElementById('themeToggleBtn'); if(b) b.click(); break; }
      case 'retry': S.error = ''; S.loaded = false; render(); break;
      case 'new': modalProduct(null); break;
      case 'edit': modalProduct(by(id)); break;
      case 'texts': modalTexts(); break;
      case 'tog': toggleProduct(id); break;
      case 'del': deleteProduct(id); break;
    }
  }
  function onInput(e){
    const id = e.target.id;
    if(id === 'mxMin' || id === 'mxMax'){ S[id === 'mxMin' ? 'min' : 'max'] = e.target.value; updGrid(); return; }
    if(id !== 'mxQ') return;
    S.q = e.target.value;
    const t = S.q.trim().toLowerCase(), sl = $('#mxSl'); if(!sl) return;
    const res = t ? baseList().filter(p => (p.title || '').toLowerCase().includes(t) || (p.description || '').toLowerCase().includes(t) || catName(p.category).includes(t)).slice(0, 5) : [];
    sl.hidden = !t;
    sl.innerHTML = res.length ? res.map(p => `<button data-act="qv" data-id="${esc(p.id)}"><span>${esc(p.title)}</span><span class="mx-muted" style="font-size:.78rem">${esc(catName(p.category))}</span></button>`).join('') : '<p>لا نتائج. جرّب "سماعة" أو "ضغط".</p>';
  }
  /* حفظ إعدادات المتجر مع فحص حقيقي: setData الأصلية بتبلع الأخطاء (RLS بيرجع error بدون throw)،
     فكان الإعداد يبان محفوظ بالواجهة وبعد الرفرش يرجع. هون بنتأكد بقراءة القيمة بعد الكتابة. */
  async function saveSettings(){
    try{
      const { error } = await supabaseClient.from('medora_data').upsert({ key:'store_settings', value:state.storeSettings, updated_at:new Date().toISOString() });
      if(error) throw error;
      const { data, error: e2 } = await supabaseClient.from('medora_data').select('value').eq('key', 'store_settings').maybeSingle();
      if(e2 || !data || !data.value) throw (e2 || new Error('not persisted'));
      const same = Object.keys(state.storeSettings).every(k => JSON.stringify(data.value[k]) === JSON.stringify(state.storeSettings[k]));
      if(!same) throw new Error('not persisted');
      return true;
    }catch(err){
      console.error('MEDIX STORE: settings save failed', err);
      alert('تعذّر حفظ الإعداد على السيرفر، فرح يرجع للقيمة القديمة بعد الرفرش.\nشغّل ملف store-settings-fix.sql بـ Supabase ثم جرّب مرة ثانية.');
      return false;
    }
  }

  function onKey(e){
    if(e.target.id === 'mxQ' && e.key === 'Enter'){ const b = document.querySelector('#mxSl button'); if(b){ e.preventDefault(); b.click(); } }
  }
  function onChange(e){
    if(e.target.id === 'mxCat'){ S.tab = e.target.value; updGrid(); scrollTo('mxFeat'); return; }
    if(e.target.id === 'mxSort'){ S.sort = e.target.value; updGrid(); return; }
    if(e.target.id === 'mxStock'){ S.stock = e.target.checked; updGrid(); return; }
    if(e.target.id !== 'mxVis') return;
    const prev = state.storeSettings;
    state.storeSettings = Object.assign({}, prev, { visible: e.target.checked });
    saveSettings().then(ok => { if(!ok) state.storeSettings = prev; render(); });
  }
  let escBound = false;
  function bind(){
    const app = document.getElementById('app');
    app.onclick = onClick; app.oninput = onInput; app.onkeydown = onKey; app.onchange = onChange;
    if(!escBound){ escBound = true; document.addEventListener('keydown', e => { if(e.key === 'Escape' && currentRoute() === 'store' && (S.cartOpen || S.qv)) closeAll(); }); }
    document.body.style.overflow = (S.cartOpen || by(S.qv)) ? 'hidden' : '';
    bindTilt();
    coMount(); trMount();
  }

  /* =========================================================
     الدفع عبر CliQ — نفس خطوات صفحة السلة: حوالة → إثبات/كوبون → موافقة الأدمن
     يحتاج: store-orders.sql (جداول store_orders/store_coupons + bucket store-proofs + الدوال)
     ========================================================= */
  const CLIQ = { alias:'MQBANK', name:'Oudeh Ashraf Oudeh Abuawad', bank:'Bank al Etihad (بنك الاتحاد)' };
  const PROOF_BUCKET = 'store-proofs';
  Object.assign(IC, {
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    bank:'<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7"/>',
    receipt:'<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 7h6M9 11h6"/>'
  });
  const CO = { open:false, coupon:null, code:'', file:null, busy:'', msg:'', cmsg:'', done:null, f:Object.assign({ name:'', phone:'', address:'', note:'' }, lsGet('mx_cust', {})) };
  const coDis = () => CO.coupon ? Math.round(cartTotal() * CO.coupon.percent) / 100 : 0;
  const coTot = () => Math.max(0, Math.round((cartTotal() - coDis()) * 100) / 100);
  const coFree = () => coTot() === 0;

  function coHtml(){
    const head = `<div class="ch"><h2>إتمام الشراء</h2><button class="mx-ib" data-co="close" aria-label="إغلاق">${ic('x', 22)}</button></div>`;
    if(CO.done){
      const d = CO.done, ok = d.status === 'approved';
      return `<div class="cw">${head}<div class="cc ok"><div class="big">${ic('check', 38)}</div>
        <h3 style="font-size:1.4rem;margin-bottom:.4rem">${ok ? 'تم تأكيد طلبك' : 'تم استلام طلبك'}</h3>
        <p class="mx-muted">رقم الطلب: <b style="color:var(--m-fg)">#${esc(d.order_no)}</b> — الإجمالي: <b style="color:var(--m-fg)">${fmt(d.total)}</b></p>
        <p class="mx-muted" style="margin:.6rem 0 1.4rem">${ok ? 'تم اعتماد الطلب مباشرة بالكوبون، وسيتواصل معك فريقنا للتوصيل.' : 'سيراجع الأدمن الحوالة ويعتمد طلبك خلال دقائق، وسيتواصل معك فريقنا للتوصيل.'}</p>
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap"><button class="mx-btn line" data-co="track">تتبّع طلبي</button><button class="mx-btn ink" data-co="close">العودة للمتجر</button></div></div></div>`;
    }
    const L = cartLines(), sub = cartTotal(), dis = coDis(), tot = coTot(), free = coFree(), f = CO.f;
    const steps = [['bank','حوّل عبر CliQ','افتح تطبيق البنك واختر CliQ وحوّل إلى الاسم المستعار ' + CLIQ.alias + '.'],
      ['receipt','احفظ الإيصال','احفظ أو صوّر شاشة إيصال إتمام الحوالة.'],
      ['upload','ارفع الإثبات أو الكوبون','أرفق لقطة الشاشة بالأسفل أو أدخل كود كوبون صالح.'],
      ['check','تفعيل سريع','أرسل الطلب وسيعتمده الأدمن خلال دقائق.']];
    const proof = CO.file
      ? `<div class="fl"><span>${ic('receipt', 18)} ${esc(CO.file.name)}</span><button data-co="rmfile">إزالة</button></div>`
      : `<button type="button" class="up" data-co="pick">${ic('upload', 26)}<span>اضغط لرفع صورة الحوالة</span><small>JPG أو PNG أو PDF</small></button>`;
    const coupon = CO.coupon
      ? `<div class="chip"><span>🎟️ ${esc(CO.coupon.code)} — خصم ${CO.coupon.percent}%</span><button data-co="rmcoupon">إزالة</button></div>`
      : `<div class="cr"><input type="text" id="coCode" placeholder="أدخل الكود..." value="${esc(CO.code)}" autocomplete="off"><button class="mx-btn ink sm ${CO.busy === 'coupon' ? 'off' : ''}" data-co="apply">تطبيق</button></div>`;
    return `<div class="cw">${head}
      <div class="cc"><div class="ct"><span class="cn">1</span>كيف تدفع (4 خطوات سريعة)</div>
        <div class="cs">${steps.map((s, i) => `<div><span class="ico">${ic(s[0], 20)}</span><div><b>${i + 1}. ${s[1]}</b><span>${s[2]}</span></div></div>`).join('')}</div></div>
      <div class="cc"><div class="ct"><span class="cn">2</span>تفاصيل تحويل CliQ</div>
        <div class="cq"><div class="logo">CliQ</div><dl>
          <div><dt>الاسم المستعار: </dt><dd class="alias">${esc(CLIQ.alias)}</dd><button type="button" class="cp" data-co="copy">${ic('copy', 13)} نسخ</button></div>
          <div><dt>اسم المستلم: </dt><dd dir="ltr">${esc(CLIQ.name)}</dd></div>
          <div><dt>البنك: </dt><dd>${esc(CLIQ.bank)}</dd></div></dl></div></div>
      <div class="cg">
        <div class="cc"><div class="ct"><span class="cn">3</span>بيانات التوصيل وإثبات الدفع</div>
          <label class="lb" for="coName">الاسم الكامل *</label><input type="text" id="coName" maxlength="80" value="${esc(f.name)}" autocomplete="name">
          <label class="lb" for="coPhone">رقم الهاتف *</label><input type="tel" id="coPhone" maxlength="20" dir="ltr" placeholder="07XXXXXXXX" value="${esc(f.phone)}" autocomplete="tel">
          <label class="lb" for="coAddr">عنوان التوصيل *</label><textarea id="coAddr" maxlength="300" placeholder="المحافظة، المنطقة، الشارع...">${esc(f.address)}</textarea>
          <label class="lb">صورة الحوالة ${free ? '(غير مطلوبة — الكوبون 100%)' : '*'}</label>${proof}
          <input type="file" id="coFile" accept="image/*,application/pdf" hidden>
          <label class="lb" for="coNote">ملاحظة (اختياري)</label><textarea id="coNote" maxlength="300" placeholder="اختياري...">${esc(f.note)}</textarea></div>
        <div class="cc"><div class="ct"><span class="cn">4</span>ملخّص الطلب</div>
          ${L.map(x => `<div class="sm-l"><span>${esc(x.p.title)} × ${x.q}</span><b>${fmt(Number(x.p.price) * x.q)}</b></div>`).join('')}
          <label class="lb">كود الخصم (اختياري)</label>${coupon}
          ${CO.cmsg ? `<div class="err">${esc(CO.cmsg)}</div>` : ''}
          <p class="hint">كوبون 100% يلغي الحاجة للحوالة والصورة.</p>
          <div class="sm-l"><span>المجموع الفرعي</span><b>${fmt(sub)}</b></div>
          ${dis > 0 ? `<div class="sm-l d"><span>الخصم (-${CO.coupon.percent}%)</span><b>-${fmt(dis)}</b></div>` : ''}
          <div class="tot"><span>الإجمالي للدفع</span><b>${fmt(tot)}</b></div>
          ${CO.msg ? `<div class="err">${esc(CO.msg)}</div>` : ''}
          <button class="mx-btn ink block ${CO.busy === 'submit' || (!free && !CO.file) ? 'off' : ''}" style="margin-top:1rem" data-co="submit">${CO.busy === 'submit' ? 'جارِ الإرسال...' : 'إتمام الشراء'}</button>
          <p class="hint" style="text-align:center">${free ? 'الكوبون يغطي كامل المبلغ.' : 'ارفع صورة الحوالة، أو استخدم كوبون 100%.'}</p></div>
      </div></div>`;
  }
  function coMount(){
    const root = $('#mxRoot'); if(!root) return;
    let el = $('#mxCo');
    if(!CO.open){ if(el) el.remove(); return; }
    if(!el){
      el = document.createElement('div'); el.id = 'mxCo'; el.className = 'mx-co'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.onclick = coClick; el.oninput = coInput; el.onchange = coChange; root.appendChild(el);
      if(!coMount.esc){ coMount.esc = true; document.addEventListener('keydown', e => { if(e.key === 'Escape' && CO.open && !CO.busy) coClose(); }); }
    }
    const st = el.scrollTop; el.innerHTML = coHtml(); el.scrollTop = st;
    document.body.style.overflow = 'hidden';
  }
  function coOpen(){ if(!cartLines().length) return; S.cartOpen = false; updOverlays(); CO.open = true; CO.done = null; CO.msg = ''; CO.cmsg = ''; coMount(); const el = $('#mxCo'); if(el) el.scrollTop = 0; }
  function coClose(){ CO.open = false; CO.done = null; coMount(); document.body.style.overflow = ''; }
  function coClick(e){
    const t = e.target.closest('[data-co]'); if(!t) return;
    switch(t.dataset.co){
      case 'close': if(!CO.busy) coClose(); break;
      case 'copy': {
        const done = () => { t.innerHTML = ic('check', 13) + ' تم النسخ'; };
        try{ navigator.clipboard.writeText(CLIQ.alias).then(done, done); }catch(_){ done(); }
        break; }
      case 'pick': { const i = $('#coFile'); if(i) i.click(); break; }
      case 'rmfile': CO.file = null; coMount(); break;
      case 'rmcoupon': CO.coupon = null; CO.code = ''; CO.cmsg = ''; coMount(); break;
      case 'apply': coApply(); break;
      case 'track': coClose(); trOpen(true); break;
      case 'submit': coSubmit(); break;
    }
  }
  function coInput(e){
    const id = e.target.id, v = e.target.value;
    if(id === 'coName') CO.f.name = v; else if(id === 'coPhone') CO.f.phone = v; else if(id === 'coAddr') CO.f.address = v;
    else if(id === 'coNote') CO.f.note = v; else if(id === 'coCode') CO.code = v.toUpperCase();
  }
  function coChange(e){
    if(e.target.id !== 'coFile') return;
    const f = e.target.files && e.target.files[0]; if(!f) return;
    if(!(f.type.startsWith('image/') || f.type === 'application/pdf')){ CO.msg = 'الملف لازم يكون صورة أو PDF.'; coMount(); return; }
    if(f.size > 15 * 1024 * 1024){ CO.msg = 'حجم الملف كبير جدًا (الحد 15MB).'; coMount(); return; }
    CO.file = f; CO.msg = ''; coMount();
  }
  async function coApply(){
    const code = (CO.code || '').trim().toUpperCase();
    if(!code){ CO.cmsg = 'أدخل كود الكوبون.'; coMount(); return; }
    CO.busy = 'coupon'; CO.cmsg = ''; coMount();
    try{
      const { data, error } = await supabaseClient.rpc('store_check_coupon', { p_code: code });
      if(error) throw error;
      if(data && data.ok){ CO.coupon = { code, percent: Number(data.percent) }; CO.cmsg = ''; }
      else CO.cmsg = (data && data.msg) || 'الكوبون غير صالح.';
    }catch(err){
      console.error('coupon check failed', err);
      CO.cmsg = (err && (err.code === 'PGRST202' || err.code === '42883')) ? 'نظام الدفع غير مفعّل بعد (شغّل store-orders.sql).' : 'تعذّر التحقق من الكوبون، حاول مرة ثانية.';
    }
    CO.busy = ''; coMount();
  }
  async function coSubmit(){
    if(CO.busy) return;
    const f = CO.f, free = coFree(), fail = m => { CO.msg = m; coMount(); };
    if((f.name || '').trim().length < 2) return fail('اكتب اسمك الكامل.');
    if(String(f.phone || '').replace(/\D/g, '').length < 9) return fail('اكتب رقم هاتف صحيح.');
    if((f.address || '').trim().length < 5) return fail('اكتب عنوان التوصيل.');
    if(!free && !CO.file) return fail('ارفع صورة الحوالة أو استخدم كوبون 100%.');
    CO.busy = 'submit'; CO.msg = ''; coMount();
    try{
      let proof = null;
      if(!free && CO.file){
        let blob = CO.file, ext = 'pdf', ct = 'application/pdf';
        if(CO.file.type.startsWith('image/')){ blob = await compressImage(CO.file, 1600); ext = 'jpg'; ct = 'image/jpeg'; }
        proof = Date.now() + '-' + Math.random().toString(36).slice(2, 10) + '.' + ext;
        const up = await supabaseClient.storage.from(PROOF_BUCKET).upload(proof, blob, { contentType: ct, upsert: false });
        if(up.error) throw up.error;
      }
      const items = cartLines().map(x => ({ id: String(x.p.id), qty: x.q }));
      const { data, error } = await supabaseClient.rpc('store_place_order', {
        p_name: f.name.trim(), p_phone: f.phone.trim(), p_address: f.address.trim(), p_note: (f.note || '').trim(),
        p_items: items, p_coupon: CO.coupon ? CO.coupon.code : null, p_proof: proof });
      if(error) throw error;
      if(!data || !data.ok){ CO.msg = (data && data.msg) || 'تعذّر إرسال الطلب.'; }
      else {
        lsSet('mx_cust', { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim() });
        lsSet('mx_last_order', { no: data.order_no, phone: f.phone.trim() });
        cart = {}; saveCart(); updActs();
        CO.done = data; CO.coupon = null; CO.file = null; CO.code = ''; CO.f.note = '';
      }
    }catch(err){
      console.error('MEDIX STORE order failed', err);
      CO.msg = (err && (err.code === 'PGRST202' || err.code === '42883' || err.code === '42P01')) ? 'نظام الدفع غير مفعّل بعد (شغّل store-orders.sql).' : 'تعذّر إرسال الطلب، تحقق من الاتصال وحاول مرة ثانية.';
    }
    CO.busy = ''; coMount();
  }

  /* ---------- تتبّع الطلب (الزبون: رقم الطلب + الهاتف) ---------- */
  const TR = { open:false, no:'', phone:'', busy:false, msg:'', res:null };
  function trHtml(){
    const head = `<div class="ch"><h2>تتبّع طلبك</h2><button class="mx-ib" data-tr="close" aria-label="إغلاق">${ic('x', 22)}</button></div>`;
    let out = '';
    if(TR.res){
      const o = TR.res, K = {
        pending:['قيد المراجعة', 'الأدمن يراجع الحوالة الآن، وعادةً بيتم الاعتماد خلال دقائق.'],
        approved:['تم اعتماد طلبك', 'سيتواصل معك فريقنا على رقم هاتفك لترتيب التوصيل.'],
        rejected:['تم رفض الطلب', o.reject_reason ? 'السبب: ' + o.reject_reason : 'لم نتمكن من اعتماد الحوالة. تواصل معنا وبنحلّها معك.']
      }[o.status] || ['—', ''];
      const d = o.created_at ? new Date(o.created_at).toLocaleString('ar-JO', { dateStyle:'medium', timeStyle:'short' }) : '';
      out = `<div class="cc"><div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.6rem">
          <b style="color:var(--m-fg);font-size:1.05rem">طلب #${esc(o.order_no)}</b><span class="tb ${esc(o.status)}">${K[0]}</span></div>
        <p style="font-size:.92rem;color:var(--m-fg);margin-bottom:.6rem">${esc(K[1])}</p>
        ${(o.items || []).map(i => `<div class="sm-l"><span>${esc(i.title)} × ${esc(i.qty)}</span><b>${fmt(Number(i.price) * Number(i.qty))}</b></div>`).join('')}
        <div class="tot"><span>الإجمالي</span><b>${fmt(o.total)}</b></div>
        <p class="hint">${d ? 'تاريخ الطلب: ' + esc(d) : ''}</p>
        ${o.status === 'rejected' ? `<a class="mx-btn line block sm" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('مرحبًا، بخصوص طلبي رقم #' + o.order_no)}" target="_blank" rel="noopener">${ic('wa', 16)} تواصل معنا عبر واتساب</a>` : ''}
        <button class="mx-btn line block sm" style="margin-top:.5rem" data-tr="go">${ic('check', 16)} تحديث الحالة</button></div>`;
    }
    return `<div class="cw tr">${head}
      <div class="cc"><div class="ct"><span class="cn">${ic('search', 15)}</span>أدخل بيانات طلبك</div>
        <label class="lb" for="trNo">رقم الطلب</label><input type="text" id="trNo" inputmode="numeric" dir="ltr" maxlength="12" placeholder="مثال: 12" value="${esc(TR.no)}">
        <label class="lb" for="trPhone">رقم الهاتف المستخدم بالطلب</label><input type="tel" id="trPhone" dir="ltr" maxlength="20" placeholder="07XXXXXXXX" value="${esc(TR.phone)}">
        ${TR.msg ? `<div class="err">${esc(TR.msg)}</div>` : ''}
        <button class="mx-btn ink block ${TR.busy ? 'off' : ''}" style="margin-top:1rem" data-tr="go">${TR.busy ? 'جارِ البحث...' : 'تتبّع الطلب'}</button></div>${out}</div>`;
  }
  function trMount(){
    const root = $('#mxRoot'); if(!root) return;
    let el = $('#mxTr');
    if(!TR.open){ if(el) el.remove(); return; }
    if(!el){
      el = document.createElement('div'); el.id = 'mxTr'; el.className = 'mx-co'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.onclick = e => { const t = e.target.closest('[data-tr]'); if(!t) return; if(t.dataset.tr === 'close') trClose(); else if(t.dataset.tr === 'go') trGo(); };
      el.oninput = e => { if(e.target.id === 'trNo') TR.no = e.target.value.replace(/\D/g, ''); else if(e.target.id === 'trPhone') TR.phone = e.target.value; };
      el.onkeydown = e => { if(e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); trGo(); } };
      root.appendChild(el);
      if(!trMount.esc){ trMount.esc = true; document.addEventListener('keydown', e => { if(e.key === 'Escape' && TR.open) trClose(); }); }
    }
    const st = el.scrollTop; el.innerHTML = trHtml(); el.scrollTop = st;
    document.body.style.overflow = 'hidden';
  }
  function trOpen(auto){
    const last = lsGet('mx_last_order', {}), cust = lsGet('mx_cust', {});
    TR.open = true; TR.msg = ''; TR.res = null;
    if(!TR.no) TR.no = last.no ? String(last.no) : '';
    if(!TR.phone) TR.phone = last.phone || cust.phone || '';
    trMount();
    if(auto && TR.no && TR.phone) trGo();
  }
  function trClose(){ TR.open = false; trMount(); document.body.style.overflow = ''; }
  async function trGo(){
    if(TR.busy) return;
    const no = parseInt(TR.no, 10);
    if(!no){ TR.msg = 'اكتب رقم الطلب.'; trMount(); return; }
    if(String(TR.phone || '').replace(/\D/g, '').length < 9){ TR.msg = 'اكتب رقم الهاتف كاملًا.'; trMount(); return; }
    TR.busy = true; TR.msg = ''; trMount();
    try{
      const { data, error } = await supabaseClient.rpc('store_track_order', { p_order_no: no, p_phone: TR.phone.trim() });
      if(error) throw error;
      if(data && data.ok){ TR.res = data; } else { TR.res = null; TR.msg = (data && data.msg) || 'ما لقينا الطلب.'; }
    }catch(err){
      console.error('track failed', err);
      TR.res = null;
      TR.msg = (err && (err.code === 'PGRST202' || err.code === '42883')) ? 'خدمة التتبّع غير مفعّلة بعد (شغّل store-orders.sql).' : 'تعذّر الاتصال، حاول مرة ثانية.';
    }
    TR.busy = false; trMount();
  }

  /* ---------- إدارة الطلبات والكوبونات (مشرف) ---------- */
  const waLink = ph => { let d = String(ph || '').replace(/\D/g, ''); if(d.startsWith('00')) d = d.slice(2); else if(d.startsWith('0')) d = '962' + d.slice(1); return 'https://wa.me/' + d; };
  const ST = { pending:['قيد المراجعة', '#b7791f'], approved:['معتمد', '#2f855a'], rejected:['مرفوض', '#c53030'] };
  async function modalOrders(){
    if(!isAdminSession()) return;
    openModal(`<h3>📦 طلبات المتجر</h3><div id="mxOrd"><p class="mx-muted">جارِ التحميل...</p></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إغلاق</button></div>`);
    document.getElementById('cancelModal').onclick = closeModal;
    const box = document.getElementById('mxOrd');
    const draw = async () => {
      const { data, error } = await supabaseClient.from('store_orders').select('*').order('created_at', { ascending: false }).limit(100);
      if(error){ box.innerHTML = `<div class="form-msg error">${esc(error.code === '42P01' ? 'شغّل ملف store-orders.sql أولًا.' : 'تعذّر تحميل الطلبات.')}</div>`; return; }
      box.innerHTML = (data || []).length ? data.map(o => {
        const s = ST[o.status] || ST.pending;
        return `<div style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>#${esc(o.order_no)} — ${esc(o.name)}</b><span style="color:${s[1]};font-weight:800">${s[0]}</span></div>
          <div style="font-size:13px;margin:4px 0"><a href="${esc(waLink(o.phone))}" target="_blank" rel="noopener" dir="ltr">${esc(o.phone)}</a> • ${esc(o.address)}</div>
          <div style="font-size:13px">${(o.items || []).map(i => `${esc(i.title)} × ${esc(i.qty)}`).join('، ')}</div>
          <div style="font-size:13px;margin:4px 0">الإجمالي: <b>${fmt(o.total)}</b>${Number(o.discount) > 0 ? ` (خصم ${fmt(o.discount)} — ${esc(o.coupon_code)})` : ''}${o.note ? ` • ملاحظة: ${esc(o.note)}` : ''}${o.status === 'rejected' && o.reject_reason ? ` • سبب الرفض: ${esc(o.reject_reason)}` : ''}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            ${o.proof_path ? `<button class="btn small" data-o="proof" data-p="${esc(o.proof_path)}">🧾 عرض الحوالة</button>` : ''}
            ${o.status !== 'approved' ? `<button class="btn teal solid small" data-o="approved" data-id="${esc(o.id)}">✅ اعتماد</button>` : ''}
            ${o.status !== 'rejected' ? `<button class="btn danger small" data-o="rejected" data-id="${esc(o.id)}">رفض</button>` : ''}</div></div>`;
      }).join('') : '<p>لا توجد طلبات بعد.</p>';
    };
    box.onclick = async e => {
      const b = e.target.closest('[data-o]'); if(!b) return;
      if(b.dataset.o === 'proof'){
        const { data, error } = await supabaseClient.storage.from(PROOF_BUCKET).createSignedUrl(b.dataset.p, 600);
        if(error || !data) { alert('تعذّر فتح الصورة.'); return; }
        window.open(data.signedUrl, '_blank', 'noopener'); return;
      }
      let reason = null;
      if(b.dataset.o === 'rejected'){ reason = prompt('سبب الرفض (بيظهر للزبون عند التتبّع، اختياري):'); if(reason === null) return; }
      b.disabled = true;
      const { error } = await supabaseClient.from('store_orders').update({ status: b.dataset.o, reviewed_at: new Date().toISOString(), reject_reason: (reason || '').trim() || null }).eq('id', b.dataset.id);
      if(error){ alert('تعذّر تحديث الطلب.'); b.disabled = false; return; }
      draw();
    };
    draw();
  }
  async function modalCoupons(){
    if(!isAdminSession()) return;
    const rnd = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), x => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 32]).join('');
    openModal(`<h3>🎟️ كوبونات المتجر</h3>
      <form id="mxCpF" style="display:flex;gap:6px;flex-wrap:wrap;align-items:end;margin-bottom:12px">
        <div class="field" style="flex:2;min-width:150px;margin:0"><label>الكود</label><input type="text" name="code" required value="${rnd()}" style="direction:ltr;text-transform:uppercase"></div>
        <div class="field" style="flex:1;min-width:80px;margin:0"><label>الخصم %</label><input type="number" name="percent" min="1" max="100" value="100" required></div>
        <div class="field" style="flex:1;min-width:80px;margin:0"><label>أقصى استخدام</label><input type="number" name="max" min="1" value="1"></div>
        <button class="btn teal solid small" type="submit">＋ إنشاء</button></form>
      <div id="mxCpL"><p class="mx-muted">جارِ التحميل...</p></div>
      <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إغلاق</button></div>`);
    document.getElementById('cancelModal').onclick = closeModal;
    const box = document.getElementById('mxCpL');
    const draw = async () => {
      const { data, error } = await supabaseClient.from('store_coupons').select('*').order('created_at', { ascending: false });
      if(error){ box.innerHTML = `<div class="form-msg error">${esc(error.code === '42P01' ? 'شغّل ملف store-orders.sql أولًا.' : 'تعذّر تحميل الكوبونات.')}</div>`; return; }
      box.innerHTML = (data || []).length ? data.map(c => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid var(--border);border-radius:10px;padding:8px 10px;margin-bottom:6px">
        <div><b dir="ltr" style="font-family:monospace">${esc(c.code)}</b> — خصم ${esc(c.percent)}%<div style="font-size:12px;opacity:.7">استخدام: ${esc(c.used_count)}${c.max_uses != null ? ' / ' + esc(c.max_uses) : ''}</div></div>
        <div style="display:flex;gap:6px"><button class="btn small ${c.active ? 'teal' : ''}" data-c="tog" data-id="${esc(c.id)}" data-v="${c.active}">${c.active ? '✅ مفعّل' : '⏸️ متوقف'}</button><button class="btn danger small" data-c="del" data-id="${esc(c.id)}">حذف</button></div></div>`).join('') : '<p>لا توجد كوبونات.</p>';
    };
    box.onclick = async e => {
      const b = e.target.closest('[data-c]'); if(!b) return; b.disabled = true;
      const r = b.dataset.c === 'tog'
        ? await supabaseClient.from('store_coupons').update({ active: b.dataset.v !== 'true' }).eq('id', b.dataset.id)
        : await supabaseClient.from('store_coupons').delete().eq('id', b.dataset.id);
      if(r.error) alert('تعذّر تنفيذ العملية.');
      draw();
    };
    document.getElementById('mxCpF').onsubmit = async e => {
      e.preventDefault(); const fd = new FormData(e.target);
      const { error } = await supabaseClient.from('store_coupons').insert({ code: String(fd.get('code')).trim().toUpperCase(), percent: Number(fd.get('percent')), max_uses: fd.get('max') ? Number(fd.get('max')) : null });
      if(error){ alert(error.code === '23505' ? 'هذا الكود موجود مسبقًا.' : 'تعذّر إنشاء الكوبون.'); return; }
      e.target.code.value = rnd(); draw();
    };
    draw();
  }

  /* ---------- إدارة المنتجات (مشرف) ---------- */
  async function toggleProduct(id){
    const p = by(id); if(!p) return;
    const next = p.active === false;
    const { error } = await supabaseClient.from(TABLE).update({ active: next }).eq('id', p.id);
    if(error){ alert('تعذّر التحديث: ' + error.message); return; }
    p.active = next; updGrid();
  }
  async function deleteProduct(id){
    const p = by(id); if(!p || !confirm(`حذف المنتج "${p.title}" نهائيًا؟`)) return;
    const { error } = await supabaseClient.from(TABLE).delete().eq('id', p.id);
    if(error){ alert('تعذّر الحذف: ' + error.message); return; }
    S.items = S.items.filter(x => x.id !== p.id); delete cart[p.id]; saveCart(); wish.delete(p.id); saveWish(); render();
  }

  function compressImage(file, max){
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve(b) : reject(new Error('فشل ضغط الصورة')), 'image/jpeg', 0.85);
      };
      img.onerror = () => reject(new Error('الملف ليس صورة صالحة'));
      img.src = url;
    });
  }

  function modalTexts(){
    if(!isAdminSession()) return;
    openModal(`<h3>✏️ نصوص أعلى الصفحة</h3>
      <form id="mxTxt">
        <div class="field"><label>العنوان الرئيسي</label><input type="text" name="headline" maxlength="90" value="${esc(cfg('headline'))}"></div>
        <div class="field"><label>شريط الإعلان العلوي (اتركه فاضي لإخفائه)</label><input type="text" name="promo" maxlength="140" value="${esc(promoText())}"></div>
        <div class="field"><label>الوصف تحت العنوان</label><textarea name="sub" rows="4" maxlength="300">${esc(cfg('sub'))}</textarea></div>
        <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ</button></div>
      </form>`);
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('mxTxt').onsubmit = async e => {
      e.preventDefault(); const fd = new FormData(e.target);
      state.storeSettings = Object.assign({}, state.storeSettings, { headline: (fd.get('headline') || '').trim() || DEFAULTS.headline, sub: (fd.get('sub') || '').trim() || DEFAULTS.sub, promo: (fd.get('promo') || '').trim() });
      const ok = await saveSettings(); if(!ok) return; closeModal(); render();
    };
  }

  function modalProduct(p){
    if(!isAdminSession()) return;
    const isEdit = !!p; p = p || {};
    openModal(`
      <h3>${isEdit ? '✏️ تعديل منتج' : '🛍️ إضافة منتج جديد'}</h3>
      <form id="mxForm">
        <div class="field"><label>اسم المنتج</label><input type="text" name="title" required maxlength="120" value="${esc(p.title)}"></div>
        <div class="field"><label>الوصف</label><textarea name="description" rows="3" maxlength="600">${esc(p.description)}</textarea></div>
        <div class="field"><label>محتويات المنتج (سطر لكل بند — بتظهر بالعرض السريع)</label><textarea name="includes" rows="3" maxlength="500">${esc(p.includes)}</textarea></div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1"><label>السعر (${CUR})</label><input type="number" name="price" min="0" step="0.01" required value="${esc(p.price)}"></div>
          <div class="field" style="flex:1"><label>السعر قبل الخصم (اختياري)</label><input type="number" name="old_price" min="0" step="0.01" value="${esc(p.old_price)}"></div>
        </div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1"><label>التصنيف</label><select name="category">${visCats().map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
          <div class="field" style="flex:1"><label>شارة على المنتج (اختياري)</label><input type="text" name="badge" maxlength="24" placeholder="مثال: الأكثر طلبًا" value="${esc(p.badge)}"></div>
        </div>
        <div class="field"><label>صورة المنتج (ارفع صورة)</label><input type="file" name="imageFile" accept="image/*"></div>
        <div class="field"><label>أو رابط صورة (https)</label><input type="url" name="image_url" style="direction:ltr" value="${esc(p.image_url)}"></div>
        <div class="field"><label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" name="in_stock" style="width:auto" ${p.in_stock === false ? '' : 'checked'}> متوفّر بالمخزون</label></div>
        <div class="field"><label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" name="active" style="width:auto" ${p.active === false ? '' : 'checked'}> ظاهر للطلاب</label></div>
        <div id="mxMsg"></div>
        <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small" id="mxSave">حفظ</button></div>
      </form>`);
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('mxForm').onsubmit = async e => {
      e.preventDefault();
      const fd = new FormData(e.target), msg = document.getElementById('mxMsg'), btn = document.getElementById('mxSave');
      btn.disabled = true; btn.textContent = 'جارِ الحفظ...'; msg.innerHTML = '';
      try{
        let imageUrl = (fd.get('image_url') || '').trim();
        if(imageUrl && !/^https:\/\//i.test(imageUrl)) throw new Error('رابط الصورة لازم يبدأ بـ https://');
        const file = fd.get('imageFile');
        if(file && file.size){
          const blob = await compressImage(file, 900);
          const path = (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)) + '.jpg';
          const up = await supabaseClient.storage.from(BUCKET).upload(path, blob, { contentType:'image/jpeg', upsert:false });
          if(up.error) throw up.error;
          imageUrl = supabaseClient.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        }
        const row = {
          title: (fd.get('title') || '').trim(), description: (fd.get('description') || '').trim(),
          includes: (fd.get('includes') || '').trim() || null,
          price: parseFloat(fd.get('price')), old_price: fd.get('old_price') ? parseFloat(fd.get('old_price')) : null,
          category: fd.get('category') || 'nursing', badge: (fd.get('badge') || '').trim() || null,
          image_url: imageUrl || null, in_stock: fd.get('in_stock') === 'on',
          active: fd.get('active') === 'on',
        };
        if(!row.title || !isFinite(row.price)) throw new Error('اسم المنتج والسعر مطلوبان');
        if(isEdit){
          const { data, error } = await supabaseClient.from(TABLE).update(row).eq('id', p.id).select().single();
          if(error) throw error; S.items = S.items.map(x => x.id === p.id ? data : x);
        }else{
          const { data, error } = await supabaseClient.from(TABLE).insert(row).select().single();
          if(error) throw error; S.items.unshift(data);
        }
        closeModal(); render();
      }catch(err){
        console.error(err);
        msg.innerHTML = `<div class="form-msg error">${esc(err.message || 'حدث خطأ غير متوقع')}</div>`;
        btn.disabled = false; btn.textContent = 'حفظ';
      }
    };
  }

  const errHtml = e => `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>تعذّر عرض المتجر</h3><p>حدّث الصفحة، وإذا استمرت المشكلة أرسل لنا الرسالة التالية:</p><p dir="ltr" style="font-size:12px;opacity:.7">${String((e && e.message) || e).replace(/[<>&"]/g, '')}</p></div></div></section>`;
  const guard = (fn, fb) => (...a) => { try{ return fn(...a); }catch(e){ console.error('MEDIX STORE', e); return fb(e); } };
  window.MedixStore = { page: guard(page, errHtml), bind: guard(bind, () => {}) };
})();
}catch(err){
  console.error('MEDIX STORE init failed', err);
  window.MedixStore = {
    page: () => '<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>تعذّر تشغيل المتجر</h3><p dir="ltr" style="font-size:12px;opacity:.7">' + String((err && err.message) || err).replace(/[<>&"]/g, '') + '</p></div></div></section>',
    bind: () => {}
  };
}
