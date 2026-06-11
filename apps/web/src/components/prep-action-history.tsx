"use client";

import { formatMissingTime } from "@/lib/mock/missing-workflow";
import type { MockPrepAction } from "@/lib/mock/types";

export function PrepActionHistory({ actions }: { actions: MockPrepAction[] }) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-brand-primary/50">
        Aucune action enregistrée pour le moment.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {actions.map((action) => (
        <li
          key={action.id}
          className="rounded-lg border border-brand-neutral bg-white p-3 text-sm"
        >
          <p className="font-semibold text-brand-primary">{action.designation}</p>
          <p className="mt-1 text-brand-primary/70">
            {action.quantityPrepared} / {action.quantityRequested}
          </p>
          <p className="mt-1 text-xs text-brand-primary/50">
            {action.action === "validated" && "Validé par "}
            {action.action === "replacement" && "Remplacement confirmé par "}
            {action.action === "missing" && "Manquant déclaré par "}
            {action.action === "updated" && "Mis à jour par "}
            <span className="font-medium text-brand-primary">
              {action.userName}
            </span>
            {" · "}
            {formatMissingTime(action.at)}
          </p>
        </li>
      ))}
    </ol>
  );
}
