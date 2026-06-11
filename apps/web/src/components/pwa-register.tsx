"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Nettoyer l'ancien SW cassé (eventrack-v1 precachait des pages HTML)
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        void reg.update();
      }
    });

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore */
    });
  }, []);

  return null;
}
