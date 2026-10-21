/* =========================================================
   MEDIX STORE — وحدة المتجر (ملف مستقل عن app.js)
   - بيتحمّل كسوليًا فقط لما حدا يفتح /store (ما بيأثر على سرعة باقي الموقع).
   - المنتجات بجدول Supabase مستقل: store_products   (شوف store-setup.sql)
   - إظهار/إخفاء المتجر عن الطلاب: medora_data → المفتاح store_settings { visible: true|false }
   - بيستخدم فقط هالدوال/المتغيرات العامة من app.js:
       supabaseClient, state, setData, escapeHtml, isAdminSession,
       openModal, closeModal, render, currentRoute
   ========================================================= */
(function(){
  'use strict';

  const WA_NUMBER = '962781492144';              // رقم واتساب استقبال الطلبات
  const LOGO_URL  = '/medix-logo.jpg';           // ارفعه لجذر الموقع (أو غيّر الرابط لرابط Supabase)
  const TABLE     = 'store_products';
  const BUCKET    = 'store';                     // Bucket لصور المنتجات (شوف store-setup.sql)
  const CURRENCY  = 'د.أ';

  const CATS = [
    { id:'all',       name:'الكل' },
    { id:'nursing',   name:'التمريض' },
    { id:'dentistry', name:'طب الأسنان' },
    { id:'general',   name:'عام' },
  ];
  const catName = id => (CATS.find(c => c.id === id) || {}).name || '';

  const S = { loaded:false, loading:false, error:'', items:[], cat:'all', q:'' };
  const esc = s => escapeHtml(String(s == null ? '' : s));
  const fmtPrice = n => {
    const v = Number(n);
    return isFinite(v) ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : '';
  };
  const safeUrl = u => (/^https:\/\//i.test(u || '') || (u || '').startsWith('/')) ? u : '';
  const allowed = () => isAdminSession() || !!(state.storeSettings && state.storeSettings.visible === true);

  /* ---------------- CSS (معزول بالبادئة mx-) ---------------- */
  function injectCss(){
    if(document.getElementById('mxStyles')) return;
    const st = document.createElement('style');
    st.id = 'mxStyles';
    st.textContent = `
    .mx-wrap{max-width:var(--content-width,1180px);margin:0 auto;padding:28px 20px 60px}
    .mx-hero{display:flex;align-items:center;gap:28px;background:#fff;border:1px solid var(--border);border-radius:22px;padding:22px 28px;margin-bottom:22px;box-shadow:0 6px 24px rgba(20,60,70,.07)}
    .mx-hero img{width:190px;height:190px;object-fit:contain;flex:none}
    .mx-hero h1{font-size:28px;font-weight:800;color:#2b3a4a;margin:0 0 8px}
    .mx-hero p{color:#5b6b78;font-size:15px;line-height:1.8;margin:0}
    .mx-admin-bar{display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between;background:var(--card);border:1.5px dashed var(--teal);border-radius:14px;padding:12px 16px;margin-bottom:18px}
    .mx-switch{display:flex;align-items:center;gap:10px;cursor:pointer;font-weight:700;color:var(--ink)}
    .mx-switch input{width:auto;transform:scale(1.25)}
    .mx-state{font-size:13px;font-weight:800;padding:3px 10px;border-radius:99px}
    .mx-state.on{background:rgba(30,160,100,.14);color:#12875a}
    .mx-state.off{background:rgba(220,60,60,.14);color:#c0392b}
    .mx-tools{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px}
    .mx-chips{display:flex;gap:8px;flex-wrap:wrap}
    .mx-chip{border:1.5px solid var(--border);background:var(--card);color:var(--ink);padding:8px 18px;border-radius:99px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}
    .mx-chip.active{background:var(--teal);border-color:var(--teal);color:#fff}
    .mx-search{flex:1;min-width:200px;max-width:340px;margin-inline-start:auto;padding:10px 16px;border:1.5px solid var(--border);border-radius:99px;background:var(--card);color:var(--ink);font-family:inherit;font-size:14px}
    .mx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}
    .mx-card{background:var(--card);border:1px solid var(--border);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:transform .15s,box-shadow .15s;position:relative}
    .mx-card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(20,60,70,.12)}
    .mx-card.inactive{opacity:.55}
    .mx-img{aspect-ratio:1/1;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:54px;overflow:hidden}
    .mx-img img{width:100%;height:100%;object-fit:cover}
    .mx-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:8px;flex:1}
    .mx-tag{align-self:flex-start;font-size:12px;font-weight:800;color:var(--teal);background:var(--teal-light,rgba(23,122,140,.1));padding:3px 10px;border-radius:99px}
    .mx-title{font-size:16px;font-weight:800;color:var(--ink);line-height:1.5;margin:0}
    .mx-desc{font-size:13.5px;color:var(--muted);line-height:1.7;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .mx-price{margin-top:auto;display:flex;align-items:baseline;gap:8px}
    .mx-price b{font-size:20px;color:var(--teal);font-weight:800}
    .mx-price s{font-size:13px;color:var(--muted)}
    .mx-order{display:flex;justify-content:center;align-items:center;gap:6px;background:#25d366;color:#fff!important;text-decoration:none;font-weight:800;padding:10px;border-radius:12px;font-size:14px}
    .mx-order.disabled{background:var(--border);color:var(--muted)!important;pointer-events:none}
    .mx-badge{position:absolute;top:10px;inset-inline-start:10px;background:#c0392b;color:#fff;font-size:12px;font-weight:800;padding:4px 10px;border-radius:99px}
    .mx-badge.hid{background:#6b7785;top:40px}
    .mx-admin-row{display:flex;gap:6px;flex-wrap:wrap}
    .mx-admin-row button{flex:1;border:1px solid var(--border);background:var(--bg);color:var(--ink);border-radius:9px;padding:6px 8px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}
    .mx-admin-row button.del{color:#c0392b}
    .mx-empty{text-align:center;padding:60px 20px;color:var(--muted);grid-column:1/-1}
    .mx-empty h3{color:var(--ink);margin-bottom:6px}
    @media(max-width:640px){
      .mx-hero{flex-direction:column;text-align:center;padding:18px}
      .mx-hero img{width:150px;height:150px}
      .mx-grid{grid-template-columns:repeat(2,1fr);gap:12px}
      .mx-search{max-width:none;margin:0;flex-basis:100%}
      .mx-title{font-size:14.5px}.mx-price b{font-size:17px}
    }`;
    document.head.appendChild(st);
  }

  /* ---------------- تحميل المنتجات ---------------- */
  async function load(force){
    if(S.loading || (S.loaded && !force)) return;
    S.loading = true; S.error = '';
    try{
      const { data, error } = await supabaseClient.from(TABLE).select('*').order('created_at', { ascending:false });
      if(error) throw error;
      S.items = data || []; S.loaded = true;
    }catch(e){
      console.error('MEDIX STORE load failed', e);
      S.error = 'تعذّر تحميل المنتجات حاليًا، حاول مرة ثانية.';
    }
    S.loading = false;
    if(currentRoute() === 'store') render();
  }

  /* ---------------- بناء الصفحة ---------------- */
  function visibleItems(){
    const admin = isAdminSession();
    const q = S.q.trim().toLowerCase();
    return S.items.filter(p =>
      (admin || p.active !== false) &&
      (S.cat === 'all' || p.category === S.cat) &&
      (!q || (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
    );
  }

  function orderLink(p){
    const msg = `مرحبًا MEDIX STORE 👋\nبدي أطلب المنتج: ${p.title} (${fmtPrice(p.price)} ${CURRENCY})`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  function cardHtml(p){
    const admin = isAdminSession();
    const out = p.in_stock === false;
    const img = safeUrl(p.image_url);
    return `
    <div class="mx-card ${p.active === false ? 'inactive' : ''}">
      ${out ? '<span class="mx-badge">نفدت الكمية</span>' : ''}
      ${admin && p.active === false ? '<span class="mx-badge hid">مخفي</span>' : ''}
      <div class="mx-img">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : '🛍️'}</div>
      <div class="mx-body">
        ${p.category && catName(p.category) ? `<span class="mx-tag">${esc(catName(p.category))}</span>` : ''}
        <h3 class="mx-title">${esc(p.title)}</h3>
        ${p.description ? `<p class="mx-desc">${esc(p.description)}</p>` : ''}
        <div class="mx-price"><b>${fmtPrice(p.price)} ${CURRENCY}</b>${p.old_price ? `<s>${fmtPrice(p.old_price)} ${CURRENCY}</s>` : ''}</div>
        <a class="mx-order ${out ? 'disabled' : ''}" href="${out ? '#' : esc(orderLink(p))}" target="_blank" rel="noopener">${out ? 'غير متوفر حاليًا' : '💬 اطلب عبر واتساب'}</a>
        ${admin ? `<div class="mx-admin-row">
          <button data-mx-edit="${esc(p.id)}">✏️ تعديل</button>
          <button data-mx-toggle="${esc(p.id)}">${p.active === false ? '👁️ إظهار' : '🙈 إخفاء'}</button>
          <button class="del" data-mx-del="${esc(p.id)}">🗑️</button>
        </div>` : ''}
      </div>
    </div>`;
  }

  function gridHtml(){
    if(S.error) return `<div class="mx-empty"><h3>⚠️ ${esc(S.error)}</h3><button class="btn teal solid small" id="mxRetry">إعادة المحاولة</button></div>`;
    if(!S.loaded) return `<div class="mx-empty"><span class="loading-dot"></span> جارِ تحميل المنتجات...</div>`;
    const items = visibleItems();
    if(!items.length) return `<div class="mx-empty"><h3>لا توجد منتجات هنا بعد</h3><p>${S.items.length ? 'جرّب تغيير التصنيف أو البحث.' : 'ترقّبوا منتجاتنا قريبًا!'}</p></div>`;
    return items.map(cardHtml).join('');
  }

  function page(){
    injectCss();
    if(!allowed()){
      return `<section class="section"><div class="wizard-wrap"><div class="empty-state"><h3>هذه الصفحة غير متاحة حاليًا</h3><p><a href="/home" style="color:var(--teal);font-weight:800;">العودة للرئيسية</a></p></div></div></section>`;
    }
    if(!S.loaded && !S.loading && !S.error) load();
    const admin = isAdminSession();
    const on = !!(state.storeSettings && state.storeSettings.visible);
    return `
    <div class="mx-wrap">
      <div class="mx-hero">
        <img src="${esc(LOGO_URL)}" alt="MEDIX STORE">
        <div>
          <h1>MEDIX STORE</h1>
          <p>متجرك لكل ما يحتاجه طالب التمريض وطب الأسنان: أدوات، مستلزمات، وأكثر — بأسعار مناسبة وتوصيل سهل. اختر المنتج واطلبه مباشرة عبر واتساب.</p>
        </div>
      </div>

      ${admin ? `<div class="mx-admin-bar">
        <label class="mx-switch"><input type="checkbox" id="mxVisible" ${on ? 'checked' : ''}> إظهار المتجر للطلاب والزوّار
          <span class="mx-state ${on ? 'on' : 'off'}">${on ? 'ظاهر للجميع' : 'مخفي (للمشرف فقط)'}</span></label>
        <button class="btn teal solid small" id="mxAdd">＋ إضافة منتج</button>
      </div>` : ''}

      <div class="mx-tools">
        <div class="mx-chips">${CATS.map(c => `<button class="mx-chip ${S.cat === c.id ? 'active' : ''}" data-mx-cat="${c.id}">${c.name}</button>`).join('')}</div>
        <input class="mx-search" id="mxSearch" type="search" placeholder="ابحث عن منتج..." value="${esc(S.q)}">
      </div>
      <div class="mx-grid" id="mxGrid">${gridHtml()}</div>
    </div>`;
  }

  /* ---------------- الأحداث ---------------- */
  function findItem(id){ return S.items.find(p => String(p.id) === String(id)); }

  function bindGrid(){
    const app = document.getElementById('app');
    const retry = app.querySelector('#mxRetry');
    if(retry) retry.onclick = () => { S.error = ''; S.loaded = false; render(); };
    app.querySelectorAll('[data-mx-edit]').forEach(b => b.onclick = () => modalProduct(findItem(b.dataset.mxEdit)));
    app.querySelectorAll('[data-mx-toggle]').forEach(b => b.onclick = async () => {
      const p = findItem(b.dataset.mxToggle); if(!p) return;
      const next = p.active === false;
      const { error } = await supabaseClient.from(TABLE).update({ active: next }).eq('id', p.id);
      if(error){ alert('تعذّر التحديث: ' + error.message); return; }
      p.active = next; render();
    });
    app.querySelectorAll('[data-mx-del]').forEach(b => b.onclick = async () => {
      const p = findItem(b.dataset.mxDel); if(!p) return;
      if(!confirm(`حذف المنتج "${p.title}" نهائيًا؟`)) return;
      const { error } = await supabaseClient.from(TABLE).delete().eq('id', p.id);
      if(error){ alert('تعذّر الحذف: ' + error.message); return; }
      S.items = S.items.filter(x => x.id !== p.id); render();
    });
  }

  function bind(){
    const app = document.getElementById('app');
    app.querySelectorAll('[data-mx-cat]').forEach(b => b.onclick = () => { S.cat = b.dataset.mxCat; render(); });
    const search = app.querySelector('#mxSearch');
    if(search) search.oninput = () => {
      S.q = search.value;
      document.getElementById('mxGrid').innerHTML = gridHtml();
      bindGrid();
    };
    const vis = app.querySelector('#mxVisible');
    if(vis) vis.onchange = async () => {
      state.storeSettings = Object.assign({}, state.storeSettings, { visible: vis.checked });
      await setData('store_settings', state.storeSettings, true);
      render();
    };
    const add = app.querySelector('#mxAdd');
    if(add) add.onclick = () => modalProduct(null);
    bindGrid();
  }

  /* ---------------- نافذة إضافة/تعديل منتج (للمشرف) ---------------- */
  function compressImage(file, max){
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve(b) : reject(new Error('فشل ضغط الصورة')), 'image/jpeg', 0.85);
      };
      img.onerror = () => reject(new Error('الملف ليس صورة صالحة'));
      img.src = url;
    });
  }

  function modalProduct(p){
    if(!isAdminSession()) return;
    const isEdit = !!p; p = p || {};
    openModal(`
      <h3>${isEdit ? '✏️ تعديل منتج' : '🛍️ إضافة منتج جديد'}</h3>
      <form id="mxForm">
        <div class="field"><label>اسم المنتج</label><input type="text" name="title" required maxlength="120" value="${esc(p.title)}"></div>
        <div class="field"><label>الوصف</label><textarea name="description" rows="3" maxlength="600">${esc(p.description)}</textarea></div>
        <div style="display:flex;gap:10px;">
          <div class="field" style="flex:1"><label>السعر (${CURRENCY})</label><input type="number" name="price" min="0" step="0.01" required value="${esc(p.price)}"></div>
          <div class="field" style="flex:1"><label>السعر قبل الخصم (اختياري)</label><input type="number" name="old_price" min="0" step="0.01" value="${esc(p.old_price)}"></div>
        </div>
        <div class="field"><label>التصنيف</label>
          <select name="category">${CATS.filter(c => c.id !== 'all').map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
        </div>
        <div class="field"><label>صورة المنتج (ارفع صورة)</label><input type="file" name="imageFile" accept="image/*"></div>
        <div class="field"><label>أو رابط صورة (https)</label><input type="url" name="image_url" style="direction:ltr" value="${esc(p.image_url)}"></div>
        <div class="field"><label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" name="in_stock" style="width:auto" ${p.in_stock === false ? '' : 'checked'}> متوفّر بالمخزون</label></div>
        <div class="field"><label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" name="active" style="width:auto" ${p.active === false ? '' : 'checked'}> ظاهر للطلاب</label></div>
        <div id="mxMsg"></div>
        <div class="modal-actions"><button type="button" class="btn small" id="cancelModal">إلغاء</button><button type="submit" class="btn teal solid small" id="mxSave">حفظ</button></div>
      </form>`);
    document.getElementById('cancelModal').onclick = closeModal;
    document.getElementById('mxForm').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), msg = document.getElementById('mxMsg'), btn = document.getElementById('mxSave');
      btn.disabled = true; btn.textContent = 'جارِ الحفظ...'; msg.innerHTML = '';
      try{
        let imageUrl = (fd.get('image_url') || '').trim();
        if(imageUrl && !/^https:\/\//i.test(imageUrl)) throw new Error('رابط الصورة لازم يبدأ بـ https://');
        const file = fd.get('imageFile');
        if(file && file.size){
          const blob = await compressImage(file, 900);
          const path = `${(crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2))}.jpg`;
          const up = await supabaseClient.storage.from(BUCKET).upload(path, blob, { contentType:'image/jpeg', upsert:false });
          if(up.error) throw up.error;
          imageUrl = supabaseClient.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        }
        const row = {
          title: (fd.get('title') || '').trim(),
          description: (fd.get('description') || '').trim(),
          price: parseFloat(fd.get('price')),
          old_price: fd.get('old_price') ? parseFloat(fd.get('old_price')) : null,
          category: fd.get('category') || 'general',
          image_url: imageUrl || null,
          in_stock: fd.get('in_stock') === 'on',
          active: fd.get('active') === 'on',
        };
        if(!row.title || !isFinite(row.price)) throw new Error('اسم المنتج والسعر مطلوبان');
        if(isEdit){
          const { data, error } = await supabaseClient.from(TABLE).update(row).eq('id', p.id).select().single();
          if(error) throw error;
          S.items = S.items.map(x => x.id === p.id ? data : x);
        }else{
          const { data, error } = await supabaseClient.from(TABLE).insert(row).select().single();
          if(error) throw error;
          S.items.unshift(data);
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
