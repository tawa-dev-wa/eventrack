"use client";

import { useEffect } from "react";
import { Button } from "@eventrack/ui";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-navy/50"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-brand-surface shadow-xl sm:max-w-lg sm:rounded-lg"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-brand-neutral px-5 py-4">
          <h2
            id="modal-title"
            className="text-xl font-bold tracking-tight text-brand-primary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-brand-primary/50 hover:bg-brand-background"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-brand-neutral px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel = "Enregistrer",
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <>
      <Button variant="outline" onClick={onCancel} className="min-h-11 flex-1 sm:flex-none">
        Annuler
      </Button>
      <Button
        variant="secondary"
        onClick={onConfirm}
        disabled={loading}
        className="min-h-11 flex-1 sm:flex-none"
      >
        {confirmLabel}
      </Button>
    </>
  );
}
