"use client";



import { useState } from "react";

import {

  Button,

  Card,

  CardContent,

  Input,

  Textarea,

} from "@eventrack/ui";

import { Plus } from "lucide-react";

import {

  MISSING_RESPONSE_TYPES,

  type MissingResponseType,

} from "@eventrack/shared";

import { useMockStore } from "@/lib/mock/store";

import { MissingStatusBadge } from "@/components/status-badges";

import { Modal, ModalFooter } from "@/components/modal";

import { cn } from "@eventrack/ui";

import {

  formatMissingTime,

  MISSING_WORKFLOW_LABELS,

  missingQuantity,

} from "@/lib/mock/missing-workflow";

import type { MissingWorkflowStatus } from "@/lib/mock/types";



const RESPONSE_LABELS: Record<MissingResponseType, string> = {

  ordered: "Commandé",

  replaced: "Remplacer par",

  client_informed: "Client informé",

  cancelled: "Annulé",

};



type Filter = MissingWorkflowStatus | "active" | "all";



export default function MissingPage() {

  const { missingItems, events, products, createMissing, respondToMissing } =

    useMockStore();

  const [filter, setFilter] = useState<Filter>("active");

  const [selectedId, setSelectedId] = useState(missingItems[0]?.id ?? "");

  const [showCreate, setShowCreate] = useState(false);

  const [responseType, setResponseType] = useState<MissingResponseType>("replaced");

  const [responseComment, setResponseComment] = useState("");



  const filtered = missingItems.filter((m) => {

    if (filter === "all") return true;

    if (filter === "active") return m.workflowStatus !== "closed";

    return m.workflowStatus === filter;

  });



  const selected = missingItems.find((m) => m.id === selectedId) ?? filtered[0];



  function handleRespond() {

    if (!selected || !responseComment.trim()) return;

    respondToMissing(selected.id, responseType, responseComment.trim());

    setResponseComment("");

  }



  const filterTabs: { id: Filter; label: string }[] = [

    {

      id: "active",

      label: `Actifs (${missingItems.filter((m) => m.workflowStatus !== "closed").length})`,

    },

    {

      id: "declared",

      label: `Manquant déclaré (${missingItems.filter((m) => m.workflowStatus === "declared").length})`,

    },

    {

      id: "commercial_response",

      label: `Réponse reçue (${missingItems.filter((m) => m.workflowStatus === "commercial_response").length})`,

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

        <Button variant="secondary" onClick={() => setShowCreate(true)}>

          <Plus className="h-4 w-4" />

          Déclarer un manquant

        </Button>

      </div>



      <div className="flex flex-wrap gap-2">

        {filterTabs.map(({ id, label }) => (

          <button

            key={id}

            type="button"

            onClick={() => setFilter(id)}

            className={cn(

              "rounded-full px-3 py-1 text-sm font-medium",

              filter === id

                ? "bg-brand-secondary text-white"

                : "bg-brand-neutral/50 text-brand-primary/60"

            )}

          >

            {label}

          </button>

        ))}

      </div>



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

            <CardContent className="space-y-4 p-5">

              <div>

                <h3 className="font-semibold text-brand-primary">

                  Réponse commerciale

                </h3>

                <p className="mt-1 text-sm text-brand-primary/60">

                  {selected.designation} · {selected.eventName.split(" — ")[0]}

                </p>

                <div className="mt-2">

                  <MissingStatusBadge status={selected.workflowStatus} />

                </div>

              </div>

              <p className="text-sm text-brand-primary/70">

                Demandé {selected.quantityRequested} · Trouvé{" "}

                {selected.quantityFound} · Manque{" "}

                <strong>{missingQuantity(selected)}</strong>

              </p>

              {selected.comment && (

                <p className="rounded-md bg-brand-background p-2 text-sm italic text-brand-primary/60">

                  {selected.comment}

                </p>

              )}

              {selected.workflowStatus === "declared" && (

                <>

                  <div>

                    <p className="mb-2 text-sm font-medium">Réponse :</p>

                    <div className="flex flex-wrap gap-2">

                      {MISSING_RESPONSE_TYPES.map((t) => (

                        <button

                          key={t}

                          type="button"

                          onClick={() => setResponseType(t)}

                          className={cn(

                            "rounded-full border px-3 py-1 text-xs font-medium",

                            responseType === t

                              ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"

                              : "border-brand-neutral text-brand-primary/60"

                          )}

                        >

                          {RESPONSE_LABELS[t]}

                        </button>

                      ))}

                    </div>

                  </div>

                  <Textarea

                    value={responseComment}

                    onChange={(e) => setResponseComment(e.target.value)}

                    placeholder={

                      responseType === "replaced"

                        ? "Ex. 2 vases rouges"

                        : "Commentaire commercial…"

                    }

                    rows={3}

                  />

                  <Button

                    variant="secondary"

                    className="w-full"

                    onClick={handleRespond}

                    disabled={!responseComment.trim()}

                  >

                    Valider la réponse

                  </Button>

                </>

              )}

              {selected.commercialResponse &&

                selected.workflowStatus !== "declared" && (

                  <div className="rounded-md border border-brand-secondary/20 bg-brand-secondary/5 p-3 text-sm">

                    <p className="font-medium text-brand-primary">

                      {selected.responseType

                        ? RESPONSE_LABELS[selected.responseType]

                        : "Réponse"}

                    </p>

                    <p className="mt-1 text-brand-primary/70">

                      {selected.commercialResponse}

                    </p>

                    {selected.respondedBy && selected.respondedAt && (

                      <p className="mt-1 text-xs text-brand-primary/50">

                        {selected.respondedBy} ·{" "}

                        {formatMissingTime(selected.respondedAt)}

                      </p>

                    )}

                  </div>

                )}

              {selected.history.length > 0 && (

                <div className="border-t border-brand-neutral pt-3">

                  <p className="text-sm font-medium text-brand-primary">

                    Historique

                  </p>

                  <ol className="mt-3 space-y-3">

                    {[...selected.history].reverse().map((entry) => (

                      <li

                        key={entry.id}

                        className="border-l-2 border-brand-neutral pl-3 text-sm"

                      >

                        <p className="text-xs font-medium text-brand-primary/50">

                          {formatMissingTime(entry.at)}

                        </p>

                        <p className="font-medium text-brand-primary">

                          {entry.label}

                        </p>

                        <p className="text-brand-primary/70">{entry.detail}</p>

                        <p className="text-xs text-brand-primary/40">

                          {entry.userName}

                        </p>

                      </li>

                    ))}

                  </ol>

                </div>

              )}

            </CardContent>

          </Card>

        )}

      </div>



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



function CreateMissingModal({

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

              document.getElementById("missing-form") as HTMLFormElement

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

            className="h-10 w-full rounded-md border border-brand-neutral px-3 text-sm"

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

            className="h-10 w-full rounded-md border border-brand-neutral px-3 text-sm"

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

            <Input name="quantityRequested" type="number" min={1} required defaultValue={12} />

          </div>

          <div className="space-y-2">

            <label className="text-sm font-medium">Trouvé</label>

            <Input name="quantityFound" type="number" min={0} required defaultValue={10} />

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


