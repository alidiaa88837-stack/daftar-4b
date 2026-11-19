var CACHE = "class4b-v14";
var SHELL = ["./", "index.html", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// الشبكة أولاً (حتى يتحدث الموقع)، وإذا ما كو نت يطلع من الكاش
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match("index.html"); }); })
  );
});

// فتح الموقع عند الضغط على إشعار
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { if ("focus" in list[i]) return list[i].focus(); }
    if (clients.openWindow) return clients.openWindow("./");
  }));
});
