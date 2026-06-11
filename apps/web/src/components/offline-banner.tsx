"use client";

import { WifiOff, CloudUpload } from "lucide-react";
import { useOnlineStatus } from "@/lib/offline/use-offline";

export function OfflineBanner() {
  const { online, pendingSync } = useOnlineStatus();

  if (online && pendingSync === 0) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
        online
          ? "bg-brand-success/15 text-brand-success"
          : "bg-brand-warning/20 text-brand-warning"
      }`}
      role="status"
    >
      {online ? (
        <>
          <CloudUpload className="h-4 w-4" />
          Connexion rétablie — synchronisation en cours…
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          Mode hors connexion — vos actions seront synchronisées au retour du
          réseau
        </>
      )}
    </div>
  );
}
