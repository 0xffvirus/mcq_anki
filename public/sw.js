const CACHE_VERSION = 'v1'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const MAX_CACHE_AGE_MS = 4 * 60 * 60 * 1000 // 4 hours

// Static asset extensions — safe to serve from cache
const STATIC_EXTENSIONS = /\.(js|css|woff2?|png|jpg|jpeg|svg|ico|webp)$/

self.addEventListener('install', () => {
  // Activate immediately without waiting for old SW to stop
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Take control of all open clients immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Delete old cache versions
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k => k !== STATIC_CACHE)
            .map(k => caches.delete(k))
        )
      ),
    ])
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Static assets — cache-first (safe because Next.js hashes filenames)
  if (STATIC_EXTENSIONS.test(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML navigation and API routes — network-first
  event.respondWith(networkFirst(request))
})

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    // Only cache successful HTML responses briefly
    if (response.ok && request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Offline fallback — serve cached version if available
    const cached = await caches.match(request)
    if (cached) return cached
    // Last resort: return cached root page for navigation requests
    if (request.mode === 'navigate') {
      const root = await caches.match('/')
      if (root) return root
    }
    return new Response('Offline', { status: 503 })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    // Check cache age — refresh in background if older than 4 hours
    const dateHeader = cached.headers.get('date')
    if (dateHeader) {
      const age = Date.now() - new Date(dateHeader).getTime()
      if (age > MAX_CACHE_AGE_MS) {
        // Refresh in background, return cached now
        fetch(request).then(async response => {
          if (response.ok) {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, response)
          }
        }).catch(() => {})
      }
    }
    return cached
  }
  // Not cached — fetch and store
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, response.clone())
  }
  return response
}
