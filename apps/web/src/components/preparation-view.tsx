"use client";



import { useEffect, useMemo, useState } from "react";

import { Button } from "@eventrack/ui";

import { AlertTriangle, Sparkles } from "lucide-react";

import {

  useMockStore,

  formatDepartureTime,

} from "@/lib/mock/store";

import { prepLineStatus } from "@/lib/mock/preparation";

import { isMissingActive } from "@/lib/mock/missing-workflow";
import type { MockPreparationLine } from "@/lib/mock/types";

import { PrepProgressBar } from "@/components/prep-progress-bar";

import { DeclareMissingModal } from "@/components/declare-missing-modal";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { usePreparer } from "@/lib/mock/preparer-context";
import {
  getProductPrepPriority,
  sortPreparationLinesByLoadingPriority,
} from "@/lib/mock/prep-sorting";
import { PrepLineCard } from "@/components/prep-line-card";
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

          <h2 className="text-2xl font-bold tracking-tight text-brand-primary">
            {event.name}
          </h2>

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
            const lineMissing = getMissingForPrepLine(line.id);
            const product = getProduct(line.productId);
            const packSize = product?.packSize ?? 1;
            const priority = getProductPrepPriority(product);

            return (
              <PrepLineCard
                key={line.id}
                line={line}
                index={index}
                status={status}
                packSize={packSize}
                priority={priority}
                smartPrep={smartPrep}
                mobile={mobile}
                lineMissing={lineMissing}
                onToggleComplete={() => {
                  if (status === "complete") {
                    updatePreparationQuantity(line.id, 0, actor);
                  } else {
                    validatePreparationLine(line.id, actor);
                  }
                }}
                onOpenProduct={() => setProductDetailId(line.productId)}
                onQuantityChange={(qty) =>
                  updatePreparationQuantity(line.id, qty, actor)
                }
                onValidate={() => validatePreparationLine(line.id, actor)}
                onDeclareMissing={() => setMissingLine(line)}
                onConfirmReplacement={() => {
                  if (lineMissing) {
                    confirmMissingReplacement(lineMissing.id, actor);
                  }
                }}
              />
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


