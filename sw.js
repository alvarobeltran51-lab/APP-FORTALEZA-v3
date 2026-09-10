// Service worker de la App Banco Fortaleza
// Cachea el archivo principal y los íconos para que la app funcione sin internet
// después de la primera visita.

var CACHE_NAME = 'app-fortaleza-v1';
var ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(nombres){
      return Promise.all(
        nombres.filter(function(nombre){ return nombre !== CACHE_NAME; })
               .map(function(nombre){ return caches.delete(nombre); })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: primero red, si falla usa la copia guardada (así siempre tienes
// la versión más reciente cuando hay internet, y la app sigue abriendo sin internet)
self.addEventListener('fetch', function(event){
  event.respondWith(
    fetch(event.request).then(function(respuesta){
      var copia = respuesta.clone();
      caches.open(CACHE_NAME).then(function(cache){
        cache.put(event.request, copia);
      });
      return respuesta;
    }).catch(function(){
      return caches.match(event.request).then(function(match){
        return match || caches.match('./index.html');
      });
    })
  );
});
