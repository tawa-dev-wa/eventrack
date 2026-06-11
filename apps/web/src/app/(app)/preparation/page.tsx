"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useMockStore,
  getTodayEvents,
  formatDepartureTime,
  isMissingActive,
} from "@/lib/mock/store";
import { EventStatusBadge } from "@/components/status-badges";
import { PrepProgressBar } from "@/components/prep-progress-bar";
import { PreparationView } from "@/components/preparation-view";
import { PageHeader } from "@eventrack/ui";
import { HardHat } from "lucide-react";

function PreparationPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const { events, getEventPrepProgress, getEventMissing } = useMockStore();
  const todayEvents = getTodayEvents(events);

  if (eventId) {
    return (
      <div className="space-y-4">
        <Link
          href="/preparation"
          className="inline-block text-sm font-medium text-brand-secondary"
        >
          ← Retour aux événements
        </Link>
        <PreparationView eventId={eventId} mobile />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Préparation"
        description="Événements du jour — mode entrepôt"
      />

      <div className="space-y-3">
        {todayEvents.map((event) => {
          const progress = getEventPrepProgress(event.id);
          const missing = getEventMissing(event.id).filter(isMissingActive).length;

          return (
            <Link
              key={event.id}
              href={`/preparation?event=${event.id}`}
              className="block rounded-xl border border-brand-neutral bg-white p-5 active:bg-brand-background"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-brand-primary">
                    {event.name}
                  </p>
                  <p className="mt-1 text-base font-semibold text-brand-secondary">
                    Départ camion : {formatDepartureTime(event.departureTime)}
                  </p>
                  {event.assignedPreparer && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-primary/70">
                      <HardHat className="h-4 w-4 text-brand-secondary" />
                      {event.assignedPreparer}
                    </p>
                  )}
                </div>
                <EventStatusBadge status={event.status} />
              </div>
              <div className="mt-4">
                <PrepProgressBar progress={progress} />
              </div>
              {missing > 0 && (
                <p className="mt-2 text-sm font-medium text-brand-critical">
                  {missing} manquant{missing > 1 ? "s" : ""}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function PreparationPage() {
  return (
    <Suspense fallback={<div className="p-4">Chargement…</div>}>
      <PreparationPageContent />
    </Suspense>
  );
}
