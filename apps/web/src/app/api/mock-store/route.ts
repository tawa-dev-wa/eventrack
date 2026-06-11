import {
  getServerMockStore,
  resetServerMockStore,
  setServerMockStore,
} from "@/lib/mock/server-store";
import type { MockStore } from "@/lib/mock/types";

export async function GET() {
  const { store, revision } = getServerMockStore();
  return Response.json({ store, revision });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as MockStore;
  const revision = setServerMockStore(body);
  return Response.json({ ok: true, revision });
}

export async function DELETE() {
  const revision = resetServerMockStore();
  return Response.json({ ok: true, revision });
}
