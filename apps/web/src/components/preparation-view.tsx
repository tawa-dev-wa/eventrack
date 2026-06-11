"use client";



import { useEffect, useMemo, useState } from "react";

import { Button } from "@eventrack/ui";

import { Check, Minus, Plus, AlertTriangle, Sparkles } from "lucide-react";

import {

  useMockStore,

  formatDepartureTime,

} from "@/lib/mock/store";

import { prepLineStatus } from "@/lib/mock/preparation";

import {

  formatMissingTime,

  isMissingActive,

  needsCommercialAction,

  needsPrepAction,

  RESPONSE_TYPE_LABELS,

} from "@/lib/mock/missing-workflow";

import type { MockPreparationLine } from "@/lib/mock/types";

import { PrepProgressBar } from "@/components/prep-progress-bar";

import { DeclareMissingModal } from "@/components/declare-missing-modal";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { usePreparer } from "@/lib/mock/preparer-context";
import {
  getProductPrepPriority,
  sortPreparationLinesByLoadingPriority,
} from "@/lib/mock/prep-sorting";
import { PrepPackagingBreakdown } from "@/components/prep-packaging-breakdown";
import { PrepQuantityInput } from "@/components/prep-quantity-input";
import { cn } from "@eventrack/ui";



export function PreparationView({

  eventId,

  mobile = false,

  interim = false,

  defaultSmartPrep = false,

}: {

  eventId: string;

  mobile?: boolean;

  interim?: boolean;

  defaultSmartPrep?: boolean;

}) {

  const {

    getEvent,

    getProduct,

    getPreparationLines,

    getEventPrepProgress,

    getEventMissingSummary,

    getMissingForPrepLine,

    updatePreparationQuantity,

    validatePreparationLine,

    createMissingFromPrep,

    confirmMissingReplacement,

    syncPreparationFromOrder,

  } = useMockStore();

  const { name: preparerName } = usePreparer();
  const actor = preparerName || "Kevin";

  const [missingLine, setMissingLine] = useState<MockPreparationLine | null>(
    null
  );
  const [productDetailId, setProductDetailId] = useState<string | null>(null);
  const [smartPrep, setSmartPrep] = useState(defaultSmartPrep);



  const event = getEvent(eventId);

  const lines = getPreparationLines(eventId);

  const displayLines = useMemo(() => {
    if (!smartPrep) return lines;
    return sortPreparationLinesByLoadingPriority(lines, getProduct);
  }, [lines, smartPrep, getProduct]);

  const progress = getEventPrepProgress(eventId);

  const missingSummary = getEventMissingSummary(eventId);



  useEffect(() => {

    syncPreparationFromOrder(eventId);

  }, [eventId, syncPreparationFromOrder]);



  if (!event) return null;



  return (

    <div className={cn("space-y-4", mobile && "pb-8")}>

      {mobile && !interim && (

        <div className="rounded-lg border border-brand-neutral bg-white p-4">

          <h2 className="text-lg font-bold text-brand-primary">{event.name}</h2>

          <p className="mt-1 text-sm font-medium text-brand-secondary">

            Départ camion : {formatDepartureTime(event.departureTime)}

          </p>

          <div className="mt-3">

            <PrepProgressBar progress={progress} />

          </div>

        </div>

      )}



      {!mobile && (

        <div className="rounded-lg border border-brand-neutral bg-white p-4">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <p className="text-sm text-brand-primary/60">

              Vision terrain — le bon de commande commercial n&apos;est jamais

              modifié ici.

            </p>

            <Button

              variant={smartPrep ? "secondary" : "outline"}

              size="sm"

              onClick={() => setSmartPrep((v) => !v)}

            >

              <Sparkles className="h-4 w-4" />

              Préparation intelligente

            </Button>

          </div>

          {smartPrep && (

            <p className="mt-2 text-xs text-brand-secondary">

              Ordre de chargement palette — du plus lourd (100) au plus fragile

              (10).

            </p>

          )}

          <div className="mt-3">

            <PrepProgressBar progress={progress} />

          </div>

        </div>

      )}



      {mobile && (

        <Button

          variant={smartPrep ? "secondary" : "outline"}

          size="sm"

          className="w-full"

          onClick={() => setSmartPrep((v) => !v)}

        >

          <Sparkles className="h-4 w-4" />

          Préparation intelligente

        </Button>

      )}



      {(missingSummary.awaitingCommercial > 0 ||

        missingSummary.responsesToApply > 0) && (

        <div className="space-y-2">

          {missingSummary.awaitingCommercial > 0 && (

            <div className="flex items-center gap-2 rounded-lg border border-brand-warning/40 bg-brand-warning/5 px-4 py-3 text-sm font-medium text-brand-warning">

              <AlertTriangle className="h-4 w-4 shrink-0" />

              Actions en attente du commercial :{" "}

              {missingSummary.awaitingCommercial}

            </div>

          )}

          {missingSummary.responsesToApply > 0 && (

            <div className="flex items-center gap-2 rounded-lg border border-brand-secondary/40 bg-brand-secondary/5 px-4 py-3 text-sm font-medium text-brand-secondary">

              <AlertTriangle className="h-4 w-4 shrink-0" />

              Réponses commerciales à appliquer :{" "}

              {missingSummary.responsesToApply}

            </div>

          )}

        </div>

      )}



      <div className="space-y-3">

        {displayLines.length === 0 ? (

          <p className="text-sm text-brand-primary/50">

            Aucune ligne à préparer — ajoutez des articles au bon de commande.

          </p>

        ) : (

          displayLines.map((line, index) => {

            const status = prepLineStatus(line);

            const isComplete = status === "complete";

            const isPartial = status === "partial";

            const isPending = status === "pending";

            const lineMissing = getMissingForPrepLine(line.id);

            const hasActiveMissing = lineMissing !== undefined;

            const awaitingCommercial =

              lineMissing && needsCommercialAction(lineMissing);

            const responseToApply =

              lineMissing && needsPrepAction(lineMissing);

            const priority = getProductPrepPriority(getProduct(line.productId));
            const product = getProduct(line.productId);
            const packSize = product?.packSize ?? 1;



            return (

              <div

                key={line.id}

                className={cn(

                  "rounded-lg border bg-white p-4",

                  isComplete && "border-brand-success/30 bg-brand-success/5",

                  isPartial && "border-brand-warning/40 bg-brand-warning/5",

                  isPending && "border-brand-neutral",

                  responseToApply && "border-brand-secondary/50"

                )}

              >

                <div className="flex items-start gap-3">

                  <button

                    type="button"

                    onClick={() => {

                      if (isComplete) {

                        updatePreparationQuantity(line.id, 0, actor);

                      } else {

                        validatePreparationLine(line.id, actor);

                      }

                    }}

                    className={cn(

                      "mt-0.5 flex shrink-0 items-center justify-center rounded border-2 transition-colors",

                      mobile ? "h-11 w-11" : "h-7 w-7",

                      isComplete

                        ? "border-brand-success bg-brand-success text-white"

                        : "border-brand-primary/30 bg-white hover:border-brand-secondary"

                    )}

                    aria-label={

                      isComplete ? "Décocher" : "Valider la ligne"

                    }

                  >

                    {isComplete && <Check className="h-4 w-4" />}

                  </button>



                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-start justify-between gap-2">

                      <div>

                        {smartPrep && (

                          <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-brand-secondary/10 px-1.5 text-xs font-bold text-brand-secondary">

                            {index + 1}

                          </span>

                        )}

                        <button
                          type="button"
                          onClick={() => setProductDetailId(line.productId)}
                          className={cn(
                            "text-left font-semibold text-brand-primary hover:text-brand-secondary hover:underline",
                            mobile && "text-base"
                          )}
                        >
                          {line.designation}
                          <span className="ml-2 font-normal text-brand-primary/50">
                            × {line.quantityRequested}
                          </span>
                        </button>

                      </div>

                      {smartPrep && (

                        <span className="shrink-0 rounded-full bg-brand-background px-2 py-0.5 text-xs font-medium text-brand-primary/60">

                          Priorité {priority}

                        </span>

                      )}

                    </div>



                    <div className="mt-2 space-y-2">

                      <PrepPackagingBreakdown

                        quantity={line.quantityRequested}

                        packSize={packSize}

                      />

                      <div>

                        <span

                          className={cn(

                            "text-sm font-bold",

                            isComplete && "text-brand-success",

                            isPartial && "text-brand-warning",

                            isPending && "text-brand-critical"

                          )}

                        >

                          Préparé : {line.quantityPrepared}

                        </span>

                        {line.quantityPrepared > 0 && (

                          <PrepPackagingBreakdown

                            quantity={line.quantityPrepared}

                            packSize={packSize}

                            compact

                            className="mt-1"

                          />

                        )}

                      </div>

                      {isComplete && (

                        <span className="rounded-full bg-brand-success/10 px-2 py-0.5 text-xs font-medium text-brand-success">

                          {line.quantityPrepared} / {line.quantityRequested}

                        </span>

                      )}

                      {awaitingCommercial && !isComplete && (

                        <span className="rounded-full bg-brand-critical/10 px-2 py-0.5 text-xs font-medium text-brand-critical">

                          Manquant déclaré

                        </span>

                      )}

                      {responseToApply && (

                        <span className="rounded-full bg-brand-secondary/10 px-2 py-0.5 text-xs font-medium text-brand-secondary">

                          Remplacement demandé

                        </span>

                      )}

                    </div>



                    {lineMissing &&

                      lineMissing.workflowStatus === "commercial_response" &&

                      lineMissing.commercialResponse && (

                        <div className="mt-3 rounded-lg border border-brand-secondary/30 bg-brand-secondary/5 p-3">

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

                              Réponse de {lineMissing.respondedBy} ·{" "}

                              {formatMissingTime(lineMissing.respondedAt)}

                            </p>

                          )}

                          {lineMissing.responseType === "replaced" && (

                            <Button

                              variant="secondary"

                              size={mobile ? "lg" : "sm"}

                              className={cn(

                                "mt-3",

                                mobile && "h-12 w-full text-base"

                              )}

                              onClick={() =>

                                confirmMissingReplacement(lineMissing.id, actor)

                              }

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

                        <p className="mt-2 text-xs text-brand-primary/50">

                          En attente de réponse commerciale…

                        </p>

                      )}



                    {line.validatedBy && line.validatedAt && isComplete && (

                      <p className="mt-2 text-xs text-brand-primary/50">

                        Préparé par {line.validatedBy} ·{" "}

                        {formatMissingTime(line.validatedAt)}

                      </p>

                    )}



                    {!isComplete && (

                      <div

                        className={cn(

                          "mt-3 flex flex-wrap items-center gap-2",

                          mobile && "flex-col items-stretch"

                        )}

                      >

                        <div

                          className={cn(

                            "flex items-center gap-2",

                            mobile && "justify-center"

                          )}

                        >

                          <button

                            type="button"

                            onClick={() =>

                              updatePreparationQuantity(
                                line.id,
                                line.quantityPrepared - 1,
                                actor
                              )

                            }

                            className={cn(

                              "flex items-center justify-center rounded-lg border border-brand-neutral bg-white text-brand-primary hover:bg-brand-background",

                              mobile ? "h-12 w-12" : "h-9 w-9"

                            )}

                            aria-label="Diminuer"

                          >

                            <Minus className="h-5 w-5" />

                          </button>

                          <PrepQuantityInput
                            value={line.quantityPrepared}
                            max={line.quantityRequested}
                            mobile={mobile}
                            onChange={(qty) =>
                              updatePreparationQuantity(line.id, qty, actor)
                            }
                          />

                          <button

                            type="button"

                            onClick={() =>

                              updatePreparationQuantity(
                                line.id,
                                line.quantityPrepared + 1,
                                actor
                              )

                            }

                            className={cn(

                              "flex items-center justify-center rounded-lg border border-brand-neutral bg-white text-brand-primary hover:bg-brand-background",

                              mobile ? "h-12 w-12" : "h-9 w-9"

                            )}

                            aria-label="Augmenter"

                          >

                            <Plus className="h-5 w-5" />

                          </button>

                        </div>



                        <Button

                          variant="secondary"

                          size={mobile ? "lg" : "sm"}

                          className={cn(mobile && "h-12 w-full text-base")}

                          onClick={() => validatePreparationLine(line.id, actor)}

                        >

                          Valider

                        </Button>



                        {(isPartial || isPending) && !hasActiveMissing && (

                          <Button

                            variant="outline"

                            size={mobile ? "lg" : "sm"}

                            className={cn(

                              "border-brand-warning text-brand-warning hover:bg-brand-warning/10",

                              mobile && "h-12 w-full text-base"

                            )}

                            onClick={() => setMissingLine(line)}

                          >

                            <AlertTriangle className="h-4 w-4" />

                            Déclarer manquant

                          </Button>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              </div>

            );

          })

        )}

      </div>



      <ProductDetailSheet
        productId={productDetailId}
        onClose={() => setProductDetailId(null)}
      />

      <DeclareMissingModal

        open={missingLine !== null}

        line={missingLine}

        onClose={() => setMissingLine(null)}

        onSubmit={(input) => {

          if (!missingLine) return;

          createMissingFromPrep({

            prepLineId: missingLine.id,

            preparedBy: actor,

            ...input,

          });

        }}

      />

    </div>

  );

}


