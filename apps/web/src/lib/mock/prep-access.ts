import type { MockEvent } from "./types";

export function slugifyEventName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function randomPrepToken() {
  return Math.random().toString(36).slice(2, 8);
}

/** URL publique démo (Netlify). Desktop QR → téléphone sans sync locale. */
export function getInterimDemoBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_INTERIM_DEMO_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function getEventPrepPath(event: MockEvent) {
  return `/preparation/${event.prepSlug}/${event.prepToken}`;
}

export function getEventPrepUrl(event: MockEvent, origin?: string) {
  const base = origin ?? getInterimDemoBaseUrl();
  return `${base}${getEventPrepPath(event)}`;
}

export function findEventByPrepAccess(
  events: MockEvent[],
  slug: string,
  token: string
) {
  return events.find((e) => e.prepSlug === slug && e.prepToken === token);
}
