#!/usr/bin/env node
/**
 * سكربت تجهيز نسخ HTML جاهزة (prerender) لصفحات موقع MEDORA العامة.
 *
 * الفكرة: بدل مكتبة جاهزة (react-snap)، نفتح كل رابط عام بمتصفح حقيقي
 * (Puppeteer)، ننتظر لين Supabase يخلص تحميل البيانات وراوتر التطبيق يخلص
 * render()، ثم نحفظ الـ HTML النهائي كملف ثابت بنفس بنية الروابط
 * (مثلاً /courses -> courses/index.html).
 *
 * الملفات الناتجة بتنسخها فوق جذر الريبو قبل الـ commit. بما إنها بتحتوي
 * على نفس الـ <script> الأصلي، المتصفح لسا بيشغّل التطبيق بشكل طبيعي فوقها
 * (hydration) — بس أول ظهور للصفحة (اللي بتشوفه محركات البحث وبرامج الزحف)
 * بيكون فيه المحتوى الحقيقي جاهز بدل شاشة "جارِ التحميل...".
 *
 * شرط مسبق: لازم تضيف هالسطر بآخر IIFE اسمها boot() بملف index.html،
 * مباشرة بعد آخر "await render();":
 *
 *     window.__PRERENDER_READY__ = true;
 *
 * الاستخدام:
 *   cd prerender && npm install && npm run prerender
 */

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const { startServer } = require('./server');

const ROOT_DIR = __dirname; // جذر الريبو (وين index.html) - نفس مجلد هالسكربت
const OUT_DIR = path.join(__dirname, 'dist'); // مخرجات الصفحات الجاهزة
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SITE_URL = 'https://www.medora-academy.com'; // بدون / بالنهاية

// الصفحات الثابتة العامة (ما بتحتاج تسجيل دخول ومفيد تفهرسها بمحركات البحث)
const STATIC_ROUTES = ['home', 'courses', 'about', 'contact', 'privacy', 'terms'];

const READY_TIMEOUT = 20000;
const EXTRA_SETTLE_MS = 250;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForReady(page) {
  await page.waitForFunction('window.__PRERENDER_READY__ === true', {
    timeout: READY_TIMEOUT,
  });
  await sleep(EXTRA_SETTLE_MS);
}

async function getCourseIds(page) {
  // بيقرأ لستة الكورسات من حالة التطبيق بعد ما جهزها من Supabase
  return page.evaluate(() =>
    window.state && Array.isArray(window.state.courses)
      ? window.state.courses.map((c) => c.id)
      : []
  );
}

function routeToOutputFile(route) {
  if (route === 'home') return path.join(OUT_DIR, 'index.html');
  return path.join(OUT_DIR, route, 'index.html');
}

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    const target = route === 'home' ? '' : route;
    await page.goto(`${BASE_URL}/${target}`, { waitUntil: 'networkidle0' });
    await waitForReady(page);
    const html = await page.content();
    const outFile = routeToOutputFile(route);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf8');
    console.log(`✅ ${route.padEnd(24)} -> ${path.relative(ROOT_DIR, outFile)}`);
  } catch (err) {
    console.error(`❌ فشل تجهيز الرابط "${route}": ${err.message}`);
  } finally {
    await page.close();
  }
}

// أولوية/تكرار تحديث تقريبي لكل نوع رابط (مجرد إشارة لمحركات البحث، مش إلزامية)
function routeMeta(route){
  if(route === 'home') return { priority: '1.0', changefreq: 'daily' };
  if(route === 'courses') return { priority: '0.9', changefreq: 'daily' };
  if(route.startsWith('course/')) return { priority: '0.8', changefreq: 'weekly' };
  return { priority: '0.5', changefreq: 'monthly' };
}

function routeToUrl(route){
  const target = route === 'home' ? '' : route;
  return `${SITE_URL}/${target}`;
}

function generateSitemap(routes){
  const today = new Date().toISOString().slice(0, 10);
  const urlEntries = routes.map((route) => {
    const { priority, changefreq } = routeMeta(route);
    return [
      '  <url>',
      `    <loc>${routeToUrl(route)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlEntries,
    '</urlset>',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log(`✅ sitemap.xml${' '.repeat(20)} -> ${path.relative(ROOT_DIR, path.join(OUT_DIR, 'sitemap.xml'))} (${routes.length} رابط)`);
}

// الصفحات المحمية بتسجيل دخول/خاصة بمستخدم واحد لا تُفهرس ولا تُزحف
const DISALLOWED_ROUTES = [
  'login', 'admin-login', 'admin-analytics', 'admin-coupons',
  'my-courses', 'my-summaries', 'ai-summary', 'student-space', 'student-settings', 'bank',
];

function generateRobotsTxt(){
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...DISALLOWED_ROUTES.map((r) => `Disallow: /${r}`),
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), lines.join('\n'), 'utf8');
  console.log(`✅ robots.txt${' '.repeat(21)} -> ${path.relative(ROOT_DIR, path.join(OUT_DIR, 'robots.txt'))}`);
}

async function main() {
  if (!fs.existsSync(path.join(ROOT_DIR, 'index.html'))) {
    console.error('❌ ما لقيت index.html بنفس المجلد يلي فيه هالسكربت.');
    process.exit(1);
  }

  console.log('▶️  تشغيل سيرفر محلي لخدمة الملفات...');
  const server = await startServer(ROOT_DIR, PORT);

  console.log('▶️  فتح المتصفح...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // أول زيارة لصفحة الكورسات عشان نقرأ لستة الكورسات من Supabase
  // ونولّد رابط مستقل لكل كورس (course/<id>)
  const bootPage = await browser.newPage();
  await bootPage.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle0' });
  await waitForReady(bootPage);
  const courseIds = await getCourseIds(bootPage);
  await bootPage.close();
  console.log(`ℹ️  تم العثور على ${courseIds.length} كورس بقاعدة البيانات`);

  const routes = [...STATIC_ROUTES, ...courseIds.map((id) => `course/${id}`)];

  for (const route of routes) {
    await renderRoute(browser, route);
  }

  generateSitemap(routes);
  generateRobotsTxt();

  await browser.close();
  server.close();

  console.log(`\n🎉 خلصت! الملفات الجاهزة بمجلد: ${path.relative(ROOT_DIR, OUT_DIR)}`);
  console.log('انسخها فوق نفس المسارات بجذر الريبو (تدمج مع الموجود) قبل الـ commit/push.');
}

main().catch((err) => {
  console.error('❌ خطأ عام بالسكربت:', err);
  process.exit(1);
});
