"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { ProductPhoto } from "@/components/product-photo";
import { AvailabilityBadge } from "@/components/status-badges";
import { useMockStore } from "@/lib/mock/store";
import {
  getProductBreakageStats,
  STOCK_BREAK_LABELS,
} from "@/lib/mock/stock-ops";
import { formatMissingTime } from "@/lib/mock/missing-workflow";
import { cn } from "@eventrack/ui";

export function ProductDetailSheet({
  productId,
  onClose,
}: {
  productId: string | null;
  onClose: () => void;
}) {
  const {
    getProduct,
    getProductAllocations,
    getProductStockAdjustments,
    stockAdjustments,
  } = useMockStore();
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [productId]);

  const product = productId ? getProduct(productId) : null;
  if (!product) return null;

  const photos = product.photoUrls ?? [];
  const allocations = getProductAllocations(product.id).filter(
    (a) => a.status !== "available" && a.status !== "broken"
  );
  const breakage = getProductBreakageStats(stockAdjustments, product.id);
  const recentAdjustments = getProductStockAdjustments(product.id).slice(0, 5);
  const locationParts = product.location.split(" · ");

  return (
    <Modal open={!!productId} onClose={onClose} title={product.name}>
      <div className="space-y-5">
        <ProductPhoto
          name={product.name}
          reference={product.reference}
          color={product.photoColor}
          photoUrls={photos}
          activeIndex={photoIndex}
          size="lg"
          className="w-full"
        />

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setPhotoIndex(index)}
                className={cn(
                  "shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                  photoIndex === index
                    ? "border-brand-secondary"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-16 w-16 object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-brand-primary/60">
          Réf. {product.reference} · {product.category}
        </p>

        <div className="rounded-lg border border-brand-neutral px-3 py-2 text-sm">
          <span className="text-brand-primary/50">Priorité de chargement</span>
          <span className="ml-2 font-bold text-brand-secondary">
            {product.prepPriority}
          </span>
          <span className="ml-1 text-brand-primary/40">/ 100</span>
        </div>

        <div className="rounded-lg border border-brand-neutral px-3 py-2 text-sm">
          <span className="text-brand-primary/50">Conditionnement</span>
          <span className="ml-2 font-bold text-brand-primary">
            {product.packSize > 1
              ? `${product.packSize} unités / caisse`
              : "À l'unité"}
          </span>
        </div>

        <div className="rounded-lg bg-brand-background p-4 text-sm">
          <p className="font-medium text-brand-primary">Emplacement</p>
          <p className="mt-1 text-brand-primary/70">
            {locationParts[0] && <>Zone {locationParts[0]}</>}
          </p>
          {locationParts[1] && (
            <p className="text-brand-primary/70">{locationParts[1]}</p>
          )}
          {locationParts[2] && (
            <p className="text-brand-primary/70">{locationParts[2]}</p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-brand-primary/50">Stock total</dt>
            <dd className="text-lg font-bold">{product.stockTotal}</dd>
          </div>
          <div>
            <dt className="text-brand-primary/50">Disponible</dt>
            <dd className="text-lg font-bold text-brand-success">
              {product.stockAvailable}
            </dd>
          </div>
          <div>
            <dt className="text-brand-primary/50">Réservé</dt>
            <dd className="text-lg font-bold text-brand-alert">
              {product.stockReserved}
            </dd>
          </div>
          <div>
            <dt className="text-brand-primary/50">Cassé</dt>
            <dd className="text-lg font-bold text-brand-critical">
              {product.stockBroken}
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-brand-neutral p-3">
            <p className="text-brand-primary/50">Cassé ce mois-ci</p>
            <p className="text-xl font-bold text-brand-critical">
              {breakage.monthCount}
            </p>
          </div>
          <div className="rounded-lg border border-brand-neutral p-3">
            <p className="text-brand-primary/50">Cassé cette année</p>
            <p className="text-xl font-bold text-brand-critical">
              {breakage.yearCount}
            </p>
          </div>
        </div>

        {allocations.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-brand-primary">
              Actuellement utilisé sur
            </p>
            <ul className="space-y-2">
              {allocations.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-brand-neutral p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{a.eventName}</p>
                    <AvailabilityBadge
                      variant={a.status === "out" ? "secondary" : "warning"}
                      label={a.status === "out" ? "En livraison" : "Réservé"}
                    />
                  </div>
                  <p className="mt-1 text-brand-primary/60">
                    {a.quantity} unité(s)
                    {a.truckName && ` · ${a.truckName}`}
                  </p>
                  {a.expectedReturn && (
                    <p className="mt-1 text-xs text-brand-primary/50">
                      Retour prévu : {a.expectedReturn}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recentAdjustments.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-brand-primary">
              Historique récent
            </p>
            <ul className="space-y-2 text-sm">
              {recentAdjustments.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md bg-brand-background px-3 py-2"
                >
                  <p className="font-medium text-brand-primary">
                    {entry.note ||
                      (entry.type === "add" && `+${entry.quantity} entrepôt`) ||
                      (entry.type === "remove" &&
                        `-${entry.quantity} entrepôt`) ||
                      (entry.type === "broken" &&
                        `${entry.quantity} cassé(s)${
                          entry.context
                            ? ` · ${STOCK_BREAK_LABELS[entry.context]}`
                            : ""
                        }`)}
                  </p>
                  <p className="text-xs text-brand-primary/50">
                    {entry.userName} · {formatMissingTime(entry.at)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
