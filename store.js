/* =========================================================
   MEDIX STORE — صفحة المتجر الكاملة (ملف مستقل عن app.js)
   - بيتحمّل كسوليًا فقط لما حدا يفتح /store.
   - المنتجات: جدول Supabase اسمه store_products  (شوف store-setup.sql)
   - إظهار/إخفاء المتجر + نصوص الهيرو: medora_data → المفتاح store_settings
   - السلة والمفضّلة محفوظتين بمتصفح الطالب (localStorage)، والطلب بيروح واتساب.
   - بيستخدم من app.js فقط: supabaseClient, state, setData, escapeHtml,
     isAdminSession, openModal, closeModal, render, currentRoute
   ========================================================= */
(function(){
  'use strict';

  const WA_NUMBER = '962781492144';
  const TABLE = 'store_products', BUCKET = 'store', CUR = 'د.أ';
  const LOGO_URL = '/medix-logo.jpg';

  const CATS = [
    { id:'nursing',   name:'التمريض' },
    { id:'dentistry', name:'طب الأسنان' },
    { id:'bundles',   name:'الباقات' },
  ];
  const catName = id => (CATS.find(c => c.id === id) || {}).name || '';
  const DEFAULTS = {
    headline: 'جهّز نفسك لتميّز سنواتك السريرية.',
    sub: 'أدوات تشخيص وأسنان مختارة بعناية لطلاب التمريض وطب الأسنان، وبأسعار تناسب الطلاب. ابدأ سنواتك السريرية بأدوات تثق فيها.',
  };

  const S = { loaded:false, loading:false, error:'', items:[], tab:'all', slide:0, q:'', cartOpen:false, qv:null };

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
    shield:'<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'
  };
  const ic = (n, s = 18, x = '', cls = '') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="${cls}" ${x}>${IC[n]}</svg>`;
  const K = '#293B4B', T = '#2EA89E', PL = '#CDEEEB';
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
.mx-root{--m-bg:#fff;--m-surface:#fff;--m-mist:#F4F7F9;--m-fg:#0F2942;--m-body:#293B4B;--m-muted:#5B6B7A;--m-line:#E3EAEF;--m-tint:#EAF7F6;--m-tt:#178079;--m-teal:#2EA89E;--m-t6:#178079;--m-t7:#126862;--m-navy:#1F3040;--m-lift:0 1px 2px rgba(15,41,66,.06),0 12px 32px -12px rgba(15,41,66,.25);
  background:var(--m-bg);color:var(--m-body);font-family:Cairo,system-ui,sans-serif;min-height:100vh;line-height:1.7;-webkit-font-smoothing:antialiased}
body.dark .mx-root{--m-bg:#0C1823;--m-surface:#13222F;--m-mist:#101E2A;--m-fg:#F1F5F8;--m-body:#CBD5DD;--m-muted:#93A3B2;--m-line:#233545;--m-tint:#10302F;--m-tt:#5CD0C7}
.mx-root,.mx-root *,.mx-root *::before,.mx-root *::after{box-sizing:border-box}
.mx-root h1,.mx-root h2,.mx-root h3,.mx-root p,.mx-root ul{margin:0;padding:0}
.mx-root ul{list-style:none}
.mx-root h1,.mx-root h2,.mx-root h3{color:var(--m-fg);font-family:inherit;font-weight:700}
.mx-root a{color:inherit;text-decoration:none}
.mx-root button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.mx-root svg{display:block;flex:none}.mx-root img{max-width:100%}
.mx-root :focus-visible{outline:2px solid var(--m-teal);outline-offset:2px;border-radius:6px}
html[dir=rtl] .mx-flip{transform:scaleX(-1)}
.mx-in{max-width:80rem;margin:0 auto;padding:0 1.5rem}
.mx-muted{color:var(--m-muted)}
/* أزرار */
.mx-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:.7rem 1.5rem;font-size:.9rem;font-weight:700;transition:background .15s,border-color .15s}
.mx-btn.teal{background:var(--m-t6);color:#fff!important;box-shadow:var(--m-lift)}.mx-btn.teal:hover{background:var(--m-t7)}
.mx-btn.line{border:1px solid var(--m-line);background:var(--m-surface);color:var(--m-fg)}.mx-btn.line:hover{border-color:var(--m-t6)}
.mx-btn.navy{background:var(--m-navy);color:#fff!important}
.mx-btn.sm{padding:.5rem 1rem;font-size:.85rem}
.mx-btn[disabled],.mx-btn.off{opacity:.45;pointer-events:none}
/* شريط المشرف */
.mx-admin{background:var(--m-tint);border-bottom:1.5px dashed var(--m-teal)}
.mx-admin .mx-in{display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;align-items:center;padding-top:.6rem;padding-bottom:.6rem;font-size:.9rem}
.mx-sw{display:flex;align-items:center;gap:.6rem;font-weight:700;color:var(--m-fg);cursor:pointer}
.mx-sw input{width:1.1rem;height:1.1rem;accent-color:var(--m-t6)}
.mx-pill{font-size:.75rem;font-weight:800;padding:.15rem .65rem;border-radius:999px}
.mx-pill.on{background:rgba(30,160,100,.16);color:#12875a}.mx-pill.off{background:rgba(220,60,60,.15);color:#c0392b}
.mx-admin .sp{margin-inline-start:auto;display:flex;gap:.5rem;flex-wrap:wrap}
/* الهيدر */
.mx-head{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--m-line);background:color-mix(in srgb,var(--m-surface) 82%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.mx-head .mx-in{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.25rem;padding-top:.6rem;padding-bottom:.6rem}
.mx-brand{display:flex;align-items:center;gap:.6rem}
.mx-brand img{height:2rem;width:auto;border-radius:6px}
.mx-brand b{font-size:1.15rem;font-weight:800;color:var(--m-fg);font-family:Lexend,Cairo,system-ui,sans-serif;letter-spacing:.2px}
.mx-brand b span{font-weight:400;color:var(--m-tt)}
.mx-nav{display:none;align-items:center;gap:.25rem}
.mx-nav button,.mx-chips button{border-radius:.6rem;padding:.4rem .8rem;font-size:.9rem;font-weight:600}
.mx-nav button:hover{background:var(--m-mist)}
.mx-search{position:relative;order:9;width:100%}
.mx-search input{width:100%;border-radius:999px;border:1px solid var(--m-line);background:var(--m-mist);color:var(--m-fg);padding:.5rem 2.5rem;font:inherit;font-size:1rem;outline:0}
.mx-search input:focus{border-color:var(--m-t6)}
.mx-search .si{position:absolute;inset-inline-start:.9rem;top:50%;transform:translateY(-50%);color:var(--m-muted);pointer-events:none}
.mx-sl{position:absolute;inset-inline:0;top:calc(100% + .5rem);background:var(--m-surface);border:1px solid var(--m-line);border-radius:.9rem;padding:.3rem;box-shadow:var(--m-lift);z-index:5}
.mx-sl[hidden]{display:none}
.mx-sl button,.mx-sl p{display:flex;width:100%;justify-content:space-between;gap:.5rem;text-align:start;border-radius:.6rem;padding:.55rem .75rem;font-size:.9rem}
.mx-sl button:hover{background:var(--m-mist)}.mx-sl p{color:var(--m-muted)}
.mx-acts{display:flex;align-items:center;margin-inline-start:auto}
.mx-ib{position:relative;border-radius:999px;padding:.6rem;color:var(--m-fg)}.mx-ib:hover{background:var(--m-mist)}
.mx-badge-n{position:absolute;top:.1rem;inset-inline-end:.1rem;min-width:1rem;height:1rem;border-radius:999px;padding:0 .25rem;font-size:.65rem;font-weight:700;color:#fff;display:grid;place-items:center;line-height:1}
.mx-chips{display:flex;gap:.5rem;overflow-x:auto;border-top:1px solid var(--m-line);padding:.5rem 1.5rem}
.mx-chips button{flex:none;background:var(--m-mist);border-radius:999px;padding:.3rem 1rem}
/* الهيرو */
.mx-hero{overflow:hidden;background:linear-gradient(var(--m-bg),var(--m-mist))}
.mx-hero .mx-in{display:grid;gap:2.5rem;align-items:center;padding-top:3rem;padding-bottom:3rem}
.mx-hero h1{font-size:clamp(2rem,5vw,3.6rem);line-height:1.3;letter-spacing:-.01em;max-width:34rem}
.mx-hero .lead{margin-top:1.2rem;max-width:32rem;font-size:1.08rem;color:var(--m-muted)}
.mx-cta{margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:.75rem}
.mx-trust{margin-top:2rem;display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;font-size:.9rem}
.mx-trust li{display:flex;align-items:center;gap:.5rem;color:var(--m-tt)}.mx-trust span{color:var(--m-body)}
.mx-stage{position:relative;margin:0 auto;aspect-ratio:1/1;width:100%;max-width:24rem;perspective:1000px}
.mx-tilt{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .15s ease-out}
.mx-tilt>svg{position:absolute;inset:0;width:100%;height:100%}
.mx-plate{position:absolute;inset:14%;border-radius:2.5rem;background:#fff;box-shadow:var(--m-lift)}
.mx-ha{position:absolute;inset:22%;display:grid;place-items:center;transform:translateZ(60px);filter:drop-shadow(0 18px 18px rgba(15,41,66,.18))}
.mx-ha img{width:100%;height:100%;object-fit:contain}
.mx-fade{animation:mxfade .3s ease both;width:100%;height:100%}@keyframes mxfade{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}
.mx-hcard{margin:1.25rem auto 0;max-width:24rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;border:1px solid var(--m-line);border-radius:1rem;background:var(--m-surface);padding:1rem;box-shadow:var(--m-lift)}
.mx-hcard .t{min-width:0}.mx-hcard b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.9rem;color:var(--m-fg)}
.mx-hcard s,.mx-price s{color:var(--m-muted);font-weight:400;font-size:.8rem}
.mx-dots{margin:.75rem auto 0;display:flex;align-items:center;justify-content:center;gap:.6rem}
.mx-dots .d{height:.5rem;width:.5rem;border-radius:999px;background:var(--m-line)}.mx-dots .d.on{width:1.5rem;background:var(--m-t6)}
.mx-dots .ar{border-radius:999px;padding:.4rem;color:var(--m-fg)}.mx-dots .ar:hover{background:var(--m-mist)}
/* التخصصات */
.mx-sec{padding:4rem 0}
.mx-sec h2{font-size:clamp(1.6rem,3.4vw,2.3rem);letter-spacing:-.01em}
.mx-sec .sub{margin-top:.6rem;max-width:36rem;color:var(--m-muted)}
.mx-cats{margin-top:2.25rem;display:grid;gap:1.25rem}
.mx-cat{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:21rem;overflow:hidden;border-radius:1.5rem;padding:1.75rem;text-align:start;width:100%}
.mx-cat.navy{background:var(--m-navy);color:#fff}.mx-cat.navy h3{color:#fff}.mx-cat.tint{background:var(--m-tint)}
.mx-cat .tx{position:relative;z-index:2;max-width:14rem}
.mx-cat h3{font-size:1.5rem}.mx-cat p{margin-top:.5rem;font-size:.88rem;line-height:1.8}.mx-cat.navy p{color:#cbd5e1}
.mx-cat ul{margin-top:1rem;display:grid;gap:.2rem;font-size:.9rem}.mx-cat.navy ul{color:#e2e8f0}
.mx-cat .go{position:relative;z-index:2;margin-top:1.5rem;display:inline-flex;align-items:center;gap:.5rem;font-size:.9rem;font-weight:700}
.mx-cat.navy .go{color:#6CCAC3}.mx-cat.tint .go{color:var(--m-tt)}
.mx-cat .art{position:absolute;inset-block:0;inset-inline-end:0;width:50%;pointer-events:none}
.mx-cat .a{position:absolute;width:6rem;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.mx-cat .a1{inset-inline-end:8%;top:10%}.mx-cat .a2{inset-inline-end:34%;top:40%;width:5rem}.mx-cat .a3{inset-inline-end:6%;top:58%}
.mx-cat:hover .a1{transform:translateY(-12px) rotate(-4deg)}.mx-cat:hover .a2{transform:translateY(-18px) rotate(8deg)}.mx-cat:hover .a3{transform:translateY(-8px) rotate(14deg)}
.mx-strip{margin-top:1.25rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;border:1px solid var(--m-line);background:var(--m-mist);border-radius:1rem;padding:1.2rem 1.5rem;width:100%;text-align:start}
.mx-strip:hover{border-color:var(--m-t6)}.mx-strip b{color:var(--m-fg)}.mx-strip small{font-size:.88rem;color:var(--m-muted)}
.mx-strip .go{display:inline-flex;align-items:center;gap:.5rem;font-size:.9rem;font-weight:700;color:var(--m-tt)}
/* المنتجات */
.mx-feat{background:var(--m-mist);padding:4rem 0}
.mx-fh{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1.25rem}
.mx-tabs{display:flex;flex-wrap:wrap;gap:.25rem;border:1px solid var(--m-line);background:var(--m-surface);border-radius:999px;padding:.25rem}
.mx-tabs button{border-radius:999px;padding:.4rem 1rem;font-size:.88rem;font-weight:700;color:var(--m-body)}
.mx-tabs button.on{background:var(--m-navy);color:#fff}
.mx-grid{margin-top:2.25rem;display:grid;gap:1.25rem;grid-template-columns:1fr}
.mx-card{position:relative;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--m-line);border-radius:1rem;background:var(--m-surface)}
.mx-card.hid{opacity:.55}
.mx-tile{position:relative;display:grid;place-items:center;aspect-ratio:4/3;background:linear-gradient(#fff,#E6ECF0)}
.mx-tile .pimg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:.9rem}
.mx-tile .art7{width:7rem;height:7rem}
.mx-tag{position:absolute;top:.75rem;inset-inline-start:.75rem;border-radius:999px;padding:.2rem .7rem;font-size:.75rem;font-weight:800;background:#CDEEEB;color:#126862}
.mx-tag.dark{background:var(--m-navy);color:#fff}.mx-tag.out{background:#c0392b;color:#fff;top:auto;bottom:.75rem}
.mx-side{position:absolute;top:.75rem;inset-inline-end:.75rem;display:flex;flex-direction:column;gap:.5rem}
.mx-side button{border-radius:999px;background:#fff;color:#293B4B;padding:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.mx-side button.on{color:var(--m-t6)}
.mx-cb{display:flex;flex:1;flex-direction:column;gap:.5rem;padding:1rem}
.mx-cb h3{font-size:1rem;line-height:1.5}
.mx-cb .d{font-size:.85rem;color:var(--m-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mx-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding-top:.6rem}
.mx-price{font-size:1.15rem;font-weight:800;color:var(--m-fg)}
.mx-arow{display:flex;gap:.4rem;border-top:1px dashed var(--m-line);padding-top:.6rem;margin-top:.3rem}
.mx-arow button{flex:1;border:1px solid var(--m-line);border-radius:.6rem;padding:.3rem;font-size:.78rem;font-weight:700;background:var(--m-mist)}
.mx-arow .del{color:#c0392b}
.mx-empty{grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--m-muted)}.mx-empty h3{margin-bottom:.4rem}
/* السلة والعرض السريع */
.mx-ov{position:fixed;inset:0;z-index:50;background:rgba(15,41,66,.5)}.mx-ov[hidden]{display:none}
.mx-drawer{position:fixed;top:0;bottom:0;inset-inline-end:0;z-index:51;width:100%;max-width:28rem;background:var(--m-surface);box-shadow:-10px 0 40px rgba(0,0,0,.25);display:flex;flex-direction:column;transition:transform .28s ease;transform:translateX(100%)}
html[dir=rtl] .mx-drawer{transform:translateX(-100%)}
.mx-drawer.open,html[dir=rtl] .mx-drawer.open{transform:none}
.mx-dh{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--m-line);padding:1rem 1.25rem}.mx-dh h2{font-size:1.1rem}
.mx-dl{flex:1;overflow-y:auto;padding:0 1.25rem}
.mx-dl li{display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--m-line)}
.mx-dl .th{width:5rem;height:5rem;border-radius:.8rem;flex:none;display:grid;place-items:center;background:linear-gradient(#fff,#E6ECF0);overflow:hidden}
.mx-dl .th img{width:100%;height:100%;object-fit:contain;padding:.3rem}.mx-dl .th .a{width:3.4rem;height:3.4rem}
.mx-dl .in{flex:1;min-width:0}.mx-dl .in b{font-size:.9rem;color:var(--m-fg);display:block}
.mx-qty{margin-top:.5rem;display:inline-flex;align-items:center;border:1px solid var(--m-line);border-radius:999px}
.mx-qty button{padding:.45rem}.mx-qty span{min-width:1.5rem;text-align:center;font-size:.88rem}
.mx-df{border-top:1px solid var(--m-line);padding:1.25rem}.mx-df .row{display:flex;justify-content:space-between;font-weight:800;color:var(--m-fg)}
.mx-df small{display:block;margin:.3rem 0 1rem;color:var(--m-muted);font-size:.78rem}
.mx-df .mx-btn{width:100%;background:#25d366;color:#fff!important}
.mx-dempty{flex:1;display:grid;place-content:center;justify-items:center;gap:.75rem;padding:2rem;text-align:center}
.mx-qv{position:fixed;inset:0;z-index:52;display:grid;place-items:center;overflow-y:auto;padding:1rem}.mx-qv[hidden]{display:none}
.mx-qv .bg{position:absolute;inset:0;background:rgba(15,41,66,.5)}
.mx-qvb{position:relative;display:grid;width:100%;max-width:48rem;overflow:hidden;border-radius:1.5rem;background:var(--m-surface);box-shadow:0 25px 60px rgba(0,0,0,.35)}
.mx-qvb .vis{display:grid;place-items:center;padding:2.5rem;min-height:14rem;background:linear-gradient(#fff,#E6ECF0)}
.mx-qvb .vis img{width:100%;max-height:18rem;object-fit:contain}.mx-qvb .vis .a{width:11rem;height:11rem}
.mx-qvb .inf{display:flex;flex-direction:column;gap:1rem;padding:1.75rem}
.mx-qvb .xx{position:absolute;top:.75rem;inset-inline-end:.75rem;z-index:2;background:#fff;color:#293B4B;border-radius:999px;padding:.5rem;box-shadow:0 1px 4px rgba(0,0,0,.2)}
.mx-incl{display:grid;gap:.4rem;font-size:.9rem}.mx-incl li{display:flex;align-items:center;gap:.5rem}.mx-incl svg{color:var(--m-tt)}
.mx-fin{border-top:1px solid var(--m-line);padding:1.5rem 0;font-size:.88rem;color:var(--m-muted)}
.mx-fin .mx-in{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:space-between;align-items:center}
@media(min-width:640px){.mx-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:768px){.mx-nav{display:flex}.mx-chips{display:none}.mx-search{order:0;width:auto;flex:1;max-width:20rem;margin-inline-start:auto}.mx-acts{margin-inline-start:0}.mx-cats{grid-template-columns:1fr 1fr}.mx-qvb{grid-template-columns:1fr 1fr}.mx-hero .mx-in{padding-top:5rem;padding-bottom:5rem}}
@media(min-width:1024px){.mx-grid{grid-template-columns:repeat(4,1fr)}.mx-hero .mx-in{grid-template-columns:1.05fr 1fr}}
@media(prefers-reduced-motion:reduce){.mx-root *{animation:none!important;transition-duration:.01ms!important}}`;
    document.head.appendChild(st);
  }

  /* ---------- تحميل المنتجات ---------- */
  async function load(){
    if(S.loading || S.loaded) return;
    S.loading = true; S.error = '';
    try{
      const { data, error } = await supabaseClient.from(TABLE).select('*').order('created_at', { ascending:false });
      if(error) throw error;
      S.items = data || []; S.loaded = true;
      const ids = new Set(S.items.map(p => String(p.id)));
      Object.keys(cart).forEach(k => { if(!ids.has(k)) delete cart[k]; }); saveCart();
      wish = new Set([...wish].filter(k => ids.has(String(k)))); saveWish();
    }catch(e){
      console.error('MEDIX STORE load failed', e);
      S.error = 'تعذّر تحميل المنتجات حاليًا، حاول مرة ثانية.';
    }
    S.loading = false;
    if(currentRoute() === 'store') render();
  }

  /* ---------- مكوّنات الواجهة ---------- */
  const slides = () => {
    const act = S.items.filter(p => p.active !== false && p.in_stock !== false);
    const f = act.filter(p => p.featured);
    return (f.length ? f : act).slice(0, 5);
  };
  const cartLines = () => Object.entries(cart).map(([id, q]) => ({ p:by(id), q })).filter(x => x.p && x.q > 0);
  const cartCount = () => cartLines().reduce((a, x) => a + x.q, 0);
  const cartTotal = () => cartLines().reduce((a, x) => a + Number(x.p.price) * x.q, 0);
  const cnt = (n, bg) => n ? `<span class="mx-badge-n" style="background:${bg}">${n}</span>` : '';

  function actsHtml(){
    return `<button class="mx-ib" data-act="theme" aria-label="تبديل الوضع الليلي">${ic('moon', 20)}</button>
      <button class="mx-ib" data-act="wishnav" aria-label="المفضّلة (${wish.size})">${ic('heart', 20)}${cnt(wish.size, 'var(--m-navy)')}</button>
      <button class="mx-ib" data-act="cart" aria-label="السلة (${cartCount()})">${ic('bag', 20)}${cnt(cartCount(), 'var(--m-t6)')}</button>`;
  }

  function adminBarHtml(){
    if(!isAdminSession()) return '';
    const on = !!(state.storeSettings && state.storeSettings.visible);
    return `<div class="mx-admin"><div class="mx-in">
      <label class="mx-sw"><input type="checkbox" id="mxVis" ${on ? 'checked' : ''}> إظهار المتجر للطلاب والزوّار
        <span class="mx-pill ${on ? 'on' : 'off'}">${on ? 'ظاهر للجميع' : 'مخفي — للمشرف فقط'}</span></label>
      <div class="sp">
        <button class="mx-btn teal sm" data-act="new">＋ إضافة منتج</button>
        <button class="mx-btn line sm" data-act="texts">✏️ نصوص الصفحة</button>
        <a class="mx-btn line sm" href="/home">🛡️ العودة للمنصة</a>
      </div></div></div>`;
  }

  function headHtml(){
    return `<div class="mx-head"><div class="mx-in">
      <a class="mx-brand" href="/home" aria-label="MEDIX Store"><img src="${esc(LOGO_URL)}" alt=""><b>MEDIX <span>Store</span></b></a>
      <nav class="mx-nav" aria-label="التصنيفات">
        <button data-act="cat" data-id="nursing">التمريض</button><button data-act="cat" data-id="dentistry">طب الأسنان</button>
        <button data-act="cat" data-id="bundles">الباقات</button><button data-act="go" data-id="mxFeat">الأكثر طلبًا</button>
      </nav>
      <div class="mx-search">
        <span class="si">${ic('search', 16)}</span>
        <input id="mxQ" type="search" autocomplete="off" placeholder="ابحث عن سماعة، مسبار، طقم..." value="${esc(S.q)}" aria-label="بحث">
        <div class="mx-sl" id="mxSl" hidden></div>
      </div>
      <div class="mx-acts" id="mxActs">${actsHtml()}</div>
    </div>
    <nav class="mx-chips" aria-label="التصنيفات">
      <button data-act="cat" data-id="nursing">التمريض</button><button data-act="cat" data-id="dentistry">طب الأسنان</button>
      <button data-act="cat" data-id="bundles">الباقات</button><button data-act="go" data-id="mxFeat">الأكثر طلبًا</button>
    </nav></div>`;
  }

  function heroVisualHtml(){
    const L = slides(); if(S.slide >= L.length) S.slide = 0;
    const p = L[S.slide];
    const vis = p ? (imgOf(p) ? `<img src="${esc(imgOf(p))}" alt="${esc(p.title)}">` : art(artKey(p))) : art('steth');
    return `<div class="mx-stage" id="mxStage"><div class="mx-tilt" id="mxTilt">
        <svg viewBox="0 0 400 400" fill="none" aria-hidden="true"><ellipse cx="200" cy="215" rx="178" ry="116" transform="rotate(-14 200 215)" stroke="#2EA89E" stroke-width="10" stroke-linecap="round" stroke-dasharray="520 400"/><circle cx="352" cy="148" r="17" fill="#fff" stroke="#2EA89E" stroke-width="8"/><circle cx="352" cy="148" r="5" fill="#2EA89E"/></svg>
        <div class="mx-plate"></div><div class="mx-ha"><div class="mx-fade">${vis}</div></div></div></div>
      <div class="mx-hcard">
        ${p ? `<div class="t"><b>${esc(p.title)}</b><span class="mx-muted" style="font-size:.9rem">${fmt(p.price)}${p.old_price ? ` <s>${fmt(p.old_price)}</s>` : ''}</span></div>
          <button class="mx-btn navy sm" data-act="add" data-id="${esc(p.id)}">أضف للسلة</button>`
        : `<div class="t"><b>منتجاتنا قريبًا</b><span class="mx-muted" style="font-size:.9rem">ترقّبوا الإطلاق</span></div>`}
      </div>
      ${L.length > 1 ? `<div class="mx-dots"><button class="ar mx-flip" data-act="prev" aria-label="السابق">${ic('l')}</button>
        ${L.map((_, n) => `<button class="d ${n === S.slide ? 'on' : ''}" data-act="slide" data-id="${n}" aria-label="منتج ${n + 1}"></button>`).join('')}
        <button class="ar mx-flip" data-act="next" aria-label="التالي">${ic('r')}</button></div>` : ''}`;
  }

  function heroHtml(){
    return `<section class="mx-hero"><div class="mx-in">
      <div><h1>${esc(cfg('headline'))}</h1><p class="lead">${esc(cfg('sub'))}</p>
        <div class="mx-cta"><button class="mx-btn teal" data-act="cat" data-id="nursing">تسوّق أدوات التمريض</button>
          <button class="mx-btn line" data-act="cat" data-id="dentistry">استكشف أدوات الأسنان</button></div>
        <ul class="mx-trust"><li>${ic('shield')}<span>أدوات مختارة للطلاب</span></li><li>${ic('check')}<span>أسعار مناسبة للطلاب</span></li><li>${ic('check')}<span>طلب سهل عبر واتساب</span></li></ul></div>
      <div id="mxHero">${heroVisualHtml()}</div></div></section>`;
  }

  function catsHtml(){
    const arrow = ic('arrow', 16, '', 'mx-flip');
    return `<section class="mx-sec"><div class="mx-in">
      <h2>اختر تخصصك</h2><p class="sub">كتالوجان، كل واحد مبني على ما يحتاجه برنامجك فعلاً.</p>
      <div class="mx-cats">
        <button class="mx-cat navy" data-act="cat" data-id="nursing"><div class="tx"><h3>التمريض</h3><p>كل ما تحتاجه للجولات السريرية والمهارات ومختبرات التدريب.</p><ul><li>سماعات طبية</li><li>مطارق الأعصاب</li><li>أقلام الفحص</li><li>أجهزة ضغط الدم</li></ul></div>
          <span class="go">تسوّق التمريض ${arrow}</span>
          <div class="art"><div class="a a1">${art('steth')}</div><div class="a a2">${art('penlight')}</div><div class="a a3">${art('gauge')}</div></div></button>
        <button class="mx-cat tint" data-act="cat" data-id="dentistry"><div class="tx"><h3>طب الأسنان</h3><p>أدوات تشخيصية وترميمية وخلع قابلة للتعقيم لمختبرات ما قبل السريري.</p><ul><li>أطقم الفحص</li><li>مرايا ومجسّات</li><li>أدوات الحشوات</li><li>أدوات تدريب الخلع</li></ul></div>
          <span class="go">تسوّق الأسنان ${arrow}</span>
          <div class="art"><div class="a a1">${art('mirror')}</div><div class="a a2">${art('hammer')}</div><div class="a a3">${art('kit')}</div></div></button>
      </div>
      <button class="mx-strip" data-act="cat" data-id="bundles"><span><b>بداية سنة سريرية جديدة؟</b><br><small>باقات البداية تجمع أدواتك الأساسية في طلب واحد.</small></span><span class="go">شاهد الباقات ${arrow}</span></button>
    </div></section>`;
  }

  function list(){
    const admin = isAdminSession();
    return S.items.filter(p => (admin || p.active !== false) &&
      (S.tab === 'all' || (S.tab === 'wish' ? wish.has(p.id) : p.category === S.tab)));
  }
  function tabsHtml(){
    const T = [['all', 'الكل'], ...CATS.map(c => [c.id, c.name])];
    if(wish.size) T.push(['wish', '❤ المفضّلة']);
    return T.map(([k, l]) => `<button class="${S.tab === k ? 'on' : ''}" data-act="tab" data-id="${k}" aria-pressed="${S.tab === k}">${l}</button>`).join('');
  }
  function cardHtml(p){
    const admin = isAdminSession(), out = p.in_stock === false, w = wish.has(p.id), img = imgOf(p);
    return `<li class="mx-card ${p.active === false ? 'hid' : ''}">
      <div class="mx-tile">
        ${img ? `<img class="pimg" src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : `<div class="art7">${art(artKey(p))}</div>`}
        ${p.badge ? `<span class="mx-tag ${/top|rated|الأعلى/i.test(p.badge) ? 'dark' : ''}">${esc(p.badge)}</span>` : ''}
        ${out ? '<span class="mx-tag out">نفدت الكمية</span>' : ''}
        <div class="mx-side">
          <button class="${w ? 'on' : ''}" data-act="wish" data-id="${esc(p.id)}" aria-pressed="${w}" aria-label="مفضّلة">${ic('heart', 16, w ? 'fill="currentColor"' : '')}</button>
          <button data-act="qv" data-id="${esc(p.id)}" aria-label="عرض سريع">${ic('eye', 16)}</button>
        </div>
      </div>
      <div class="mx-cb"><h3>${esc(p.title)}</h3>${p.description ? `<p class="d">${esc(p.description)}</p>` : ''}
        <div class="mx-foot"><p class="mx-price">${fmt(p.price)}${p.old_price ? ` <s>${fmt(p.old_price)}</s>` : ''}</p>
          <button class="mx-btn teal sm ${out ? 'off' : ''}" data-act="add" data-id="${esc(p.id)}">أضف للسلة</button></div>
        ${admin ? `<div class="mx-arow"><button data-act="edit" data-id="${esc(p.id)}">✏️ تعديل</button><button data-act="tog" data-id="${esc(p.id)}">${p.active === false ? '👁️ إظهار' : '🙈 إخفاء'}</button><button class="del" data-act="del" data-id="${esc(p.id)}">🗑️</button></div>` : ''}
      </div></li>`;
  }
  function gridHtml(){
    if(S.error) return `<li class="mx-empty"><h3>⚠️ ${esc(S.error)}</h3><button class="mx-btn teal sm" data-act="retry">إعادة المحاولة</button></li>`;
    if(!S.loaded) return `<li class="mx-empty"><span class="loading-dot"></span> جارِ تحميل المنتجات...</li>`;
    const L = list();
    if(!L.length) return `<li class="mx-empty"><h3>لا توجد منتجات هنا بعد</h3><p>${S.items.length ? 'جرّب تصنيفًا آخر.' : 'ترقّبوا منتجاتنا قريبًا!'}</p></li>`;
    return L.map(cardHtml).join('');
  }
  function featHtml(){
    return `<section class="mx-feat" id="mxFeat"><div class="mx-in">
      <div class="mx-fh"><div class="mx-sec" style="padding:0"><h2>الأكثر طلبًا هذا الفصل</h2><p class="sub">الأدوات التي يعيد الطلاب شراءها وينصحون بها.</p></div>
      <div class="mx-tabs" id="mxTabs" role="group" aria-label="تصفية المنتجات">${tabsHtml()}</div></div>
      <ul class="mx-grid" id="mxGrid">${gridHtml()}</ul></div></section>`;
  }

  function drawerHtml(){
    const L = cartLines();
    const head = `<div class="mx-dh"><h2>سلتك (${cartCount()})</h2><button class="mx-ib" data-act="close" aria-label="إغلاق">${ic('x', 20)}</button></div>`;
    if(!L.length) return head + `<div class="mx-dempty"><p style="font-weight:700;color:var(--m-fg)">سلتك فارغة</p><p class="mx-muted" style="font-size:.9rem">أضف منتجًا أو باقة لتظهر هنا.</p><button class="mx-btn teal sm" data-act="close">تصفّح المنتجات</button></div>`;
    const msg = `مرحبًا MEDIX STORE 👋\nبدي أطلب:\n` + L.map(x => `• ${x.p.title} × ${x.q} — ${fmt(Number(x.p.price) * x.q)}`).join('\n') + `\n\nالمجموع: ${fmt(cartTotal())}`;
    return head + `<ul class="mx-dl">${L.map(({ p, q }) => `<li>
        <div class="th">${imgOf(p) ? `<img src="${esc(imgOf(p))}" alt="">` : `<div class="a">${art(artKey(p))}</div>`}</div>
        <div class="in"><b>${esc(p.title)}</b><span class="mx-muted" style="font-size:.88rem">${fmt(p.price)}</span><br>
          <div class="mx-qty"><button data-act="dec" data-id="${esc(p.id)}" aria-label="إنقاص">${ic('minus', 14)}</button><span>${q}</span><button data-act="inc" data-id="${esc(p.id)}" aria-label="زيادة">${ic('plus', 14)}</button></div></div>
        <b style="font-size:.9rem;color:var(--m-fg)">${fmt(Number(p.price) * q)}</b></li>`).join('')}</ul>
      <div class="mx-df"><div class="row"><span>المجموع</span><span>${fmt(cartTotal())}</span></div>
        <small>التوصيل والخصومات يتم الاتفاق عليها مع فريقنا عبر واتساب.</small>
        <a class="mx-btn" href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('wa', 18)} إتمام الطلب عبر واتساب</a></div>`;
  }
  function qvHtml(){
    const p = by(S.qv); if(!p) return '';
    const inc = String(p.includes || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8);
    const out = p.in_stock === false;
    return `<div class="bg" data-act="close"></div><div class="mx-qvb" role="dialog" aria-modal="true" aria-label="${esc(p.title)}">
      <button class="xx" data-act="close" aria-label="إغلاق">${ic('x', 18)}</button>
      <div class="vis">${imgOf(p) ? `<img src="${esc(imgOf(p))}" alt="${esc(p.title)}">` : `<div class="a">${art(artKey(p))}</div>`}</div>
      <div class="inf"><div>${catName(p.category) ? `<span class="mx-muted" style="font-size:.8rem;font-weight:700">${esc(catName(p.category))}</span>` : ''}<h3 style="font-size:1.3rem;padding-inline-end:2rem">${esc(p.title)}</h3></div>
        ${p.description ? `<p class="mx-muted" style="font-size:.92rem">${esc(p.description)}</p>` : ''}
        ${inc.length ? `<ul class="mx-incl">${inc.map(x => `<li>${ic('check', 15)}${esc(x)}</li>`).join('')}</ul>` : ''}
        <div class="mx-foot" style="margin-top:auto"><p class="mx-price" style="font-size:1.5rem">${fmt(p.price)}${p.old_price ? ` <s>${fmt(p.old_price)}</s>` : ''}</p>
          <button class="mx-btn teal ${out ? 'off' : ''}" data-act="add" data-id="${esc(p.id)}">${out ? 'غير متوفر' : 'أضف للسلة'}</button></div></div></div>`;
  }

  function page(){
    injectCss();
    if(!allowed()){
      return `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>هذه الصفحة غير متاحة حاليًا</h3><p><a href="/home" style="color:var(--teal);font-weight:800;">العودة للرئيسية</a></p></div></div></section>`;
    }
    if(!S.loaded && !S.loading && !S.error) load();
    const open = S.cartOpen, qvOpen = !!by(S.qv);
    return `<div class="mx-root" id="mxRoot">
      ${adminBarHtml()}${headHtml()}
      <main>${heroHtml()}${catsHtml()}${featHtml()}</main>
      <div class="mx-fin"><div class="mx-in"><span>© ${new Date().getFullYear()} MEDIX Store — جزء من منصة MEDORA</span><a href="/home" style="font-weight:700;color:var(--m-tt)">العودة إلى MEDORA</a></div></div>
      <div class="mx-ov" id="mxOv" data-act="close" ${open || qvOpen ? '' : 'hidden'}></div>
      <aside class="mx-drawer ${open ? 'open' : ''}" id="mxDrawer" role="dialog" aria-modal="true" aria-label="السلة" ${open ? '' : 'inert'}>${drawerHtml()}</aside>
      <div class="mx-qv" id="mxQv" ${qvOpen ? '' : 'hidden'}>${qvOpen ? qvHtml() : ''}</div>
    </div>`;
  }

  /* ---------- تحديثات جزئية (بدون إعادة رسم الصفحة كلها) ---------- */
  function updActs(){ const e = $('#mxActs'); if(e) e.innerHTML = actsHtml(); }
  function updGrid(){ const t = $('#mxTabs'), g = $('#mxGrid'); if(t) t.innerHTML = tabsHtml(); if(g) g.innerHTML = gridHtml(); }
  function updHero(){ const h = $('#mxHero'); if(h){ h.innerHTML = heroVisualHtml(); bindTilt(); } }
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
  function closeAll(){ S.cartOpen = false; S.qv = null; updOverlays(); document.body.style.overflow = ''; }
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
      case 'add': { const p = by(id); if(!p || p.in_stock === false) return; cart[id] = (cart[id] || 0) + 1; saveCart(); S.qv = null; S.cartOpen = true; updActs(); updOverlays(); break; }
      case 'inc': cart[id] = (cart[id] || 0) + 1; saveCart(); updActs(); updOverlays(); break;
      case 'dec': cart[id] = (cart[id] || 0) - 1; if(cart[id] <= 0) delete cart[id]; saveCart(); updActs(); updOverlays(); break;
      case 'wish': wish.has(id) ? wish.delete(id) : wish.add(id); saveWish(); if(S.tab === 'wish' && !wish.size) S.tab = 'all'; updActs(); updGrid(); break;
      case 'qv': { S.qv = id; const q = $('#mxQ'); if(q) q.value = ''; S.q = ''; if(sl) sl.hidden = true; updOverlays(); break; }
      case 'tab': S.tab = id; updGrid(); break;
      case 'cat': S.tab = id; closeAll(); updGrid(); scrollTo('mxFeat'); break;
      case 'wishnav': if(wish.size){ S.tab = 'wish'; updGrid(); scrollTo('mxFeat'); } break;
      case 'slide': S.slide = +id; updHero(); break;
      case 'prev': { const n = slides().length || 1; S.slide = (S.slide + n - 1) % n; updHero(); break; }
      case 'next': { const n = slides().length || 1; S.slide = (S.slide + 1) % n; updHero(); break; }
      case 'cart': S.cartOpen = true; updOverlays(); break;
      case 'close': closeAll(); break;
      case 'go': scrollTo(id); break;
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
    if(e.target.id !== 'mxQ') return;
    S.q = e.target.value;
    const t = S.q.trim().toLowerCase(), sl = $('#mxSl'); if(!sl) return;
    const res = t ? S.items.filter(p => (isAdminSession() || p.active !== false) && ((p.title || '').toLowerCase().includes(t) || (p.description || '').toLowerCase().includes(t) || catName(p.category).includes(t))).slice(0, 5) : [];
    sl.hidden = !t;
    sl.innerHTML = res.length ? res.map(p => `<button data-act="qv" data-id="${esc(p.id)}"><span>${esc(p.title)}</span><span class="mx-muted" style="font-size:.78rem">${esc(catName(p.category))}</span></button>`).join('') : '<p>لا نتائج. جرّب "سماعة" أو "أسنان".</p>';
  }
  function onKey(e){
    if(e.target.id === 'mxQ' && e.key === 'Enter'){ const b = document.querySelector('#mxSl button'); if(b){ e.preventDefault(); b.click(); } }
  }
  function onChange(e){
    if(e.target.id !== 'mxVis') return;
    state.storeSettings = Object.assign({}, state.storeSettings, { visible: e.target.checked });
    setData('store_settings', state.storeSettings, true).then(() => render());
  }
  let escBound = false;
  function bind(){
    const app = document.getElementById('app');
    app.onclick = onClick; app.oninput = onInput; app.onkeydown = onKey; app.onchange = onChange;
    if(!escBound){ escBound = true; document.addEventListener('keydown', e => { if(e.key === 'Escape' && currentRoute() === 'store' && (S.cartOpen || S.qv)) closeAll(); }); }
    document.body.style.overflow = (S.cartOpen || by(S.qv)) ? 'hidden' : '';
    bindTilt();
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
        <div class="field"><label>الوصف تحت العنوان</label><textarea name="sub" rows="4" maxlength="300">${esc(cfg('sub'))}</textarea></div>
        <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small">حفظ</button></div>
      </form>`);
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('mxTxt').onsubmit = async e => {
      e.preventDefault(); const fd = new FormData(e.target);
      state.storeSettings = Object.assign({}, state.storeSettings, { headline: (fd.get('headline') || '').trim() || DEFAULTS.headline, sub: (fd.get('sub') || '').trim() || DEFAULTS.sub });
      await setData('store_settings', state.storeSettings, true); closeModal(); render();
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
          <div class="field" style="flex:1"><label>التصنيف</label><select name="category">${CATS.map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
          <div class="field" style="flex:1"><label>شارة على المنتج (اختياري)</label><input type="text" name="badge" maxlength="24" placeholder="مثال: الأكثر طلبًا" value="${esc(p.badge)}"></div>
        </div>
        <div class="field"><label>صورة المنتج (ارفع صورة)</label><input type="file" name="imageFile" accept="image/*"></div>
        <div class="field"><label>أو رابط صورة (https)</label><input type="url" name="image_url" style="direction:ltr" value="${esc(p.image_url)}"></div>
        <div class="field"><label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" name="in_stock" style="width:auto" ${p.in_stock === false ? '' : 'checked'}> متوفّر بالمخزون</label></div>
        <div class="field"><label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" name="featured" style="width:auto" ${p.featured ? 'checked' : ''}> مميّز (يظهر بالسلايدر أعلى الصفحة)</label></div>
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
          featured: fd.get('featured') === 'on', active: fd.get('active') === 'on',
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

  window.MedixStore = { page, bind };
})();
