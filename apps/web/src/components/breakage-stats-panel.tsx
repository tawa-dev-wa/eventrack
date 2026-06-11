"use client";

import { Card, CardContent } from "@eventrack/ui";
import { useMockStore } from "@/lib/mock/store";
import { getGlobalBreakageStats, STOCK_BREAK_LABELS } from "@/lib/mock/stock-ops";

export function BreakageStatsPanel() {
  const { stockAdjustments, products } = useMockStore();
  const stats = getGlobalBreakageStats(stockAdjustments, products);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="font-semibold text-brand-primary">Statistiques casse</h3>
          <p className="text-sm text-brand-primary/60">
            Mise à jour en temps réel sur tout le dépôt
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-brand-critical/5 p-4">
            <p className="text-sm text-brand-primary/50">Casse du mois</p>
            <p className="text-2xl font-bold text-brand-critical">
              {stats.monthTotal}
            </p>
          </div>
          <div className="rounded-lg bg-brand-critical/5 p-4">
            <p className="text-sm text-brand-primary/50">Casse de l&apos;année</p>
            <p className="text-2xl font-bold text-brand-critical">
              {stats.yearTotal}
            </p>
          </div>
        </div>
        {stats.mainOrigin && (
          <p className="text-sm text-brand-primary/70">
            Origine principale :{" "}
            <strong>{STOCK_BREAK_LABELS[stats.mainOrigin.origin]}</strong> (
            {stats.mainOrigin.count})
          </p>
        )}
        {stats.topProducts.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-brand-primary">
              Produits les plus cassés (mois)
            </p>
            <ul className="space-y-1 text-sm text-brand-primary/70">
              {stats.topProducts.map(({ product, count }) => (
                <li key={product!.id}>
                  {product!.name} — {count}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
