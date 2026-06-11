"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent } from "@eventrack/ui";
import { Plus } from "lucide-react";
import {
  useMockStore,
  formatShortDate,
  formatDepartureTime,
  isMissingActive,
} from "@/lib/mock/store";
import { EventStatusBadge } from "@/components/status-badges";
import { PrepProgressBar } from "@/components/prep-progress-bar";
import { cn } from "@eventrack/ui";

type Filter = "all" | "today" | "week" | "to_prepare";

export default function EventsPage() {
  const { events, getEventPrepProgress, getEventMissing } = useMockStore();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = events.filter((e) => {
    if (filter === "today") return e.date === "2026-06-11";
    if (filter === "week")
      return e.date >= "2026-06-11" && e.date <= "2026-06-17";
    if (filter === "to_prepare") return e.status === "to_prepare";
    return true;
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "today", label: "Aujourd'hui" },
    { id: "week", label: "Cette semaine" },
    { id: "to_prepare", label: "À préparer" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-primary md:text-2xl">
            Événements
          </h1>
          <p className="text-sm text-brand-primary/60">
            {filtered.length} événement{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/events/new">
          <Button variant="secondary" size="sm" className="md:size-default">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvel événement</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filter === f.id
                ? "bg-brand-secondary text-white"
                : "bg-brand-neutral/50 text-brand-primary/60 hover:bg-brand-neutral"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((event) => {
          const progress = getEventPrepProgress(event.id);
          const missing = getEventMissing(event.id).filter(isMissingActive).length;

          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block rounded-lg border border-brand-neutral bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-brand-primary">{event.name}</p>
                <EventStatusBadge status={event.status} />
              </div>
              <p className="mt-1 text-sm text-brand-secondary">
                Départ camion : {formatDepartureTime(event.departureTime)}
              </p>
              <div className="mt-2">
                <PrepProgressBar progress={progress} compact />
              </div>
              {missing > 0 && (
                <p className="mt-1 text-xs text-brand-critical">
                  {missing} manquant{missing > 1 ? "s" : ""}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-neutral bg-brand-background/50 text-left text-brand-primary/60">
                  <th className="px-4 py-3 font-medium">Événement</th>
                  <th className="px-4 py-3 font-medium">Départ camion</th>
                  <th className="px-4 py-3 font-medium">Préparation</th>
                  <th className="px-4 py-3 font-medium">Manquants</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Convives</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => {
                  const progress = getEventPrepProgress(event.id);
                  const missing = getEventMissing(event.id).filter(isMissingActive).length;

                  return (
                    <tr
                      key={event.id}
                      className="border-b border-brand-neutral last:border-0 hover:bg-brand-background/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/events/${event.id}`}
                          className="font-medium text-brand-primary hover:text-brand-secondary"
                        >
                          {event.name}
                        </Link>
                        <p className="text-xs text-brand-primary/50">
                          {event.commercial}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-secondary">
                        {formatDepartureTime(event.departureTime)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{progress.percent}%</span>
                        <span className="ml-1 text-brand-primary/50">
                          ({progress.preparedLines}/{progress.totalLines})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {missing > 0 ? (
                          <span className="font-medium text-brand-critical">
                            {missing}
                          </span>
                        ) : (
                          <span className="text-brand-primary/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-primary/70">
                        {formatShortDate(event.date)}
                      </td>
                      <td className="px-4 py-3 text-brand-primary/70">
                        {event.guestsAdults}
                        {event.guestsChildren > 0
                          ? ` + ${event.guestsChildren}`
                          : ""}
                      </td>
                      <td className="px-4 py-3">
                        <EventStatusBadge status={event.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
