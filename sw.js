/* RS Movies service worker: पहले इंटरनेट से लाओ (ताकि अपडेट तुरंत दिखें), न मिले तो सेव की हुई कॉपी */
var CACHE = 'rs-movies-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== self.location.origin) return;   // Firebase / TMDB / YouTube को हाथ नहीं लगाना
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && res.ok) { var c = res.clone(); caches.open(CACHE).then(function (ch) { ch.put(r, c); }); }
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) { return m || caches.match('./') || caches.match('index.html'); });
    })
  );
});
