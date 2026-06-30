// Confession Wall - Service Worker for Push Notifications
// This file must be placed in the public/ directory

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const title = data.title || "Confession Wall";
    const options = {
      body: data.body || "",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
        dateOfArrival: Date.now(),
      },
    };

    // Add icon only if available
    if (data.icon) {
      options.icon = data.icon;
    }

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // If JSON parsing fails, show raw text
    event.waitUntil(
      self.registration.showNotification("Confession Wall", {
        body: event.data.text(),
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
