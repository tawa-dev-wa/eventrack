"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/modal";
import { useIsMobile } from "@/lib/use-is-mobile";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@eventrack/ui";
import {
  AlertTriangle,
  History,
  RotateCcw,
  CalendarDays,
  ClipboardList,
  Truck,
  Package,
  HardHat,
  Gauge,
  Clock,
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

type StatPanelId =
  | "events"
  | "missing"
  | "preparations"
  | "departures"
  | "returns";

const PANEL_TITLES: Record<StatPanelId, string> = {
  events: "Événements du jour",
  missing: "Manquants actifs",
  preparations: "Préparations en cours",
  departures: "Départs attendus",
  returns: "Retours attendus",
};

function sortByDepartureTime<
  T extends { departureTime: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.departureTime.localeCompare(b.departureTime)
  );
}

export function DashboardView() {
  const {
    events,
    missingItems,
    modifications,
    stockAllocations,
    getEventPrepProgress,
    getEventMissing,
    getTodayInventoryMission,
    getStockReliability,
  } = useMockStore();

  const inventoryMission = getTodayInventoryMission();
  const stockReliability = getStockReliability();

  const [activePanel, setActivePanel] = useState<StatPanelId | null>(null);
  const isMobile = useIsMobile();

  const todayEvents = getTodayEvents(events);
  const activeMissing = missingItems.filter(isMissingActive);

  const todayWithPreparer = useMemo(
    () =>
      todayEvents.filter(
        (e) => e.assignedPreparer && e.status !== "cancelled"
      ),
    [todayEvents]
  );

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

  const departuresToday = useMemo(
    () =>
      sortByDepartureTime(
        todayEvents.filter(
          (e) => e.status !== "cancelled" && e.status !== "completed"
        )
      ),
    [todayEvents]
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

  function renderPanelBody(id: StatPanelId) {
    switch (id) {
      case "events":
        return todayEvents.length === 0 ? (
          <p className="text-sm text-brand-primary/50">
            Aucun événement aujourd&apos;hui.
          </p>
        ) : (
          todayEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              onClick={() => setActivePanel(null)}
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-brand-neutral p-4 transition-colors active:bg-brand-background"
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
        );
      case "missing":
        return activeMissing.length === 0 ? (
          <p className="text-sm text-brand-primary/50">Aucun manquant actif.</p>
        ) : (
          activeMissing.map((item) => (
            <Link
              key={item.id}
              href={`/events/${item.eventId}?tab=missing`}
              onClick={() => setActivePanel(null)}
              className="flex min-h-11 items-start gap-3 rounded-lg border border-brand-critical/20 bg-brand-critical/5 p-4 active:bg-brand-critical/10"
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
        );
      case "preparations":
        return todayEvents.length === 0 ? (
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
                onClick={() => setActivePanel(null)}
                className={cn(
                  "block min-h-11 rounded-lg border p-4 active:bg-brand-background",
                  complete
                    ? "border-brand-success/30 bg-brand-success/5"
                    : "border-brand-neutral"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-brand-primary">
                      {event.name.split(" — ")[0]}
                    </p>
                    {event.assignedPreparer && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-brand-secondary">
                        <HardHat className="h-3 w-3" />
                        {event.assignedPreparer}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      complete ? "text-brand-success" : "text-brand-secondary"
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
        );
      case "departures":
        return departuresToday.length === 0 ? (
          <p className="text-sm text-brand-primary/50">
            Aucun départ camion prévu aujourd&apos;hui.
          </p>
        ) : (
          departuresToday.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}?tab=preparation`}
              onClick={() => setActivePanel(null)}
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-brand-neutral p-4 active:bg-brand-background"
            >
              <div className="min-w-0">
                <p className="font-medium text-brand-primary">
                  {event.name.split(" — ")[0]}
                </p>
                <p className="mt-0.5 text-sm text-brand-primary/50">
                  {event.eventType}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-brand-secondary">
                départ {formatDepartureTime(event.departureTime)}
              </p>
            </Link>
          ))
        );
      case "returns":
        return returnsByEvent.length === 0 ? (
          <p className="text-sm text-brand-primary/50">Aucun retour planifié.</p>
        ) : (
          returnsByEvent.map((item) => {
            const timePart =
              item.returnLabel.split("·").pop()?.trim() ?? item.returnLabel;
            return (
              <Link
                key={item.eventId}
                href={`/events/${item.eventId}?tab=summary`}
                onClick={() => setActivePanel(null)}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-brand-neutral p-4 active:bg-brand-background"
              >
                <p className="font-medium text-brand-primary">{item.eventName}</p>
                <p className="text-sm font-medium text-brand-secondary">
                  retour {timePart}
                </p>
              </Link>
            );
          })
        );
    }
  }

  function renderInlinePanel(id: StatPanelId) {
    const descriptions: Record<StatPanelId, string> = {
      events: "Accès direct à la fiche de chaque événement",
      missing: "Tickets en cours — accès direct au détail",
      preparations: "Avancement par événement — accès à la préparation",
      departures: "Heures de départ camion par prestation — ordre chronologique",
      returns: "Matériel en circulation — accès à la fiche événement",
    };

    return (
      <Card className="border-brand-secondary/20">
        <CardHeader>
          <CardTitle>{PANEL_TITLES[id]}</CardTitle>
          <CardDescription>{descriptions[id]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">{renderPanelBody(id)}</CardContent>
      </Card>
    );
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
      id: "departures" as const,
      label: "Départs attendus",
      value: departuresToday.length,
      level:
        departuresToday.length > 0 ? ("warning" as const) : ("ok" as const),
      icon: Truck,
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
      <PageHeader
        title="Tableau de bord"
        description={`${formatDateFr("2026-06-11")} — Vue opérationnelle`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      {isMobile && activePanel && (
        <Modal
          open
          onClose={() => setActivePanel(null)}
          title={PANEL_TITLES[activePanel]}
        >
          <div className="space-y-2">{renderPanelBody(activePanel)}</div>
        </Modal>
      )}

      {!isMobile && activePanel && renderInlinePanel(activePanel)}

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/inventory"
          className="group relative overflow-hidden rounded-2xl border border-brand-secondary/25 bg-gradient-to-br from-brand-secondary/15 via-brand-surface to-brand-surface p-5 shadow-sm transition-all hover:border-brand-secondary/40 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-secondary">
                <Package className="h-4 w-4" />
                Inventaire du jour
              </p>
              <p className="mt-2 text-2xl font-bold text-brand-primary">
                {inventoryMission.emoji} {inventoryMission.zoneLabel}
              </p>
              <p className="mt-1 text-sm text-brand-primary/60">
                {inventoryMission.productCount} références
              </p>
            </div>
            <div className="rounded-xl bg-brand-surface px-3 py-2 text-center shadow-sm">
              <Clock className="mx-auto h-4 w-4 text-brand-secondary" />
              <p className="mt-1 text-xs text-brand-primary/45">Estimé</p>
              <p className="font-bold text-brand-primary">
                {inventoryMission.estimatedMinutes} min
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-brand-secondary group-hover:underline">
            Commencer le comptage →
          </p>
        </Link>

        <Card className="border-brand-success/25 bg-gradient-to-br from-brand-success/10 to-transparent">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-success">
              <Gauge className="h-4 w-4" />
              Fiabilité du stock
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-primary">
                {stockReliability}
                <span className="text-2xl text-brand-primary/50">%</span>
              </p>
              <p className="mt-1 text-sm text-brand-primary/60">
                Basé sur les inventaires tournants — sans saisie quotidienne
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {todayWithPreparer.length > 0 && (
        <Card className="border-brand-secondary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-brand-secondary" />
              <CardTitle>Qui prépare quoi</CardTitle>
            </div>
            <CardDescription>
              Préparateurs assignés — progression en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {todayWithPreparer.map((event) => {
              const progress = getEventPrepProgress(event.id);
              return (
                <Link
                  key={event.id}
                  href={`/preparation?event=${event.id}`}
                  className="flex items-center gap-4 rounded-xl border border-brand-neutral bg-brand-background/50 p-4 transition-colors hover:border-brand-secondary/30 hover:bg-brand-surface"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-secondary/15 text-lg font-bold text-brand-secondary">
                    {event.assignedPreparer?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-primary">
                      {event.assignedPreparer}
                    </p>
                    <p className="truncate text-sm text-brand-primary/55">
                      {event.name.split(" — ")[0]}
                    </p>
                    <div className="mt-2">
                      <PrepProgressBar progress={progress} compact />
                    </div>
                  </div>
                  <span className="shrink-0 text-xl font-bold text-brand-secondary">
                    {progress.percent}%
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-secondary" />
              <CardTitle>Départs attendus</CardTitle>
            </div>
            <CardDescription>
              Départs camion du jour — par ordre chronologique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {departuresToday.length === 0 ? (
              <p className="text-sm text-brand-primary/50">
                Aucun départ prévu aujourd&apos;hui.
              </p>
            ) : (
              departuresToday.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}?tab=preparation`}
                  className="flex items-center justify-between gap-3 rounded-md border border-brand-neutral p-3 transition-colors hover:border-brand-secondary/30 hover:bg-brand-background"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-primary">
                      {event.name.split(" — ")[0]}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-primary/45">
                      {event.eventType}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-brand-secondary">
                    départ {formatDepartureTime(event.departureTime)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-brand-secondary" />
              <CardTitle>Retours attendus</CardTitle>
            </div>
            <CardDescription>
              Matériel en circulation — retours planifiés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {returnsByEvent.length === 0 ? (
              <p className="text-sm text-brand-primary/50">
                Aucun retour planifié.
              </p>
            ) : (
              returnsByEvent.map((item) => {
                const timePart =
                  item.returnLabel.split("·").pop()?.trim() ??
                  item.returnLabel;
                return (
                  <Link
                    key={item.eventId}
                    href={`/events/${item.eventId}?tab=summary`}
                    className="flex items-center justify-between gap-3 rounded-md border border-brand-neutral p-3 transition-colors hover:border-brand-secondary/30 hover:bg-brand-background"
                  >
                    <p className="font-semibold text-brand-primary">
                      {item.eventName}
                    </p>
                    <p className="shrink-0 text-sm font-semibold text-brand-secondary">
                      retour {timePart}
                    </p>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

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
                      <p className="font-semibold text-brand-primary">
                        {event.name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-brand-secondary">
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
                  <p className="font-semibold text-brand-primary">
                    {m.designation} · {m.eventName.split(" — ")[0]}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-primary/45">
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
                <div className="min-w-0">
                  <p className="font-semibold text-brand-primary">
                    {item.eventName}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-primary/45">
                    {item.returnLabel}
                  </p>
                </div>
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
                <p className="font-semibold text-brand-primary">
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
