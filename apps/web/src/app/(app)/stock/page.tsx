"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Input,
} from "@eventrack/ui";
import { Search } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { BreakageStatsPanel } from "@/components/breakage-stats-panel";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { ProductPhoto } from "@/components/product-photo";
import { Tabs } from "@/components/tabs";
import { AvailabilityBadge } from "@/components/status-badges";
import { StockManagementPanel } from "@/components/stock-management-panel";
import { PrepPriorityPanel } from "@/components/prep-priority-panel";

export default function StockPage() {
  const [tab, setTab] = useState("catalog");
  const [query, setQuery] = useState("");
  const [stockQuery, setStockQuery] = useState("vase");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    products,
    searchProducts,
    getProduct,
    getProductAllocations,
  } = useMockStore();

  const catalogProducts =
    query.length >= 1 ? searchProducts(query) : products;
  const stockProduct =
    searchProducts(stockQuery)[0] ?? products.find((p) => p.reference === "301");
  const allocations = stockProduct
    ? getProductAllocations(stockProduct.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">
          Matériel & Stock
        </h1>
        <p className="text-sm text-brand-primary/60">
          Catalogue et disponibilité en temps réel (mock)
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "catalog", label: "Catalogue" },
          { id: "stock", label: "Gestion stock" },
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
            {catalogProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className="rounded-lg border border-brand-neutral bg-white p-4 text-left transition-colors hover:border-brand-secondary/30 hover:shadow-sm"
              >
                <ProductPhoto
                  name={p.name}
                  reference={p.reference}
                  color={p.photoColor}
                  photoUrls={p.photoUrls}
                  size="lg"
                  className="mb-3"
                />
                <p className="font-semibold text-brand-primary">{p.name}</p>
                <p className="text-sm text-brand-primary/50">Réf. {p.reference}</p>
                <p className="mt-2 text-sm font-medium text-brand-success">
                  {p.stockAvailable} disponibles
                </p>
                <p className="mt-1 text-xs text-brand-primary/40">{p.location}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "stock" && (
        <div className="space-y-4">
          <BreakageStatsPanel />
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
                className="text-left text-lg font-bold text-brand-primary hover:text-brand-secondary hover:underline"
              >
                {stockProduct.name}
                <span className="ml-2 text-sm font-normal text-brand-primary/50">
                  Réf. {stockProduct.reference}
                </span>
              </button>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">Total actif</p>
                    <p className="text-2xl font-bold">{stockProduct.stockTotal}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">En stock</p>
                    <p className="text-2xl font-bold text-brand-success">
                      {stockProduct.stockAvailable}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">Réservé / sorti</p>
                    <p className="text-2xl font-bold text-brand-alert">
                      {stockProduct.stockReserved}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-brand-primary/50">Cassés</p>
                    <p className="text-2xl font-bold text-brand-critical">
                      {stockProduct.stockBroken}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <StockManagementPanel product={stockProduct} />

              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-neutral bg-brand-background/50 text-left text-brand-primary/50">
                        <th className="px-4 py-3">Lot</th>
                        <th className="px-4 py-3">Qté</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Événement</th>
                        <th className="px-4 py-3">Retour prévu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.length > 0 ? (
                        allocations.map((a) => (
                          <tr key={a.id} className="border-b border-brand-neutral/50">
                            <td className="px-4 py-3">
                              {a.status === "available"
                                ? "Stock dépôt"
                                : a.status === "broken"
                                  ? "Cassés"
                                  : a.eventName?.split(" — ")[0]}
                            </td>
                            <td className="px-4 py-3">{a.quantity}</td>
                            <td className="px-4 py-3">
                              <AvailabilityBadge
                                variant={
                                  a.status === "available"
                                    ? "success"
                                    : a.status === "broken"
                                      ? "critical"
                                      : a.status === "out"
                                        ? "secondary"
                                        : "warning"
                                }
                                label={
                                  a.status === "available"
                                    ? "Disponible"
                                    : a.status === "broken"
                                      ? "Cassé"
                                      : a.status === "out"
                                        ? "En livraison"
                                        : "Réservé"
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-brand-primary/70">
                              {a.status === "broken"
                                ? "Hors stock"
                                : (a.eventName ?? "—")}
                              {a.truckName && (
                                <span className="block text-xs text-brand-primary/40">
                                  {a.truckName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-brand-primary/70">
                              {a.expectedReturn ?? "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-brand-primary/40">
                            {stockProduct.stockAvailable} unités en stock dépôt ·{" "}
                            {stockProduct.stockReserved} réservées
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

      {tab === "priorities" && <PrepPriorityPanel />}

      <ProductDetailSheet
        productId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
