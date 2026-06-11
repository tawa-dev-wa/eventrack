import type { MissingResponseType } from "@eventrack/shared";
import type { MockMissingItem, MissingWorkflowStatus } from "./types";

export const MISSING_WORKFLOW_LABELS: Record<MissingWorkflowStatus, string> = {
  declared: "Manquant déclaré",
  commercial_response: "Réponse commerciale reçue",
  replacement_done: "Remplacement effectué",
  closed: "Clos",
};

export const RESPONSE_TYPE_LABELS: Record<MissingResponseType, string> = {
  ordered: "Commandé",
  replaced: "Remplacer par",
  client_informed: "Client informé",
  cancelled: "Annulé",
};

export function missingQuantity(item: MockMissingItem) {
  return item.quantityRequested - item.quantityFound;
}

export function isMissingActive(item: MockMissingItem) {
  return item.workflowStatus !== "closed";
}

export function needsCommercialAction(item: MockMissingItem) {
  return item.workflowStatus === "declared";
}

export function needsPrepAction(item: MockMissingItem) {
  return item.workflowStatus === "commercial_response";
}

export function formatMissingTime(iso: string) {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getEventMissingSummary(items: MockMissingItem[]) {
  const active = items.filter(isMissingActive);
  return {
    awaitingCommercial: active.filter(needsCommercialAction).length,
    responsesToApply: active.filter(needsPrepAction).length,
    activeCount: active.length,
  };
}

export function formatCommercialResponse(item: MockMissingItem) {
  if (!item.commercialResponse) return null;
  const prefix =
    item.responseType === "replaced"
      ? RESPONSE_TYPE_LABELS.replaced
      : item.responseType
        ? RESPONSE_TYPE_LABELS[item.responseType]
        : "Réponse";
  return `${prefix} : ${item.commercialResponse}`;
}
