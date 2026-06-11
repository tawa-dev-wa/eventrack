"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@eventrack/ui";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Modal, ModalFooter } from "@/components/modal";
import { useMockStore } from "@/lib/mock/store";
import { STOCK_BREAK_LABELS } from "@/lib/mock/stock-ops";
import type { MockProduct, StockBreakOrigin } from "@/lib/mock/types";
import { cn } from "@eventrack/ui";

export function StockManagementPanel({ product }: { product: MockProduct }) {
  const { adjustDepotStock, declareStockBroken, getProductStockAdjustments } =
    useMockStore();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [showBroken, setShowBroken] = useState(false);
  const [brokenQty, setBrokenQty] = useState(1);
  const [brokenOrigin, setBrokenOrigin] =
    useState<StockBreakOrigin>("plonge");
  const [brokenNote, setBrokenNote] = useState("");

  const history = getProductStockAdjustments(product.id).slice(0, 5);

  function clampQty(value: number) {
    return Math.max(1, Math.min(999, value));
  }

  function handleAdjust(delta: number) {
    setError("");
    const result = adjustDepotStock(product.id, delta * qty, note || undefined);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNote("");
  }

  function handleBroken() {
    setError("");
    const result = declareStockBroken(
      product.id,
      brokenQty,
      brokenOrigin,
      brokenNote || undefined
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setShowBroken(false);
    setBrokenQty(1);
    setBrokenNote("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-neutral bg-white p-4">
        <p className="text-sm font-semibold text-brand-primary">
          Ajuster le stock dépôt
        </p>
        <p className="mt-1 text-xs text-brand-primary/50">
          {product.stockAvailable} unité(s) disponibles en entrepôt
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-brand-neutral">
            <button
              type="button"
              onClick={() => setQty(clampQty(qty - 1))}
              className="flex h-11 w-11 items-center justify-center text-brand-primary hover:bg-brand-background"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-4 w-4" />
            </button>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(clampQty(Number(e.target.value) || 1))}
              className="h-11 w-16 border-0 text-center"
            />
            <button
              type="button"
              onClick={() => setQty(clampQty(qty + 1))}
              className="flex h-11 w-11 items-center justify-center text-brand-primary hover:bg-brand-background"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            className="h-11 flex-1 sm:flex-none"
            onClick={() => handleAdjust(1)}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 sm:flex-none"
            onClick={() => handleAdjust(-1)}
          >
            <Minus className="h-4 w-4" />
            Retirer
          </Button>
        </div>

        <div className="mt-3">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motif optionnel (réception, inventaire…)"
          />
        </div>

        <Button
          variant="outline"
          className="mt-3 h-11 w-full border-brand-critical/40 text-brand-critical hover:bg-brand-critical/5"
          onClick={() => {
            setError("");
            setShowBroken(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
          Déclarer cassé
        </Button>

        {error && (
          <p className="mt-3 text-sm font-medium text-brand-critical">{error}</p>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-xl border border-brand-neutral bg-white p-4">
          <p className="text-sm font-semibold text-brand-primary">
            Derniers mouvements
          </p>
          <ul className="mt-3 space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div>
                  <p className="font-medium text-brand-primary">
                    {entry.type === "add" && `+${entry.quantity} entrepôt`}
                    {entry.type === "remove" && `-${entry.quantity} entrepôt`}
                    {entry.type === "broken" &&
                      `${entry.quantity} cassé(s)${
                        entry.context
                          ? ` · ${STOCK_BREAK_LABELS[entry.context]}`
                          : ""
                      }`}
                  </p>
                  {entry.note && (
                    <p className="text-xs text-brand-primary/50">{entry.note}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-brand-primary/40">
                  {entry.userName}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={showBroken}
        onClose={() => setShowBroken(false)}
        title="Déclarer du matériel cassé"
        footer={
          <ModalFooter
            onCancel={() => setShowBroken(false)}
            onConfirm={handleBroken}
            confirmLabel="Confirmer"
          />
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-primary/70">
            {product.name} — retire du stock actif et comptabilise en cassé.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantité</label>
            <Input
              type="number"
              min={1}
              max={product.stockAvailable}
              value={brokenQty}
              onChange={(e) =>
                setBrokenQty(clampQty(Number(e.target.value) || 1))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contexte</label>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(STOCK_BREAK_LABELS) as [
                  StockBreakOrigin,
                  string,
                ][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBrokenOrigin(id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    brokenOrigin === id
                      ? "border-brand-critical bg-brand-critical/10 text-brand-critical"
                      : "border-brand-neutral text-brand-primary/60"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Commentaire</label>
            <Textarea
              value={brokenNote}
              onChange={(e) => setBrokenNote(e.target.value)}
              placeholder="Ex. cassé au lavage, choc en prestation…"
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
