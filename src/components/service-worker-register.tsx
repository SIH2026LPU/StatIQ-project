"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Check for updates periodically
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[StatIQ PWA] New update available. Reloading or caching ready.");
              }
            });
          }
        });
      } catch (err) {
        console.warn("[StatIQ PWA] Service worker registration failed:", err);
      }
    };

    if (document.readyState === "complete") {
      void registerSW();
    } else {
      window.addEventListener("load", () => {
        void registerSW();
      });
    }
  }, []);

  return null;
}
