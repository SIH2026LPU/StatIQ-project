self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.mode === "navigate") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) return;
});
