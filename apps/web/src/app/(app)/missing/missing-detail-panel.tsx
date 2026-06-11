"use client";

import { Button, Textarea } from "@eventrack/ui";
import { MissingStatusBadge } from "@/components/status-badges";
import { cn } from "@eventrack/ui";
import {
  formatMissingTime,
  missingQuantity,
} from "@/lib/mock/missing-workflow";
import type { MockMissingItem } from "@/lib/mock/types";
import {
  MISSING_RESPONSE_TYPES,
  type MissingResponseType,
} from "@eventrack/shared";

const RESPONSE_LABELS: Record<MissingResponseType, string> = {
  ordered: "Commandé",
  replaced: "Remplacer par",
  client_informed: "Client informé",
  cancelled: "Annulé",
};

export function MissingDetailPanel({
  selected,
  responseType,
  responseComment,
  onResponseTypeChange,
  onResponseCommentChange,
  onRespond,
  className,
}: {
  selected: MockMissingItem;
  responseType: MissingResponseType;
  responseComment: string;
  onResponseTypeChange: (type: MissingResponseType) => void;
  onResponseCommentChange: (value: string) => void;
  onRespond: () => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-brand-primary">Réponse commerciale</h3>
        <p className="mt-1 text-sm text-brand-primary/60">
          {selected.designation} · {selected.eventName.split(" — ")[0]}
        </p>
        <div className="mt-2">
          <MissingStatusBadge status={selected.workflowStatus} />
        </div>
      </div>

      <p className="text-sm text-brand-primary/70">
        Demandé {selected.quantityRequested} · Trouvé {selected.quantityFound} ·
        Manque <strong>{missingQuantity(selected)}</strong>
      </p>

      {selected.comment && (
        <p className="rounded-md bg-brand-background p-2 text-sm italic text-brand-primary/60">
          {selected.comment}
        </p>
      )}

      {selected.workflowStatus === "declared" && (
        <>
          <div>
            <p className="mb-2 text-sm font-medium">Réponse :</p>
            <div className="flex flex-wrap gap-2">
              {MISSING_RESPONSE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onResponseTypeChange(t)}
                  className={cn(
                    "min-h-11 touch-manipulation rounded-full border px-3 py-2 text-xs font-medium",
                    responseType === t
                      ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                      : "border-brand-neutral text-brand-primary/60"
                  )}
                >
                  {RESPONSE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={responseComment}
            onChange={(e) => onResponseCommentChange(e.target.value)}
            placeholder={
              responseType === "replaced"
                ? "Ex. 2 vases rouges"
                : "Commentaire commercial…"
            }
            rows={3}
          />
          <Button
            variant="secondary"
            className="w-full min-h-11"
            onClick={onRespond}
            disabled={!responseComment.trim()}
          >
            Valider la réponse
          </Button>
        </>
      )}

      {selected.commercialResponse && selected.workflowStatus !== "declared" && (
        <div className="rounded-md border border-brand-secondary/20 bg-brand-secondary/5 p-3 text-sm">
          <p className="font-medium text-brand-primary">
            {selected.responseType
              ? RESPONSE_LABELS[selected.responseType]
              : "Réponse"}
          </p>
          <p className="mt-1 text-brand-primary/70">{selected.commercialResponse}</p>
          {selected.respondedBy && selected.respondedAt && (
            <p className="mt-1 text-xs text-brand-primary/50">
              {selected.respondedBy} · {formatMissingTime(selected.respondedAt)}
            </p>
          )}
        </div>
      )}

      {selected.history.length > 0 && (
        <div className="border-t border-brand-neutral pt-3">
          <p className="text-sm font-medium text-brand-primary">Historique</p>
          <ol className="mt-3 space-y-3">
            {[...selected.history].reverse().map((entry) => (
              <li
                key={entry.id}
                className="border-l-2 border-brand-neutral pl-3 text-sm"
              >
                <p className="text-xs font-medium text-brand-primary/50">
                  {formatMissingTime(entry.at)}
                </p>
                <p className="font-medium text-brand-primary">{entry.label}</p>
                <p className="text-brand-primary/70">{entry.detail}</p>
                <p className="text-xs text-brand-primary/40">{entry.userName}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
