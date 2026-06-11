export function GET() {
  return Response.json(
    { error: "Authentification désactivée en mode démo" },
    { status: 503 }
  );
}

export function POST() {
  return Response.json(
    { error: "Authentification désactivée en mode démo" },
    { status: 503 }
  );
}
