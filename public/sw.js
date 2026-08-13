// Service worker que gestiona los eventos de instalación y las interacciones con notificaciones.
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

  // Al pulsar una notificación, vuelve a la sesión correspondiente o abre la aplicación.
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const url = notification.data ? notification.data.url : '/';

  notification.close();

  if (action === 'skip') {
    // Just close the notification, do nothing else.
    console.log('Notification skipped.');
  } else {
    // This is the 'view' action or a click on the notification body
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If a window for this PWA is already open, focus it
        for (const client of clientList) {
          // Check if the client is a window and has the focus method
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, options, timestamp } = event.data.payload;
    
    // Ensure options are correctly formed for the service worker context
    const swOptions = {
        tag: id,
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        vibrate: options.vibrate,
        silent: false, 
        requireInteraction: true,
        data: options.data,
        actions: options.actions
    };

    const delay = timestamp - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, swOptions);
      }, delay);
    }
  }
});
