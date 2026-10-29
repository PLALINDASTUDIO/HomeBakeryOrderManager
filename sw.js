/* Home Bakery Order Manager — Plalinda Studio | isolated Index PWA service worker */
const CACHE_NAME='plalinda-home-bakery-index-pwa-v6-embedded-manifest';
const CACHE_PREFIX='plalinda-home-bakery-index-';
const SHELL=['./index.html'];
const INDEX_URL=new URL('./index.html',self.registration.scope);
const SCOPE_URL=new URL('./',self.registration.scope);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isIndexNavigation=request.mode==='navigate'&&(url.pathname===INDEX_URL.pathname||url.pathname===SCOPE_URL.pathname);
  if(isIndexNavigation){
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(INDEX_URL.href,copy)));}
      return response;
    }).catch(async()=> (await caches.match(INDEX_URL.href))||Response.error()));
    return;
  }
  // Other HTML pages (including the purchased Full Version and Marketing preview)
  // are NOT the Index. Never replace the offline Index with their HTML.
  if(request.mode==='navigate')return;
  if(!SHELL.some(path=>new URL(path,SCOPE_URL).pathname===url.pathname))return;
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));}
    return response;
  })));
});
