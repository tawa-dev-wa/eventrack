import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const demoMode = !process.env.DATABASE_URL;

const handlers = demoMode ? null : toNextJsHandler(auth);

function demoResponse() {
  return Response.json(
    { error: "Authentification désactivée en mode démo (pas de base de données)" },
    { status: 503 }
  );
}

export function GET(request: Request) {
  if (demoMode) return demoResponse();
  return handlers!.GET(request);
}

export function POST(request: Request) {
  if (demoMode) return demoResponse();
  return handlers!.POST(request);
}
