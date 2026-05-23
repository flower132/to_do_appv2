/* ================================================
   Service Worker — Product-Level Cache Strategy
   版本管理：每次发版时更新 CACHE_NAME 后缀即可
   例如 lily-todo-v2-2 → lily-todo-v2-3
   ================================================ */

const CACHE_NAME = 'lily-todo-v2-2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/pages.css',
  './css/pwa.css',
  './js/data.js',
  './js/pages.js',
  './js/router.js',
  './js/settings.js',
  './js/app.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS);
    }).catch(function () {
      // 即使个别资源缓存失败，也不阻塞 Service Worker 安装
      // 避免网络抖动导致整个 PWA 无法工作
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  // Navigation 请求：优先缓存，离线时回退到离线页面
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request).catch(function () {
          // 双重兜底：先尝试离线页面，再回退首页缓存
          return caches.match('./offline.html').then(function (offlinePage) {
            return offlinePage || caches.match('./index.html');
          });
        });
      })
    );
    return;
  }

  // 静态资源：Cache First，网络兜底
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(function () {
        // 图片类资源离线时返回 204 空响应，避免页面布局崩塌或白块
        if (event.request.destination === 'image') {
          return new Response('', { status: 204, statusText: 'No Content' });
        }
      });
    })
  );
});
