"use client";

import Link from "next/link";
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Badge } from "@eventrack/ui";
import { Clock, History } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { InventoryCountView } from "@/components/inventory-count-view";
import { formatShortDate } from "@/lib/mock/store";

export default function InventoryPage() {
  const { getTodayInventoryMission, getInventoryHistory, getStockReliability } =
    useMockStore();
  const mission = getTodayInventoryMission();
  const history = getInventoryHistory();
  const reliability = getStockReliability();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaire"
        description="Inventaire tournant — comptage dépôt uniquement"
        meta={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              Fiabilité du stock : {reliability} %
            </Badge>
            <span className="text-sm text-brand-primary/50">
              {mission.emoji} Zone {mission.zoneLabel}
            </span>
          </div>
        }
      />

      <Card className="border-brand-secondary/25 bg-gradient-to-br from-brand-secondary/10 to-transparent">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-secondary">
              Mission du jour
            </p>
            <p className="mt-1 text-xl font-bold text-brand-primary">
              {mission.emoji} {mission.zoneLabel}
            </p>
            <p className="mt-1 text-sm text-brand-primary/60">
              {mission.productCount} références à compter
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-brand-surface px-4 py-3 shadow-sm">
            <Clock className="h-5 w-5 text-brand-secondary" />
            <div>
              <p className="text-xs text-brand-primary/45">Temps estimé</p>
              <p className="font-bold text-brand-primary">
                {mission.estimatedMinutes} min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryCountView />

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-brand-secondary" />
              <CardTitle>Historique inventaire</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.slice(0, 5).map((session) => {
              const gaps = session.lines.filter((l) => l.variance !== 0).length;
              return (
                <div
                  key={session.id}
                  className="rounded-lg border border-brand-neutral p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-brand-primary">
                      {session.zoneLabel}
                    </p>
                    <span className="text-xs text-brand-primary/45">
                      {formatShortDate(session.date)} · {session.userName}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-primary/60">
                    {session.lines.length} références ·{" "}
                    {gaps === 0
                      ? "Aucun écart"
                      : `${gaps} écart${gaps > 1 ? "s" : ""}`}
                  </p>
                  <Link
                    href="/stock?tab=history"
                    className="mt-2 inline-block text-xs font-medium text-brand-secondary hover:underline"
                  >
                    Voir le détail
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
