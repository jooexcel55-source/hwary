// ================== Service Worker - رزق البنات ==================
// بيخلي الموقع يفتح ويشتغل من غير نت (يكاش الصفحة + الخطوط + مكتبة الإكسل + Firebase SDK)
// لو عندك كود تاني هنا (زي التعامل مع push notifications في الخلفية)، سيبه وضيف الكود ده معاه.

const CACHE_NAME = 'rb-shell-v1'; // لما تعمل تعديل مهم في الموقع، غيّر الرقم ده (v2, v3...) عشان يتحدث الكاش

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// مسارات النت الحية اللي ميصحش نكاشها أبدًا (اتصال قاعدة البيانات الفعلي)
const NEVER_CACHE_HOSTS = ['firebaseio.com', 'firebasedatabase.app', 'railway.app'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(CORE_ASSETS).catch(() => {}) // مايفشلش التثبيت لو ملف مش لاقيه
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (NEVER_CACHE_HOSTS.some((h) => url.hostname.includes(h))) return; // سيب اتصال Firebase الحي زي ما هو

  // فتح الصفحة نفسها: حاول النت الأول، ولو مفيش نت رجّع آخر نسخة محفوظة
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', clone));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // أي حاجة تانية (خطوط، مكتبة الإكسل، ملفات Firebase SDK، الأيقونات): كاش الأول، ولو مش موجود هات من النت واحفظه
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
