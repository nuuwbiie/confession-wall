// Confession Wall - Service Worker for Push Notifications
// This file must be placed in the public/ directory

// Immediately activate new SW version without waiting for tab close
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      // Notify all clients that SW is now active
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_ACTIVATED" });
        });
      });
    })
  );
});

// Handle subscription renewal (when push subscription expires)
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    // Notify the main page to re-subscribe
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "PUSH_SUBSCRIPTION_EXPIRED" });
      });
    })
  );
});

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const title = data.title || "Confession Wall";
    const options = {
      body: data.body || "",
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/badge-72.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
        dateOfArrival: Date.now(),
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // If JSON parsing fails, show raw text
    event.waitUntil(
      self.registration.showNotification("Confession Wall", {
        body: event.data.text(),
        icon: "/icon-192.png",
        badge: "/badge-72.png",
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (windowClients) {
        // If a window tab is already open, focus it
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
