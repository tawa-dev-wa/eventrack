"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PageHeader,
  Badge,
} from "@eventrack/ui";
import { Search, Gauge, Package } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { ProductPhoto } from "@/components/product-photo";
import { Tabs } from "@/components/tabs";
import { AvailabilityBadge } from "@/components/status-badges";
import { PrepPriorityPanel } from "@/components/prep-priority-panel";
import { getCategoryMeta } from "@/lib/category-icons";
import { formatShortDate } from "@/lib/mock/store";

export default function StockPage() {
  const [tab, setTab] = useState("catalog");
  const [query, setQuery] = useState("");
  const [stockQuery, setStockQuery] = useState("vase");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    products,
    searchProducts,
    getProductAllocations,
    getStockReliability,
    getInventoryHistory,
  } = useMockStore();

  const catalogProducts =
    query.length >= 1 ? searchProducts(query) : products;
  const stockProduct =
    searchProducts(stockQuery)[0] ?? products.find((p) => p.reference === "301");
  const allocations = stockProduct
    ? getProductAllocations(stockProduct.id)
    : [];
  const reliability = getStockReliability();
  const history = getInventoryHistory();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matériel & Stock"
        description="Catalogue visuel et suivi du dépôt"
        meta={
          <Link href="/inventory">
            <Badge variant="secondary" className="gap-1.5 text-sm">
              <Gauge className="h-3.5 w-3.5" />
              Fiabilité du stock : {reliability} %
            </Badge>
          </Link>
        }
      />

      <Tabs
        tabs={[
          { id: "catalog", label: "Catalogue" },
          { id: "stock", label: "Où est mon matériel ?" },
          { id: "history", label: "Historique inventaire" },
          { id: "priorities", label: "Logistique produit" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "catalog" && (
        <>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher réf. ou nom…"
              className="pl-9"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalogProducts.map((p) => {
              const meta = getCategoryMeta(p.category);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className="overflow-hidden rounded-xl border border-brand-neutral bg-white text-left shadow-sm transition-all hover:border-brand-secondary/30 hover:shadow-md"
                >
                  <ProductPhoto
                    name={p.name}
                    reference={p.reference}
                    color={p.photoColor}
                    photoUrls={p.photoUrls}
                    size="lg"
                    className="rounded-none"
                  />
                  <div className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.color}`}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                    <p className="mt-2 font-semibold text-brand-primary">
                      {p.name}
                    </p>
                    <p className="text-sm text-brand-primary/50">
                      Réf. {p.reference}
                    </p>
                    <p className="mt-2 text-sm font-medium text-brand-success">
                      {p.stockAvailable} au dépôt
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {tab === "stock" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/40" />
            <Input
              value={stockQuery}
              onChange={(e) => setStockQuery(e.target.value)}
              placeholder="Où est mon matériel ? ex: vase noir"
              className="pl-9"
            />
          </div>

          {stockProduct && (
            <>
              <button
                type="button"
                onClick={() => setSelectedId(stockProduct.id)}
                className="flex items-center gap-4 text-left"
              >
                <ProductPhoto
                  name={stockProduct.name}
                  reference={stockProduct.reference}
                  color={stockProduct.photoColor}
                  photoUrls={stockProduct.photoUrls}
                  size="md"
                />
                <div>
                  <p className="text-lg font-bold text-brand-primary hover:text-brand-secondary">
                    {stockProduct.name}
                  </p>
                  <p className="text-sm text-brand-primary/50">
                    Réf. {stockProduct.reference}
                  </p>
                </div>
              </button>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">Stock total</p>
                    <p className="text-2xl font-bold">{stockProduct.stockTotal}</p>
                  </CardContent>
                </Card>
                <Card className="border-brand-alert/20 bg-brand-alert/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">En prestation</p>
                    <p className="text-2xl font-bold text-brand-alert">
                      {stockProduct.stockReserved}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-brand-success/20 bg-brand-success/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">Au dépôt</p>
                    <p className="text-2xl font-bold text-brand-success">
                      {stockProduct.stockAvailable}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-neutral bg-brand-background/50 text-left text-brand-primary/50">
                        <th className="px-4 py-3">Lot</th>
                        <th className="px-4 py-3">Qté</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Événement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.length > 0 ? (
                        allocations.map((a) => (
                          <tr key={a.id} className="border-b border-brand-neutral/50">
                            <td className="px-4 py-3">
                              {a.status === "available"
                                ? "Stock dépôt"
                                : a.eventName?.split(" — ")[0]}
                            </td>
                            <td className="px-4 py-3">{a.quantity}</td>
                            <td className="px-4 py-3">
                              <AvailabilityBadge
                                variant={
                                  a.status === "available"
                                    ? "success"
                                    : a.status === "out"
                                      ? "secondary"
                                      : "warning"
                                }
                                label={
                                  a.status === "available"
                                    ? "Disponible"
                                    : a.status === "out"
                                      ? "En livraison"
                                      : "Réservé"
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-brand-primary/70">
                              {a.eventName ?? "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-brand-primary/40">
                            {stockProduct.stockAvailable} unités au dépôt
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          <Link
            href="/inventory"
            className="flex items-center gap-3 rounded-xl border border-brand-secondary/30 bg-brand-secondary/5 p-4 transition-colors hover:bg-brand-secondary/10"
          >
            <Package className="h-8 w-8 text-brand-secondary" />
            <div>
              <p className="font-semibold text-brand-primary">
                Lancer l&apos;inventaire du jour
              </p>
              <p className="text-sm text-brand-primary/60">
                Comptage tournant — dépôt uniquement
              </p>
            </div>
          </Link>
          {history.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="text-lg">{session.zoneLabel}</CardTitle>
                <p className="text-sm text-brand-primary/50">
                  {formatShortDate(session.date)} · {session.userName}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {session.lines.map((line) => (
                  <div
                    key={line.productId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-neutral/60 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{line.productName}</span>
                    <span className="text-brand-primary/50">
                      Théorique {line.expectedDepot} → Réel {line.countedDepot}
                    </span>
                    <span
                      className={
                        line.variance === 0
                          ? "font-semibold text-brand-success"
                          : "font-semibold text-brand-critical"
                      }
                    >
                      {line.variance === 0
                        ? "OK"
                        : `Écart ${line.variance > 0 ? "+" : ""}${line.variance}`}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "priorities" && <PrepPriorityPanel />}

      <ProductDetailSheet
        productId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
