"use client";

import { useEffect, useState } from "react";
import { clearQueue, readQueue } from "./prep-cache";

export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    setPendingSync(readQueue().length);

    const onOnline = () => {
      setOnline(true);
      clearQueue();
      setPendingSync(0);
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return { online, pendingSync };
}
