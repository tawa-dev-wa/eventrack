"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@eventrack/ui";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Identifiants incorrects");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-brand-primary p-12 text-white lg:flex">
        <Logo variant="full" onDark className="h-24 w-auto" />

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Toute votre logistique événementielle,
            <br />
            <span className="text-brand-secondary">au même endroit.</span>
          </h1>
          <p className="max-w-md text-lg text-white/70">
            Centralisez vos bons de commande, stocks, préparations et livraisons
            en un seul outil pensé pour le terrain.
          </p>
        </div>

        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} Eventrack — SaaS logistique événementielle
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-brand-background p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <Logo variant="full" className="h-20 w-auto" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Accédez à votre espace Eventrack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-brand-primary"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@entreprise.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-brand-primary"
                  >
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <p className="text-sm text-brand-critical">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Entrer en mode démo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
