"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@eventrack/ui";
import {
  useMockStore,
  formatDepartureTime,
  formatShortDate,
} from "@/lib/mock/store";
import { findEventByPrepAccess } from "@/lib/mock/prep-access";
import {
  PreparerProvider,
  readStoredPreparerName,
  usePreparer,
} from "@/lib/mock/preparer-context";
import { PreparationView } from "@/components/preparation-view";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

function InterimPrepContent({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const { name } = usePreparer();

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg touch-pan-y bg-brand-background pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="relative border-b border-brand-neutral bg-brand-surface px-4 py-4 pr-16">
        <div className="absolute right-3 top-3">
          <ThemeToggleButton />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
          Préparation de commande
        </p>
        <h1 className="mt-1 text-xl font-bold text-brand-primary">{eventName}</h1>
        <p className="mt-1 text-sm text-brand-primary/60">
          {name} · démo locale (sans synchronisation)
        </p>
      </header>

      <div className="p-4">
        <PreparationView
          eventId={eventId}
          mobile
          interim
          defaultSmartPrep
        />
      </div>
    </div>
  );
}

function WelcomeScreen({
  event,
  onStart,
}: {
  event: {
    name: string;
    date: string;
    departureTime: string;
  };
  onStart: (name: string) => void;
}) {
  const [firstName, setFirstName] = useState("");

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-neutral bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-primary">Bienvenue</h1>
        <p className="mt-2 text-sm text-brand-primary/60">
          {event.name.split(" — ")[0]}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-brand-primary/50">Date</dt>
            <dd className="font-medium">{formatShortDate(event.date)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-brand-primary/50">Départ camion</dt>
            <dd className="font-medium text-brand-secondary">
              {formatDepartureTime(event.departureTime)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            Prénom
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Kevin, Lucas, Julie…"
            className="h-12 text-base"
            autoComplete="given-name"
          />
        </div>

        <Button
          variant="secondary"
          className="mt-6 h-12 w-full text-base"
          disabled={!firstName.trim()}
          onClick={() => onStart(firstName.trim())}
        >
          Commencer
        </Button>
      </div>
    </div>
  );
}

function InterimPageInner({ slug, token }: { slug: string; token: string }) {
  const { events } = useMockStore();
  const event = findEventByPrepAccess(events, slug, token);
  const [started, setStarted] = useState(false);
  const { setName } = usePreparer();

  useEffect(() => {
    const stored = readStoredPreparerName();
    if (stored) {
      setName(stored);
      setStarted(true);
    }
  }, [setName]);

  if (!event) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6 text-center">
        <p className="text-brand-primary">Lien de préparation invalide ou expiré.</p>
      </div>
    );
  }

  if (!started) {
    return (
      <WelcomeScreen
        event={event}
        onStart={(name) => {
          setName(name);
          setStarted(true);
        }}
      />
    );
  }

  return <InterimPrepContent eventId={event.id} eventName={event.name} />;
}

export function InterimPreparationClient({
  slug,
  token,
}: {
  slug: string;
  token: string;
}) {
  return (
    <PreparerProvider>
      <InterimPageInner slug={slug} token={token} />
    </PreparerProvider>
  );
}
