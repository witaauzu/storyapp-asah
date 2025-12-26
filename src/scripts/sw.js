import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// Runtime caching
registerRoute(
  ({ url }) => {
    return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
    cacheName: 'google-fonts',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ url, request }) => {
    return url.origin === 'https://story-api.dicoding.dev'
      && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'storyapp-api',
  }),
);

registerRoute(
  ({ url, request }) => {
    return url.origin === 'https://story-api.dicoding.dev'
      && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'storyapp-api-images',
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);

self.addEventListener('push', (event) => {
  console.log('Service worker received push');

  event.waitUntil((async () => {
    let title = 'StoryApp Notification';
    let options = {
      body: 'Ada cerita baru!',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/',
      },
    };

    if (event.data) {
      const payloadText = await event.data.text();
      console.log('Push payload:', payloadText);

      try {
        const payload = JSON.parse(payloadText);
        title = payload.title || title;
        options.body = payload.options?.body || options.body;
        options.data.url = payload.options?.data?.url || '/';
      } catch (e) {
        options.body = payloadText;
      }
    }

    await self.registration.showNotification(title, options);
  })());
});
