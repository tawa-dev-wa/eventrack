"use client";

import { QRCodeSVG } from "qrcode.react";
import { Copy, Printer } from "lucide-react";
import { Button } from "@eventrack/ui";
import type { MockEvent } from "@/lib/mock/types";
import {
  getEventPrepPath,
  getEventPrepUrl,
  getInterimDemoBaseUrl,
} from "@/lib/mock/prep-access";
import { formatDepartureTime, formatShortDate } from "@/lib/mock/store";

export function PrepQrPanel({
  event,
  compact = false,
}: {
  event: MockEvent;
  compact?: boolean;
}) {
  const path = getEventPrepPath(event);
  const demoBase = getInterimDemoBaseUrl();
  const url =
    typeof window !== "undefined"
      ? getEventPrepUrl(event)
      : `${demoBase || "https://eventrack.netlify.app"}${path}`;

  function copyLink() {
    void navigator.clipboard.writeText(
      typeof window !== "undefined" ? getEventPrepUrl(event) : url
    );
  }

  function printPrep() {
    window.print();
  }

  return (
    <div
      className={`rounded-xl border border-brand-neutral bg-white ${
        compact ? "p-4" : "p-5"
      } print:border-none print:p-0`}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="rounded-lg border border-brand-neutral bg-white p-3 print:border-2">
          <QRCodeSVG value={url} size={compact ? 120 : 160} level="M" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-brand-primary">{event.name}</p>
          <p className="mt-1 text-sm text-brand-primary/60">
            {formatShortDate(event.date)} · Départ{" "}
            {formatDepartureTime(event.departureTime)}
          </p>
          <p className="mt-2 break-all text-xs font-medium text-brand-secondary">
            {url}
          </p>
          <p className="mt-1 text-xs text-brand-primary/50">
            Parcours intérimaire — prénom uniquement, sans compte. Démo locale
            sur le téléphone (pas de synchronisation avec Eventrack).
          </p>
          <div className="mt-3 flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copier le lien
            </Button>
            <Button variant="secondary" size="sm" onClick={printPrep}>
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
