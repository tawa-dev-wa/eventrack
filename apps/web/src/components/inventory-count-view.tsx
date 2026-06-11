"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@eventrack/ui";
import { CheckCircle2, Info } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { ProductPhoto } from "@/components/product-photo";
import { getCategoryMeta } from "@/lib/category-icons";
import { getExpectedDepotStock, getOnPrestationCount } from "@/lib/inventory";

export function InventoryCountView() {
  const router = useRouter();
  const { getTodayInventoryMission, submitInventorySession } = useMockStore();
  const mission = getTodayInventoryMission();
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const p of mission.products) {
      initial[p.id] = getExpectedDepotStock(p);
    }
    return initial;
  });
  const [done, setDone] = useState(false);

  function setCount(productId: string, value: number) {
    setCounts((prev) => ({ ...prev, [productId]: Math.max(0, value) }));
  }

  function handleSubmit() {
    submitInventorySession(
      mission.products.map((p) => ({
        productId: p.id,
        countedDepot: counts[p.id] ?? 0,
      }))
    );
    setDone(true);
  }

  if (done) {
    return (
      <Card className="border-brand-success/40 bg-brand-success/5">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-14 w-14 text-brand-success" />
          <div>
            <p className="text-xl font-bold text-brand-primary">
              Inventaire enregistré
            </p>
            <p className="mt-1 text-sm text-brand-primary/60">
              Merci — le stock dépôt a été mis à jour.
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-brand-secondary/30 bg-brand-secondary/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" />
        <div className="text-sm text-brand-primary/80">
          <p className="font-semibold text-brand-primary">
            Comptez uniquement le stock au dépôt
          </p>
          <p className="mt-1">
            Ne comptez pas le matériel actuellement en prestation. Comparez
            avec le stock dépôt attendu.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {mission.products.map((product) => {
          const meta = getCategoryMeta(product.category);
          const expected = getExpectedDepotStock(product);
          const onPrestation = getOnPrestationCount(product);
          const counted = counts[product.id] ?? expected;
          const variance = counted - expected;

          return (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex gap-4">
                  <ProductPhoto
                    name={product.name}
                    reference={product.reference}
                    color={product.photoColor}
                    photoUrls={product.photoUrls}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="mt-1 text-sm text-brand-primary/50">
                      Réf. {product.reference} · {product.location}
                    </p>
                    <span
                      className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 border-t border-brand-neutral/60 bg-brand-background/50 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-brand-surface p-2">
                    <p className="text-xs text-brand-primary/45">Stock total</p>
                    <p className="font-bold text-brand-primary">
                      {product.stockTotal}
                    </p>
                  </div>
                  <div className="rounded-lg bg-brand-alert/10 p-2">
                    <p className="text-xs text-brand-primary/45">En prestation</p>
                    <p className="font-bold text-brand-alert">{onPrestation}</p>
                  </div>
                  <div className="rounded-lg bg-brand-success/10 p-2">
                    <p className="text-xs text-brand-primary/45">Dépôt attendu</p>
                    <p className="font-bold text-brand-success">{expected}</p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-primary">
                    Combien voyez-vous réellement au dépôt ?
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-12 w-12 text-xl"
                      onClick={() => setCount(product.id, counted - 1)}
                    >
                      −
                    </Button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={counted}
                      onChange={(e) =>
                        setCount(product.id, Number(e.target.value) || 0)
                      }
                      className="h-14 flex-1 rounded-xl border border-brand-neutral bg-white text-center text-2xl font-bold text-brand-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-12 w-12 text-xl"
                      onClick={() => setCount(product.id, counted + 1)}
                    >
                      +
                    </Button>
                  </div>
                  {variance !== 0 && (
                    <p
                      className={`mt-2 text-sm font-medium ${variance < 0 ? "text-brand-critical" : "text-brand-warning"}`}
                    >
                      Écart constaté : {variance > 0 ? "+" : ""}
                      {variance}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="w-full min-h-12 text-base"
        onClick={handleSubmit}
      >
        Valider l&apos;inventaire
      </Button>
    </div>
  );
}
