"use client";

import { useEffect, useState } from "react";
import { Button, Input, Textarea } from "@eventrack/ui";
import { Camera, X } from "lucide-react";
import type { MockPreparationLine } from "@/lib/mock/types";
import { Modal, ModalFooter } from "@/components/modal";

interface DeclareMissingModalProps {
  open: boolean;
  line: MockPreparationLine | null;
  onClose: () => void;
  onSubmit: (input: {
    missingQuantity: number;
    comment?: string;
    photoUrl?: string;
  }) => void;
}

export function DeclareMissingModal({
  open,
  line,
  onClose,
  onSubmit,
}: DeclareMissingModalProps) {
  const maxMissing = line
    ? Math.max(1, line.quantityRequested - line.quantityPrepared)
    : 1;

  const [missingQty, setMissingQty] = useState(maxMissing);
  const [comment, setComment] = useState("");
  const [photoName, setPhotoName] = useState<string | null>(null);

  useEffect(() => {
    if (open && line) {
      setMissingQty(Math.max(1, line.quantityRequested - line.quantityPrepared));
      setComment("");
      setPhotoName(null);
    }
  }, [open, line]);

  if (!line) return null;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoName(file.name);
  }

  function handleSubmit() {
    onSubmit({
      missingQuantity: missingQty,
      comment: comment.trim() || undefined,
      photoUrl: photoName ? `mock://photo/${photoName}` : undefined,
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
          onConfirm={handleSubmit}
          confirmLabel="Créer le manquant"
        />
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-brand-background p-4">
          <p className="font-semibold text-brand-primary">
            {line.designation}
            {line.reference && (
              <span className="ml-2 font-normal text-brand-primary/50">
                {line.reference}
              </span>
            )}
          </p>
          <div className="mt-2 flex gap-4 text-sm text-brand-primary/70">
            <span>Demandé : {line.quantityRequested}</span>
            <span>Préparé : {line.quantityPrepared}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-primary">
            Quantité manquante
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={maxMissing}
              value={missingQty}
              onChange={(e) =>
                setMissingQty(
                  Math.max(
                    1,
                    Math.min(maxMissing, Number(e.target.value) || 1)
                  )
                )
              }
              className="h-12 text-lg"
            />
            <span className="text-sm text-brand-primary/50">
              / {maxMissing} max
            </span>
          </div>
          <p className="text-xs text-brand-primary/50">
            Manque : {missingQty} unité{missingQty > 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-primary">
            Commentaire <span className="font-normal">(facultatif)</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ex. introuvable en zone D2…"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-primary">
            Photo <span className="font-normal">(facultatif — Phase 2)</span>
          </label>
          <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-brand-neutral bg-brand-background text-sm text-brand-primary/60 hover:border-brand-secondary hover:text-brand-secondary">
            <Camera className="h-5 w-5" />
            {photoName ?? "Ajouter une photo"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </label>
          {photoName && (
            <p className="flex items-center gap-2 text-xs text-brand-success">
              {photoName}
              <button
                type="button"
                onClick={() => setPhotoName(null)}
                className="text-brand-primary/40 hover:text-brand-critical"
              >
                <X className="h-3 w-3" />
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
