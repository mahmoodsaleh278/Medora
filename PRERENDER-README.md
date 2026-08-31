# Prerender لموقع MEDORA (بديل react-snap)

سكربت صغير بـ Puppeteer بيفتح كل صفحة عامة بمتصفح حقيقي، ينتظر Supabase
يخلص تحميل البيانات، ويحفظ الـ HTML الجاهز كملف ثابت — بدون أي build
pipeline، وبدون تغيير بنية مشروعك (ملف واحد + GitHub Pages).

كل الملفات هون تنحط **مباشرة بجذر الريبو**، جنب `index.html` و `404.html`،
من غير أي مجلد فرعي.

## 1) خطوة وحيدة بملف index.html

روح لآخر IIFE اسمها `boot()` (آخر الملف تقريبًا)، وضيف سطر واحد بعد آخر
`await render();` مباشرة:

```js
(async function boot(){
  ...
  await render();
  window.__PRERENDER_READY__ = true;   // <-- هاد السطر الجديد بس
})();
```

هاد السطر هو الإشارة يلي Puppeteer بيستنى عليها عشان يعرف إن الصفحة خلصت
تحميل بياناتها من Supabase وصار المحتوى جاهز (مش شاشة "جارِ التحميل...").

(النسخة يلي بعثتلك ياها قبل شوي من `index.html` فيها هالسطر مضاف مسبقًا.)

## 2) التثبيت

من جذر الريبو مباشرة:

```bash
npm install
```

## 3) التشغيل

```bash
npm run prerender
```

بيطلع لك مجلد `dist/` (بجذر الريبو) فيه:

```
dist/
  index.html              (نسخة الصفحة الرئيسية /home)
  courses/index.html      (/courses)
  about/index.html        (/about)
  contact/index.html      (/contact)
  privacy/index.html      (/privacy)
  terms/index.html        (/terms)
  course/<id>/index.html  (صفحة كل كورس، لكل الكورسات الموجودة بـ Supabase)
  sitemap.xml             (يتولّد تلقائيًا من نفس لستة الروابط، فيه كل كورس حاليًا)
  robots.txt               (يتولّد تلقائيًا، ونفس رابط sitemap.xml بداخله)
```

`sitemap.xml` و `robots.txt` بينكتبوا من جديد بكل مرة تشغّل فيها السكربت،
فما في داعي تعدّلهم يدويًا — أي كورس جديد ينضاف بـ Supabase بينضاف لهم
تلقائيًا بالمرة الجاية.

## 4) النشر

انسخ محتويات `dist/` فوق جذر الريبو (تدمج، ما بتحذف شي):

```bash
cp -r dist/. .
git add .
git commit -m "chore: prerendered pages"
git push
```

⚠️ ملاحظة مهمة: مجلد `dist/` نفسه ما لازم يترفع للريبو (هو مجرد ناتج
تشغيل مؤقت) — ضيفه لملف `.gitignore`:

```
dist/
node_modules/
```

GitHub Pages بيقدر يوصل مباشرة لملف زي `courses/index.html` لما حدا يفتح
`/courses` — بدون ما يمر أصلًا على `404.html` وحيلة إعادة التوجيه. يعني
الزحف (Google, Facebook, WhatsApp preview...) بيشوف المحتوى الحقيقي فورًا،
والمستخدم العادي أول ما تحمّل الصفحة، نفس الـ `<script>` الأصلي بيشتغل
ويجدد المحتوى بشكل طبيعي (نفس فكرة hydration).

الصفحات المحمية بتسجيل دخول (`login`, `my-courses`, `admin-*`, `bank`...)
ما تنعمل لها snapshot عمدًا — تضل تشتغل زي ما هي عبر `404.html` والراوتر
العادي.

## 5) تحديث تلقائي (اختياري)

فيه ملف جاهز `.github/workflows/prerender.yml` بيشغّل نفس السكربت يوميًا
(أو يدويًا من تبويب Actions) ويعمل commit تلقائي لأي تغيير — مفيد لأن
الكورسات ممكن تتغير أو تنضاف بـ Supabase بعد ما تعمل push أول مرة.

## ملاحظات

- إذا الريبو مش على دومين مستقل (يعني مشروع GitHub Pages بمسار فرعي زي
  `username.github.io/repo-name`)، لازم تتأكد إن كل الروابط الداخلية
  بالتطبيق (وبالـ redirect script بـ `404.html`) متوافقة مع هالمسار
  الفرعي — نفس الشي المطلوب أصلًا حتى بدون prerender.
- السكربت بياخذ لستة الكورسات من `window.state.courses` مباشرة (نفس
  البيانات يلي التطبيق بيحملها من Supabase)، فما في حاجة تكتب روابط
  الكورسات يدويًا ولا تكرر مفتاح الـ API.
