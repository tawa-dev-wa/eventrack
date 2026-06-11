"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@eventrack/ui";
import {
  AlertTriangle,
  History,
  RotateCcw,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import {
  useMockStore,
  getTodayEvents,
  formatDateFr,
  formatDepartureTime,
  isMissingActive,
} from "@/lib/mock/store";
import { missingQuantity } from "@/lib/mock/missing-workflow";
import { EventStatusBadge } from "@/components/status-badges";
import { PrepProgressBar } from "@/components/prep-progress-bar";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { cn } from "@eventrack/ui";

type StatPanelId = "events" | "missing" | "preparations" | "returns";

export function DashboardView() {
  const {
    events,
    missingItems,
    modifications,
    stockAllocations,
    getEventPrepProgress,
    getEventMissing,
  } = useMockStore();

  const [activePanel, setActivePanel] = useState<StatPanelId | null>(null);

  const todayEvents = getTodayEvents(events);
  const activeMissing = missingItems.filter(isMissingActive);

  const preparationsInProgress = useMemo(
    () =>
      todayEvents.filter((event) => {
        const { percent } = getEventPrepProgress(event.id);
        return (
          percent < 100 &&
          (event.status === "to_prepare" || event.status === "preparing")
        );
      }),
    [todayEvents, getEventPrepProgress]
  );

  const returnsByEvent = useMemo(() => {
    const map = new Map<
      string,
      { eventId: string; eventName: string; returnLabel: string }
    >();
    for (const allocation of stockAllocations) {
      if (!allocation.expectedReturn || !allocation.eventId) continue;
      const existing = map.get(allocation.eventId);
      if (!existing) {
        map.set(allocation.eventId, {
          eventId: allocation.eventId,
          eventName: allocation.eventName?.split(" — ")[0] ?? "Événement",
          returnLabel: allocation.expectedReturn,
        });
      }
    }
    return [...map.values()];
  }, [stockAllocations]);

  function togglePanel(id: StatPanelId) {
    setActivePanel((current) => (current === id ? null : id));
  }

  const stats = [
    {
      id: "events" as const,
      label: "Événements du jour",
      value: todayEvents.length,
      level: "ok" as const,
      icon: CalendarDays,
    },
    {
      id: "missing" as const,
      label: "Manquants critiques",
      value: activeMissing.length,
      level:
        activeMissing.length > 0 ? ("critical" as const) : ("ok" as const),
      icon: AlertTriangle,
    },
    {
      id: "preparations" as const,
      label: "Préparations en cours",
      value: preparationsInProgress.length,
      level:
        preparationsInProgress.length > 0
          ? ("warning" as const)
          : ("ok" as const),
      icon: ClipboardList,
    },
    {
      id: "returns" as const,
      label: "Retours attendus",
      value: returnsByEvent.length,
      level: "ok" as const,
      icon: RotateCcw,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-primary md:text-2xl">
          Tableau de bord
        </h1>
        <p className="text-sm text-brand-primary/60">
          {formatDateFr("2026-06-11")} — Vue opérationnelle
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            level={stat.level}
            icon={stat.icon}
            active={activePanel === stat.id}
            onClick={() => togglePanel(stat.id)}
          />
        ))}
      </div>

      {activePanel === "events" && (
        <Card className="border-brand-secondary/20">
          <CardHeader>
            <CardTitle>Événements du jour</CardTitle>
            <CardDescription>
              Accès direct à la fiche de chaque événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-brand-primary/50">
                Aucun événement aujourd&apos;hui.
              </p>
            ) : (
              todayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-neutral p-4 transition-colors hover:border-brand-secondary/40 hover:bg-brand-background"
                >
                  <div>
                    <p className="font-medium text-brand-primary">
                      {event.name.split(" — ")[0]}
                    </p>
                    <p className="mt-0.5 text-sm text-brand-primary/50">
                      Départ camion {formatDepartureTime(event.departureTime)}
                    </p>
                  </div>
                  <EventStatusBadge status={event.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activePanel === "missing" && (
        <Card className="border-brand-secondary/20">
          <CardHeader>
            <CardTitle>Manquants actifs</CardTitle>
            <CardDescription>
              Tickets en cours — accès direct au détail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeMissing.length === 0 ? (
              <p className="text-sm text-brand-primary/50">
                Aucun manquant actif.
              </p>
            ) : (
              activeMissing.map((item) => (
                <Link
                  key={item.id}
                  href={`/events/${item.eventId}?tab=missing`}
                  className="flex items-start gap-3 rounded-lg border border-brand-critical/20 bg-brand-critical/5 p-4 transition-colors hover:border-brand-critical/40 hover:bg-brand-critical/10"
                >
                  <Badge variant="critical">Manquant</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-brand-primary">
                      {item.designation}
                      <span className="ml-2 font-normal text-brand-critical">
                        ({missingQuantity(item)} manquant
                        {missingQuantity(item) > 1 ? "s" : ""})
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-brand-primary/50">
                      {item.eventName.split(" — ")[0]}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activePanel === "preparations" && (
        <Card className="border-brand-secondary/20">
          <CardHeader>
            <CardTitle>Préparations en cours</CardTitle>
            <CardDescription>
              Avancement par événement — accès à la préparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-brand-primary/50">
                Aucune préparation aujourd&apos;hui.
              </p>
            ) : (
              todayEvents.map((event) => {
                const progress = getEventPrepProgress(event.id);
                const complete = progress.percent >= 100;
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}?tab=preparation`}
                    className={cn(
                      "block rounded-lg border p-4 transition-colors hover:border-brand-secondary/40 hover:bg-brand-background",
                      complete
                        ? "border-brand-success/30 bg-brand-success/5"
                        : "border-brand-neutral"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-brand-primary">
                        {event.name.split(" — ")[0]}
                      </p>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          complete
                            ? "text-brand-success"
                            : "text-brand-secondary"
                        )}
                      >
                        {progress.percent}%
                      </span>
                    </div>
                    {!complete && (
                      <div className="mt-2">
                        <PrepProgressBar progress={progress} compact />
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {activePanel === "returns" && (
        <Card className="border-brand-secondary/20">
          <CardHeader>
            <CardTitle>Retours attendus</CardTitle>
            <CardDescription>
              Matériel en circulation — accès à la fiche événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {returnsByEvent.length === 0 ? (
              <p className="text-sm text-brand-primary/50">
                Aucun retour planifié.
              </p>
            ) : (
              returnsByEvent.map((item) => {
                const timePart = item.returnLabel.split("·").pop()?.trim() ?? item.returnLabel;
                return (
                  <Link
                    key={item.eventId}
                    href={`/events/${item.eventId}?tab=summary`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-brand-neutral p-4 transition-colors hover:border-brand-secondary/40 hover:bg-brand-background"
                  >
                    <p className="font-medium text-brand-primary">
                      {item.eventName}
                    </p>
                    <p className="text-sm font-medium text-brand-secondary">
                      retour {timePart}
                    </p>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Événements du jour</CardTitle>
            <CardDescription>
              {todayEvents.length} événement{todayEvents.length > 1 ? "s" : ""}{" "}
              programmé{todayEvents.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.map((event) => {
              const progress = getEventPrepProgress(event.id);
              const missing = getEventMissing(event.id).filter(isMissingActive)
                .length;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}?tab=preparation`}
                  className="block rounded-md border border-brand-neutral p-4 transition-colors hover:border-brand-secondary/30 hover:bg-brand-background"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-primary">
                        {event.name}
                      </p>
                      <p className="mt-1 text-sm font-medium text-brand-secondary">
                        Départ camion : {formatDepartureTime(event.departureTime)}
                      </p>
                      <div className="mt-2">
                        <PrepProgressBar progress={progress} compact />
                      </div>
                      {missing > 0 && (
                        <p className="mt-1 text-xs font-medium text-brand-critical">
                          {missing} manquant{missing > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <EventStatusBadge status={event.status} />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes opérationnelles</CardTitle>
            <CardDescription>Actions prioritaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeMissing.slice(0, 4).map((m) => (
              <Link
                key={m.id}
                href={`/events/${m.eventId}?tab=missing`}
                className="flex items-start gap-3 rounded-md border border-brand-critical/20 bg-brand-critical/5 p-3 hover:bg-brand-critical/10"
              >
                <Badge variant="critical">Manquant</Badge>
                <div>
                  <p className="text-sm font-medium text-brand-primary">
                    {m.designation} · {m.eventName.split(" — ")[0]}
                  </p>
                  <p className="text-xs text-brand-primary/50">
                    Manque {missingQuantity(m)} unité(s)
                  </p>
                </div>
              </Link>
            ))}
            {returnsByEvent.slice(0, 2).map((item) => (
              <Link
                key={item.eventId}
                href={`/events/${item.eventId}?tab=summary`}
                className="flex items-start gap-3 rounded-md border border-brand-neutral p-3 transition-colors hover:bg-brand-background"
              >
                <Badge variant="secondary">Retour</Badge>
                <p className="text-sm text-brand-primary">
                  {item.eventName} · {item.returnLabel}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-brand-secondary" />
            <CardTitle>Modifications récentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {modifications.slice(0, 5).map((mod) => (
            <div
              key={mod.id}
              className="rounded-md border border-brand-neutral p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-brand-primary">
                  {mod.userName}
                </p>
                <span className="text-xs text-brand-primary/40">{mod.time}</span>
              </div>
              <p className="mt-1 text-sm text-brand-primary/70">{mod.detail}</p>
              <p className="mt-1 text-xs text-brand-primary/40">
                {mod.eventName}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
