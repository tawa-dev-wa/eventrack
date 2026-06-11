"use client";

import { Button } from "@eventrack/ui";
import { Check, Minus, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@eventrack/ui";
import { PrepPackagingBreakdown } from "@/components/prep-packaging-breakdown";
import { ProductPhoto } from "@/components/product-photo";
import { PrepQuantityInput } from "@/components/prep-quantity-input";
import { RESPONSE_TYPE_LABELS } from "@/lib/mock/missing-workflow";
import { formatMissingTime } from "@/lib/mock/missing-workflow";
import {
  needsCommercialAction,
  needsPrepAction,
} from "@/lib/mock/missing-workflow";
import type { MockMissingItem, MockPreparationLine } from "@/lib/mock/types";

export function PrepLineCard({
  line,
  index,
  status,
  packSize,
  priority,
  smartPrep,
  mobile,
  photoColor,
  photoUrls,
  reference,
  lineMissing,
  onToggleComplete,
  onOpenProduct,
  onQuantityChange,
  onValidate,
  onDeclareMissing,
  onConfirmReplacement,
}: {
  line: MockPreparationLine;
  index: number;
  status: "complete" | "partial" | "pending";
  packSize: number;
  priority: number;
  smartPrep: boolean;
  mobile: boolean;
  photoColor?: string;
  photoUrls?: string[];
  reference?: string;
  lineMissing?: MockMissingItem;
  onToggleComplete: () => void;
  onOpenProduct: () => void;
  onQuantityChange: (qty: number) => void;
  onValidate: () => void;
  onDeclareMissing: () => void;
  onConfirmReplacement: () => void;
}) {
  const isComplete = status === "complete";
  const isPartial = status === "partial";
  const isPending = status === "pending";
  const hasActiveMissing = lineMissing !== undefined;
  const awaitingCommercial =
    lineMissing && needsCommercialAction(lineMissing);
  const responseToApply = lineMissing && needsPrepAction(lineMissing);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-brand-surface shadow-sm",
        isComplete && "border-brand-success/40",
        isPartial && "border-brand-warning/50",
        isPending && "border-brand-neutral",
        responseToApply && "border-brand-secondary/50"
      )}
    >
      {/* En-tête : nom + quantité — scannable en 1 seconde */}
      <div
        className={cn(
          "flex items-start gap-3 border-b border-brand-neutral/70 px-4 py-3",
          isComplete && "bg-brand-success/5",
          isPartial && "bg-brand-warning/5",
          isPending && "bg-brand-background/80"
        )}
      >
        <button
          type="button"
          onClick={onOpenProduct}
          className="shrink-0"
          aria-label={`Voir ${line.designation}`}
        >
          <ProductPhoto
            name={line.designation}
            reference={reference ?? line.reference ?? "?"}
            color={photoColor ?? "#16213E"}
            photoUrls={photoUrls}
            size={mobile ? "md" : "sm"}
            className={mobile ? "h-14 w-14" : undefined}
          />
        </button>

        <button
          type="button"
          onClick={onToggleComplete}
          className={cn(
            "mt-1 flex shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
            mobile ? "h-12 w-12" : "h-10 w-10",
            isComplete
              ? "border-brand-success bg-brand-success text-white"
              : "border-brand-primary/25 bg-brand-surface hover:border-brand-secondary"
          )}
          aria-label={isComplete ? "Décocher" : "Valider la ligne"}
        >
          {isComplete && <Check className={mobile ? "h-5 w-5" : "h-4 w-4"} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            {smartPrep && (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-brand-secondary/15 px-1.5 text-xs font-bold text-brand-secondary">
                {index + 1}
              </span>
            )}
            <button
              type="button"
              onClick={onOpenProduct}
              className={cn(
                "text-left font-bold leading-snug text-brand-primary hover:text-brand-secondary",
                mobile ? "text-lg" : "text-base"
              )}
            >
              {line.designation}
            </button>
          </div>
          {smartPrep && (
            <p className="mt-1 text-xs font-medium text-brand-primary/50">
              Priorité chargement · {priority}
            </p>
          )}
          <PrepPackagingBreakdown
            quantity={line.quantityRequested}
            packSize={packSize}
            className="mt-2"
          />
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-primary/45">
            À préparer
          </p>
          <p
            className={cn(
              "font-bold tabular-nums text-brand-secondary",
              mobile ? "text-3xl" : "text-2xl"
            )}
          >
            {line.quantityRequested}
          </p>
        </div>
      </div>

      {/* Corps : statut + alertes */}
      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              isComplete && "text-brand-success",
              isPartial && "text-brand-warning",
              isPending && "text-brand-primary/70"
            )}
          >
            Préparé
          </span>
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums",
              isComplete && "bg-brand-success/15 text-brand-success",
              isPartial && "bg-brand-warning/15 text-brand-warning",
              isPending && "bg-brand-background text-brand-primary"
            )}
          >
            {line.quantityPrepared} / {line.quantityRequested}
          </span>
          {line.quantityPrepared > 0 && (
            <PrepPackagingBreakdown
              quantity={line.quantityPrepared}
              packSize={packSize}
              compact
            />
          )}
        </div>

        {awaitingCommercial && !isComplete && (
          <span className="inline-flex items-center rounded-full bg-brand-critical/10 px-2.5 py-1 text-xs font-semibold text-brand-critical">
            Manquant déclaré
          </span>
        )}
        {responseToApply && (
          <span className="inline-flex items-center rounded-full bg-brand-secondary/10 px-2.5 py-1 text-xs font-semibold text-brand-secondary">
            Remplacement demandé
          </span>
        )}

        {lineMissing &&
          lineMissing.workflowStatus === "commercial_response" &&
          lineMissing.commercialResponse && (
            <div className="rounded-lg border border-brand-secondary/30 bg-brand-secondary/5 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-secondary">
                <AlertTriangle className="h-3.5 w-3.5" />
                Réponse commerciale
              </p>
              <p className="mt-1 text-sm font-medium text-brand-primary">
                {lineMissing.responseType === "replaced"
                  ? "Remplacer :"
                  : lineMissing.responseType
                    ? `${RESPONSE_TYPE_LABELS[lineMissing.responseType]} :`
                    : "Réponse :"}{" "}
                {lineMissing.commercialResponse}
              </p>
              {lineMissing.respondedBy && lineMissing.respondedAt && (
                <p className="mt-1 text-xs text-brand-primary/50">
                  {lineMissing.respondedBy} ·{" "}
                  {formatMissingTime(lineMissing.respondedAt)}
                </p>
              )}
              {lineMissing.responseType === "replaced" && (
                <Button
                  variant="secondary"
                  size={mobile ? "lg" : "sm"}
                  className={cn("mt-3", mobile && "h-12 w-full text-base")}
                  onClick={onConfirmReplacement}
                >
                  <Check className="h-4 w-4" />
                  Remplacement effectué
                </Button>
              )}
            </div>
          )}

        {lineMissing &&
          lineMissing.workflowStatus === "declared" &&
          !isComplete && (
            <p className="text-xs text-brand-primary/50">
              En attente de réponse commerciale…
            </p>
          )}

        {line.validatedBy && line.validatedAt && isComplete && (
          <p className="text-xs text-brand-primary/45">
            Par {line.validatedBy} · {formatMissingTime(line.validatedAt)}
          </p>
        )}
      </div>

      {/* Actions — zone séparée, grosses cibles tactiles */}
      {!isComplete && (
        <div
          className={cn(
            "border-t border-brand-neutral/70 bg-brand-background/50 px-4 py-3",
            mobile && "space-y-3"
          )}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-primary/45">
            Saisir la quantité
          </p>
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              mobile && "flex-col items-stretch"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center gap-3",
                mobile && "w-full"
              )}
            >
              <button
                type="button"
                onClick={() => onQuantityChange(line.quantityPrepared - 1)}
                className={cn(
                  "flex items-center justify-center rounded-xl border border-brand-neutral bg-brand-surface text-brand-primary active:bg-brand-background",
                  mobile ? "h-14 w-14" : "h-11 w-11"
                )}
                aria-label="Diminuer"
              >
                <Minus className="h-6 w-6" />
              </button>
              <PrepQuantityInput
                value={line.quantityPrepared}
                max={line.quantityRequested}
                mobile={mobile}
                onChange={onQuantityChange}
              />
              <button
                type="button"
                onClick={() => onQuantityChange(line.quantityPrepared + 1)}
                className={cn(
                  "flex items-center justify-center rounded-xl border border-brand-neutral bg-brand-surface text-brand-primary active:bg-brand-background",
                  mobile ? "h-14 w-14" : "h-11 w-11"
                )}
                aria-label="Augmenter"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            <Button
              variant="secondary"
              size={mobile ? "lg" : "md"}
              className={cn(
                "font-semibold",
                mobile ? "h-14 w-full text-base" : "min-h-11 flex-1"
              )}
              onClick={onValidate}
            >
              Valider
            </Button>

            {(isPartial || isPending) && !hasActiveMissing && (
              <Button
                variant="outline"
                size={mobile ? "lg" : "md"}
                className={cn(
                  "border-brand-warning font-semibold text-brand-warning hover:bg-brand-warning/10",
                  mobile ? "h-14 w-full text-base" : "min-h-11 flex-1"
                )}
                onClick={onDeclareMissing}
              >
                <AlertTriangle className="h-4 w-4" />
                Déclarer manquant
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
