"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Card, CardContent } from "@eventrack/ui";
import { Plus } from "lucide-react";
import type { MissingResponseType } from "@eventrack/shared";
import { useMockStore } from "@/lib/mock/store";
import { MissingStatusBadge } from "@/components/status-badges";
import { Modal } from "@/components/modal";
import { cn } from "@eventrack/ui";
import { missingQuantity } from "@/lib/mock/missing-workflow";
import type { MissingWorkflowStatus } from "@/lib/mock/types";
import { useIsMobile } from "@/lib/use-is-mobile";
import { MissingDetailPanel } from "./missing-detail-panel";

const CreateMissingModal = dynamic(
  () =>
    import("./create-missing-modal").then((m) => m.CreateMissingModal),
  { ssr: false }
);

type Filter = MissingWorkflowStatus | "active" | "all";

export function MissingPageClient() {
  const { missingItems, events, products, createMissing, respondToMissing } =
    useMockStore();
  const isMobile = useIsMobile();

  const [filter, setFilter] = useState<Filter>("active");
  const [selectedId, setSelectedId] = useState(missingItems[0]?.id ?? "");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [responseType, setResponseType] =
    useState<MissingResponseType>("replaced");
  const [responseComment, setResponseComment] = useState("");

  const filtered = missingItems.filter((m) => {
    if (filter === "all") return true;
    if (filter === "active") return m.workflowStatus !== "closed";
    return m.workflowStatus === filter;
  });

  const selected =
    missingItems.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (selected && selected.id !== selectedId) {
      setSelectedId(selected.id);
    }
  }, [filter, selected, selectedId]);

  function handleRespond() {
    if (!selected || !responseComment.trim()) return;
    respondToMissing(selected.id, responseType, responseComment.trim());
    setResponseComment("");
    if (isMobile) setShowDetail(false);
  }

  function openDetail(id: string) {
    setSelectedId(id);
    setResponseComment("");
    if (isMobile) setShowDetail(true);
  }

  const filterTabs: { id: Filter; label: string }[] = [
    {
      id: "active",
      label: `Actifs (${missingItems.filter((m) => m.workflowStatus !== "closed").length})`,
    },
    {
      id: "declared",
      label: `Déclarés (${missingItems.filter((m) => m.workflowStatus === "declared").length})`,
    },
    {
      id: "commercial_response",
      label: `Réponses (${missingItems.filter((m) => m.workflowStatus === "commercial_response").length})`,
    },
    { id: "closed", label: "Clos" },
    { id: "all", label: "Tous" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-primary md:text-2xl">
            Manquants
          </h1>
          <p className="text-sm text-brand-primary/60">
            Suivi et réponses commerciales
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11 touch-manipulation"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="h-4 w-4" />
          Déclarer un manquant
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "shrink-0 touch-manipulation rounded-full px-4 py-2 text-sm font-medium",
              filter === id
                ? "bg-brand-secondary text-white"
                : "bg-brand-neutral/50 text-brand-primary/60"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-brand-primary/50">Aucun manquant.</p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openDetail(m.id)}
                className="w-full touch-manipulation rounded-lg border border-brand-neutral bg-white p-4 text-left active:bg-brand-background"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-brand-primary">
                      {m.designation}
                    </p>
                    <p className="mt-1 text-sm text-brand-primary/50">
                      {m.eventName.split(" — ")[0]}
                    </p>
                    <p className="mt-1 text-sm text-brand-critical">
                      Manque {missingQuantity(m)} · {m.createdBy}
                    </p>
                  </div>
                  <MissingStatusBadge status={m.workflowStatus} />
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-brand-neutral bg-brand-background/50 text-left text-brand-primary/50">
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3">Événement</th>
                    <th className="px-4 py-3">Manque</th>
                    <th className="px-4 py-3">Créé par</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className={cn(
                        "cursor-pointer border-b border-brand-neutral/50 hover:bg-brand-background/50",
                        selected?.id === m.id && "bg-brand-secondary/5"
                      )}
                    >
                      <td className="px-4 py-3 font-medium">
                        {m.designation}
                        {m.reference && (
                          <span className="ml-1 text-brand-primary/40">
                            · Réf {m.reference}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-brand-primary/70">
                        {m.eventName.split(" — ")[0]}
                      </td>
                      <td className="px-4 py-3">{missingQuantity(m)}</td>
                      <td className="px-4 py-3 text-brand-primary/50">
                        {m.createdBy}
                      </td>
                      <td className="px-4 py-3">
                        <MissingStatusBadge status={m.workflowStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {selected && (
            <Card>
              <CardContent className="p-5">
                <MissingDetailPanel
                  selected={selected}
                  responseType={responseType}
                  responseComment={responseComment}
                  onResponseTypeChange={setResponseType}
                  onResponseCommentChange={setResponseComment}
                  onRespond={handleRespond}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isMobile && selected && (
        <Modal
          open={showDetail}
          onClose={() => setShowDetail(false)}
          title={selected.designation}
        >
          <MissingDetailPanel
            selected={selected}
            responseType={responseType}
            responseComment={responseComment}
            onResponseTypeChange={setResponseType}
            onResponseCommentChange={setResponseComment}
            onRespond={handleRespond}
          />
        </Modal>
      )}

      <CreateMissingModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        events={events}
        products={products}
        onCreate={createMissing}
      />
    </div>
  );
}
