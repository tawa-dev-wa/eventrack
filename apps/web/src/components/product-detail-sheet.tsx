"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { ProductPhoto } from "@/components/product-photo";
import { AvailabilityBadge } from "@/components/status-badges";
import { useMockStore } from "@/lib/mock/store";
import { formatMissingTime } from "@/lib/mock/missing-workflow";
import { getCategoryMeta } from "@/lib/category-icons";
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
  } = useMockStore();
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [productId]);

  const product = productId ? getProduct(productId) : null;
  if (!product) return null;

  const photos = product.photoUrls ?? [];
  const allocations = getProductAllocations(product.id).filter(
    (a) => a.status !== "available"
  );
  const recentAdjustments = getProductStockAdjustments(product.id).slice(0, 5);
  const locationParts = product.location.split(" · ");
  const meta = getCategoryMeta(product.category);

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
                <img src={url} alt="" className="h-16 w-16 object-cover" />
              </button>
            ))}
          </div>
        )}

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${meta.color}`}
        >
          {meta.emoji} {meta.label}
        </span>

        <p className="text-sm text-brand-primary/60">
          Réf. {product.reference}
        </p>

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

        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-brand-neutral p-3 text-center">
            <dt className="text-brand-primary/50">Stock total</dt>
            <dd className="text-lg font-bold">{product.stockTotal}</dd>
          </div>
          <div className="rounded-lg border border-brand-alert/30 bg-brand-alert/5 p-3 text-center">
            <dt className="text-brand-primary/50">En prestation</dt>
            <dd className="text-lg font-bold text-brand-alert">
              {product.stockReserved}
            </dd>
          </div>
          <div className="rounded-lg border border-brand-success/30 bg-brand-success/5 p-3 text-center">
            <dt className="text-brand-primary/50">Au dépôt</dt>
            <dd className="text-lg font-bold text-brand-success">
              {product.stockAvailable}
            </dd>
          </div>
        </dl>

        {allocations.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-brand-primary">
              Actuellement en prestation
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
                </li>
              ))}
            </ul>
          </div>
        )}

        {recentAdjustments.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-brand-primary">
              Derniers ajustements
            </p>
            <ul className="space-y-2 text-sm">
              {recentAdjustments.map((adj) => (
                <li
                  key={adj.id}
                  className="rounded-lg border border-brand-neutral/60 px-3 py-2"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-brand-primary">
                      {adj.type === "inventory" ? "Inventaire" : "Ajustement"}
                    </span>
                    <span className="text-brand-primary/40">
                      {formatMissingTime(adj.at)}
                    </span>
                  </div>
                  <p className="text-brand-primary/60">
                    {adj.quantity > 0 ? "+" : ""}
                    {adj.quantity} · {adj.userName}
                    {adj.note && ` — ${adj.note}`}
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
