"use client";

import { useMemo, useState } from "react";
import { Button, Input, Card, CardContent } from "@eventrack/ui";
import { Search } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { getProductPrepPriority } from "@/lib/mock/prep-sorting";

export function PrepPriorityPanel() {
  const { products, updateProductPrepPriority, updateProductPackSize } =
    useMockStore();
  const [query, setQuery] = useState("");
  const [priorityDrafts, setPriorityDrafts] = useState<Record<string, string>>(
    {}
  );
  const [packDrafts, setPackDrafts] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...products].sort(
      (a, b) => getProductPrepPriority(b) - getProductPrepPriority(a)
    );
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.reference.includes(q) ||
        p.category.includes(q)
    );
  }, [products, query]);

  function saveRow(productId: string, priority: number, packSize: number) {
    const pDraft = priorityDrafts[productId];
    const kDraft = packDrafts[productId];
    if (pDraft != null && pDraft !== String(priority)) {
      const value = Number(pDraft);
      if (!Number.isNaN(value)) updateProductPrepPriority(productId, value);
    }
    if (kDraft != null && kDraft !== String(packSize)) {
      const value = Number(kDraft);
      if (!Number.isNaN(value)) updateProductPackSize(productId, value);
    }
    setPriorityDrafts((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setPackDrafts((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="font-semibold text-brand-primary">
            Logistique produit
          </h3>
          <p className="text-sm text-brand-primary/60">
            Priorité de chargement (Préparation intelligente) et conditionnement
            (unités par caisse).
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit…"
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-brand-neutral">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-neutral bg-brand-background/80 text-left text-brand-primary/50">
                <th className="px-3 py-2 font-medium">Produit</th>
                <th className="px-3 py-2 font-medium">Priorité</th>
                <th className="px-3 py-2 font-medium">Cond. / caisse</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const priorityVal = priorityDrafts[p.id] ?? String(p.prepPriority);
                const packVal = packDrafts[p.id] ?? String(p.packSize);
                const dirty =
                  priorityVal !== String(p.prepPriority) ||
                  packVal !== String(p.packSize);
                return (
                  <tr key={p.id} className="border-b border-brand-neutral/50">
                    <td className="px-3 py-2">
                      <span className="font-medium">{p.name}</span>
                      <span className="ml-2 text-brand-primary/40">
                        Réf. {p.reference}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={priorityVal}
                        onChange={(e) =>
                          setPriorityDrafts((prev) => ({
                            ...prev,
                            [p.id]: e.target.value,
                          }))
                        }
                        className="h-9 w-20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={1}
                        max={999}
                        value={packVal}
                        onChange={(e) =>
                          setPackDrafts((prev) => ({
                            ...prev,
                            [p.id]: e.target.value,
                          }))
                        }
                        className="h-9 w-20"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!dirty}
                        onClick={() => saveRow(p.id, p.prepPriority, p.packSize)}
                      >
                        Enregistrer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
