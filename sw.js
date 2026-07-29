/* Service Worker خاص بمنصة MEDORA
   الهدف: تخزين "هيكل" التطبيق (index.html وملفات الواجهة) محليًا حتى يعمل التثبيت
   على أندرويد وآيفون، ويفتح التطبيق حتى مع ضعف الاتصال. لا يخزّن أي طلبات
   خارجية (مثل Supabase أو الخطوط) حتى لا تتأثر بيانات الحساب أو الدورات. */

const CACHE_NAME = 'medora-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // نترك طلبات Supabase والخطوط والـ CDN تذهب للشبكة مباشرة

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
