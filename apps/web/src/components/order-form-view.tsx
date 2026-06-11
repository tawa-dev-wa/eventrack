"use client";

import { ORDER_SECTION_LABELS, type OrderSection } from "@eventrack/shared";
import { Button, Input, Textarea } from "@eventrack/ui";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { AccordionItem } from "@/components/accordion";
import { AvailabilityBadge } from "@/components/status-badges";
import { ProductDetailSheet } from "@/components/product-detail-sheet";
import { useMockStore } from "@/lib/mock/store";
import type { MockProduct } from "@/lib/mock/types";

const MVP_SECTIONS: {
  key: string;
  title: string;
  sections: OrderSection[];
  defaultOpen?: boolean;
}[] = [
  {
    key: "deco",
    title: "Décoration & Buffet",
    sections: ["decoration_buffet"],
    defaultOpen: true,
  },
  { key: "table", title: "Matériel de table", sections: ["table_material"] },
  { key: "goutte", title: "Couvert Goutte", sections: ["cutlery_goutte"] },
  {
    key: "vp",
    title: "Couvert Vieux Paris",
    sections: ["cutlery_vieux_paris"],
  },
  {
    key: "linen",
    title: "Linge",
    sections: ["table_linen", "kitchen_linen", "service_linen"],
  },
  {
    key: "drinks",
    title: "Boissons",
    sections: ["soft_drinks", "beers", "wines", "spirits"],
  },
];

export function OrderFormView({ eventId }: { eventId: string }) {
  const {
    getOrderLines,
    getProduct,
    searchProducts,
    addOrderLine,
    updateOrderLineQuantity,
    getLineAvailability,
    updateEventComments,
    getEvent,
  } = useMockStore();

  const event = getEvent(eventId);
  const lines = getOrderLines(eventId);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(
    null
  );
  const [addQty, setAddQty] = useState(1);
  const [addSection, setAddSection] = useState<OrderSection>("decoration_buffet");
  const [remarks, setRemarks] = useState(event?.comments ?? "");
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const results = query.length >= 2 ? searchProducts(query).slice(0, 6) : [];

  function handleAddProduct() {
    if (!selectedProduct) return;
    addOrderLine(eventId, addSection, selectedProduct, addQty);
    setQuery("");
    setSelectedProduct(null);
    setShowResults(false);
    setAddQty(1);
  }

  function saveRemarks() {
    updateEventComments(eventId, remarks);
  }

  function renderSectionTable(sectionKeys: OrderSection[]) {
    const sectionLines = lines.filter((l) => sectionKeys.includes(l.section));
    if (sectionLines.length === 0) {
      return (
        <p className="text-sm text-brand-primary/40">Aucun article dans cette section</p>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-neutral text-left text-brand-primary/50">
              <th className="pb-2 pr-3 font-medium">Réf.</th>
              <th className="pb-2 pr-3 font-medium">Désignation</th>
              <th className="pb-2 pr-3 font-medium">Demandé</th>
              <th className="pb-2 pr-3 font-medium">Dispo</th>
              <th className="pb-2 pr-3 font-medium">Statut</th>
              <th className="pb-2 font-medium">Emplacement</th>
            </tr>
          </thead>
          <tbody>
            {sectionLines.map((line) => {
              const product = getProduct(line.productId);
              const avail = getLineAvailability(
                line.productId,
                line.quantityRequested
              );
              return (
                <tr key={line.id} className="border-b border-brand-neutral/50">
                  <td className="py-2.5 pr-3 text-brand-primary/60">
                    {product?.reference}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-brand-primary">
                    <button
                      type="button"
                      onClick={() => setDetailProductId(line.productId)}
                      className="text-left hover:text-brand-secondary hover:underline"
                    >
                      {line.designation}
                    </button>
                  </td>
                  <td className="py-2.5 pr-3">
                    <input
                      type="number"
                      min={1}
                      value={line.quantityRequested}
                      onChange={(e) =>
                        updateOrderLineQuantity(
                          line.id,
                          Number(e.target.value)
                        )
                      }
                      className="w-16 rounded border border-brand-neutral px-2 py-1 text-center"
                    />
                  </td>
                  <td className="py-2.5 pr-3 text-brand-primary/70">
                    {product?.stockAvailable ?? "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <AvailabilityBadge
                      variant={avail.variant}
                      label={avail.label}
                    />
                  </td>
                  <td className="py-2.5 text-brand-primary/50">
                    {product?.location ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand-secondary/20 bg-brand-secondary/5 px-4 py-3">
        <p className="text-sm font-semibold text-brand-primary">
          Bon de commande — vision commerciale
        </p>
        <p className="text-xs text-brand-primary/60">
          Commande officielle. Aucune modification logistique ici.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-brand-neutral bg-white p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/40" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Rechercher un produit… ex: vase"
            className="pl-9"
          />
          {showResults && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-brand-neutral bg-white shadow-lg">
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProduct(p);
                    setQuery(p.name);
                    setShowResults(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-brand-background"
                >
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-brand-primary/40">
                      Réf. {p.reference}
                    </span>
                  </span>
                  <span className="text-brand-success">{p.stockAvailable} dispo</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <select
          value={addSection}
          onChange={(e) => setAddSection(e.target.value as OrderSection)}
          className="h-10 rounded-md border border-brand-neutral px-3 text-sm"
        >
          {Object.entries(ORDER_SECTION_LABELS)
            .filter(([k]) => k !== "remarks" && k !== "staff")
            .map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
        <Input
          type="number"
          min={1}
          value={addQty}
          onChange={(e) => setAddQty(Number(e.target.value))}
          className="w-20"
        />
        <Button
          variant="secondary"
          onClick={handleAddProduct}
          disabled={!selectedProduct}
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-3">
        {MVP_SECTIONS.map((group) => {
          const count = lines.filter((l) =>
            group.sections.includes(l.section)
          ).length;
          return (
            <AccordionItem
              key={group.key}
              title={group.title}
              count={count}
              defaultOpen={group.defaultOpen}
            >
              {renderSectionTable(group.sections)}
            </AccordionItem>
          );
        })}
      </div>

      <div className="rounded-lg border border-brand-neutral bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-brand-primary">
          Remarques libres
        </h3>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          placeholder="Linge propre et repassé demandé. Prévoir installation avant 16h…"
        />
        <div className="mt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={saveRemarks}>
            Enregistrer les remarques
          </Button>
        </div>
      </div>

      <ProductDetailSheet
        productId={detailProductId}
        onClose={() => setDetailProductId(null)}
      />
    </div>
  );
}
