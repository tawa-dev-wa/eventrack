"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/use-is-mobile";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@eventrack/ui";
import {
  useMockStore,
  formatShortDate,
  formatDepartureTime,
  isMissingActive,
} from "@/lib/mock/store";
import { EventStatusBadge, MissingStatusBadge } from "@/components/status-badges";
import { missingQuantity } from "@/lib/mock/missing-workflow";
import { EventSummaryPanel } from "@/components/event-summary-panel";
import { Tabs } from "@/components/tabs";
import { OrderFormView } from "@/components/order-form-view";
import { PreparationView } from "@/components/preparation-view";
import { PrepProgressBar } from "@/components/prep-progress-bar";
import { PrepQrPanel } from "@/components/prep-qr-panel";
import { PrepActionHistory } from "@/components/prep-action-history";

export function EventDetailView({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const tab = searchParams.get("tab") ?? "summary";
  const {
    getEvent,
    getEventMissing,
    getEventPrepProgress,
    modifications,
    getEventPrepActions,
  } = useMockStore();

  const event = getEvent(eventId);
  if (!event) notFound();

  const missingCount = getEventMissing(eventId).filter(isMissingActive).length;
  const progress = getEventPrepProgress(eventId);
  const eventMods = modifications.filter((m) => m.eventId === eventId);

  const tabs = [
    { id: "summary", label: "Résumé" },
    { id: "order", label: "Bon de commande" },
    { id: "preparation", label: "Préparation logistique" },
    {
      id: "missing",
      label: "Manquants",
      badge: missingCount,
    },
    { id: "history", label: "Historique" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        meta={
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm text-brand-primary/60 md:gap-3">
              <EventStatusBadge status={event.status} />
              <span>
                {formatShortDate(event.date)} · {event.startTime}
              </span>
              <span className="font-medium text-brand-secondary">
                Départ camion {formatDepartureTime(event.departureTime)}
              </span>
              <span>
                {event.guestsAdults} convives · {event.commercial}
              </span>
            </div>
            <div className="mt-3 max-w-md md:hidden">
              <PrepProgressBar progress={progress} compact />
            </div>
          </>
        }
        action={
          <div className="hidden gap-2 sm:flex">
            <Button variant="outline" size="sm" disabled title="Bientôt disponible">
              Exporter PDF
            </Button>
            <Button variant="secondary" size="sm" disabled title="Bientôt disponible">
              Modifier
            </Button>
          </div>
        }
      />

      <Tabs
        tabs={tabs}
        active={tab}
        onChange={(id) => router.push(`/events/${eventId}?tab=${id}`)}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          {tab === "summary" && (
            <Card>
              <CardHeader>
                <CardTitle>Informations événement</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-brand-primary/50">Client</dt>
                    <dd className="font-medium">{event.clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-primary/50">Type</dt>
                    <dd className="font-medium">{event.eventType}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-primary/50">Heure prestation</dt>
                    <dd className="font-medium">{event.startTime}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-primary/50">Départ camion</dt>
                    <dd className="font-medium text-brand-secondary">
                      {formatDepartureTime(event.departureTime)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-brand-primary/50">Adresse</dt>
                    <dd className="font-medium">{event.address}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-primary/50">Convives</dt>
                    <dd className="font-medium">
                      {event.guestsAdults} adultes
                      {event.guestsChildren > 0 &&
                        ` + ${event.guestsChildren} enfants`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-brand-primary/50">Commercial</dt>
                    <dd className="font-medium">{event.commercial}</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-brand-neutral pt-4">
                  <PrepProgressBar progress={progress} />
                </div>
                <div className="mt-4">
                  <PrepQrPanel event={event} compact />
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "order" && <OrderFormView eventId={eventId} />}

          {tab === "preparation" && event && (
            <div className="prep-print-area space-y-4">
              <PrepQrPanel event={event} />
              <Card>
                <CardHeader>
                  <CardTitle>Historique des actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <PrepActionHistory actions={getEventPrepActions(eventId)} />
                </CardContent>
              </Card>
              <PreparationView eventId={eventId} mobile={isMobile} />
            </div>
          )}

          {tab === "missing" && (
            <Card>
              <CardHeader>
                <CardTitle>Manquants liés à cet événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getEventMissing(eventId).length === 0 ? (
                  <p className="text-sm text-brand-primary/50">
                    Aucun manquant déclaré
                  </p>
                ) : (
                  getEventMissing(eventId).map((m) => (
                    <div
                      key={m.id}
                      className="rounded-md border border-brand-neutral p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{m.designation}</p>
                        <MissingStatusBadge status={m.workflowStatus} />
                      </div>
                      <p className="mt-1 text-brand-primary/50">
                        Demandé {m.quantityRequested} · Trouvé{" "}
                        {m.quantityFound} · Manque {missingQuantity(m)}
                      </p>
                      {m.commercialResponse && (
                        <p className="mt-1 text-brand-secondary">
                          {m.commercialResponse}
                        </p>
                      )}
                    </div>
                  ))
                )}
                <Link href="/missing">
                  <Button variant="outline" size="sm">
                    Voir tous les manquants
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {tab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des modifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventMods.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-md border border-brand-neutral p-3 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{m.userName}</span>
                      <span className="text-brand-primary/40">{m.time}</span>
                    </div>
                    <p className="mt-1 text-brand-primary/70">{m.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="hidden lg:block">
          <EventSummaryPanel event={event} />
        </div>
      </div>
    </div>
  );
}
