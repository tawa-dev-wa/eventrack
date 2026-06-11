"use client";

import { Input, Textarea } from "@eventrack/ui";
import { Modal, ModalFooter } from "@/components/modal";
import type { useMockStore } from "@/lib/mock/store";

export function CreateMissingModal({
  open,
  onClose,
  events,
  products,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  events: ReturnType<typeof useMockStore>["events"];
  products: ReturnType<typeof useMockStore>["products"];
  onCreate: ReturnType<typeof useMockStore>["createMissing"];
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const productId = String(fd.get("productId"));
    const product = products.find((p) => p.id === productId);
    onCreate({
      eventId: String(fd.get("eventId")),
      productId: productId || undefined,
      designation: product?.name ?? String(fd.get("designation")),
      reference: product?.reference,
      quantityRequested: Number(fd.get("quantityRequested")),
      quantityFound: Number(fd.get("quantityFound")),
      comment: String(fd.get("comment") || ""),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Déclarer un manquant"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={() =>
            (
              document.getElementById("missing-form") as HTMLFormElement | null
            )?.requestSubmit()
          }
          confirmLabel="Créer le ticket"
        />
      }
    >
      <form id="missing-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Événement</label>
          <select
            name="eventId"
            required
            className="h-11 w-full rounded-md border border-brand-neutral px-3 text-sm"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Produit</label>
          <select
            name="productId"
            className="h-11 w-full rounded-md border border-brand-neutral px-3 text-sm"
          >
            <option value="">— Autre —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Réf. {p.reference})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Demandé</label>
            <Input
              name="quantityRequested"
              type="number"
              min={1}
              required
              defaultValue={12}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Trouvé</label>
            <Input
              name="quantityFound"
              type="number"
              min={0}
              required
              defaultValue={10}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Commentaire</label>
          <Textarea name="comment" rows={2} placeholder="Détails…" />
        </div>
      </form>
    </Modal>
  );
}
