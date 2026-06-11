"use client";

import type { MockEvent } from "@/lib/mock/types";
import { useMockStore, formatDepartureTime } from "@/lib/mock/store";
import { Card, CardContent, CardHeader, CardTitle } from "@eventrack/ui";
import { EventStatusBadge } from "./status-badges";
import { PrepProgressBar } from "./prep-progress-bar";

export function EventSummaryPanel({ event }: { event: MockEvent }) {
  const { trucks, modifications, getEventPrepProgress } = useMockStore();
  const truck = trucks.find((t) => t.id === event.truckId);
  const lastMod = modifications.find((m) => m.eventId === event.id);
  const progress = getEventPrepProgress(event.id);

  return (
    <Card className="sticky top-0">
      <CardHeader>
        <CardTitle>Résumé</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <EventStatusBadge status={event.status} />
        </div>
        <div className="space-y-2 text-brand-primary/70">
          <p>
            <span className="font-medium text-brand-primary">Convives :</span>{" "}
            {event.guestsAdults} adultes
            {event.guestsChildren > 0 && ` + ${event.guestsChildren} enfants`}
          </p>
          <p>
            <span className="font-medium text-brand-primary">Type :</span>{" "}
            {event.eventType}
          </p>
          <p>
            <span className="font-medium text-brand-primary">Prestation :</span>{" "}
            {event.startTime}
          </p>
          <p>
            <span className="font-medium text-brand-secondary">
              Départ camion :
            </span>{" "}
            <span className="font-semibold text-brand-secondary">
              {formatDepartureTime(event.departureTime)}
            </span>
          </p>
          <p>
            <span className="font-medium text-brand-primary">Lieu :</span>{" "}
            {event.address}
          </p>
        </div>

        <div className="border-t border-brand-neutral pt-4">
          <PrepProgressBar progress={progress} compact />
        </div>

        <div className="border-t border-brand-neutral pt-4">
          <p className="mb-2 font-medium text-brand-primary">Logistique</p>
          <div className="space-y-1 text-brand-primary/70">
            <p>
              Camion :{" "}
              {truck ? (
                <span className="text-brand-success">{truck.name} · Affecté</span>
              ) : (
                "Non attribué"
              )}
            </p>
            <p>Chauffeur : {event.driver ?? "—"}</p>
          </div>
        </div>

        {event.comments && (
          <div className="border-t border-brand-neutral pt-4">
            <p className="mb-2 font-medium text-brand-primary">Remarques</p>
            <p className="text-brand-primary/70 italic">{event.comments}</p>
          </div>
        )}

        {lastMod && (
          <div className="border-t border-brand-neutral pt-4">
            <p className="mb-1 font-medium text-brand-primary">
              Dernière modification
            </p>
            <p className="text-brand-primary/50">
              {lastMod.userName} · {lastMod.time}
            </p>
            <p className="text-brand-primary/70">{lastMod.detail}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
