"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@eventrack/ui";
import { useMockStore } from "@/lib/mock/store";

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useMockStore();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const event = createEvent({
      name: String(fd.get("name")),
      clientName: String(fd.get("clientName")),
      date: String(fd.get("date")),
      startTime: String(fd.get("startTime")),
      departureTime: String(fd.get("departureTime")),
      address: String(fd.get("address")),
      guestsAdults: Number(fd.get("guestsAdults")),
      guestsChildren: Number(fd.get("guestsChildren") || 0),
      eventType: String(fd.get("eventType")),
      comments: String(fd.get("comments") || ""),
    });
    router.push(`/events/${event.id}?tab=order`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">
          Nouvel événement
        </h1>
        <p className="text-sm text-brand-primary/60">
          Créez une fiche événement puis construisez le bon de commande
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Nom de l&apos;événement</label>
                <Input name="name" required placeholder="Château X — Dîner assis" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Input name="clientName" required placeholder="Nom du client" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input name="eventType" required placeholder="Dîner assis, Cocktail…" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input name="date" type="date" required defaultValue="2026-06-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Heure de début</label>
                <Input name="startTime" type="time" required defaultValue="19:00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Départ camion</label>
                <Input name="departureTime" type="time" required defaultValue="15:00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Convives adultes</label>
                <Input name="guestsAdults" type="number" min={1} required defaultValue={100} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enfants</label>
                <Input name="guestsChildren" type="number" min={0} defaultValue={0} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Adresse</label>
                <Input name="address" required placeholder="Adresse complète du lieu" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Commentaires</label>
                <Textarea name="comments" placeholder="Remarques pour la logistique…" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? "Création…" : "Créer et ouvrir le bon"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
