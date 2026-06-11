# Eventrack

SaaS de gestion logistique événementielle pour traiteurs et entreprises événementielles.

**Eventrack** centralise bons de commande, stocks, préparations, livraisons et retours en une fiche unique par événement.

## Stack

- **Monorepo** — Turborepo + pnpm
- **Web** — Next.js 15, React 19, Tailwind CSS 4
- **Auth** — Better Auth (multi-tenant, RBAC)
- **Database** — PostgreSQL 16 + Prisma
- **Design system** — `@eventrack/ui` (charte graphique officielle)

## Prérequis

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (pour PostgreSQL local)

## Démarrage rapide

```bash
# 1. Installer les dépendances
pnpm install

# 2. Lancer PostgreSQL
docker compose up -d

# 3. Configurer l'environnement
cp apps/web/.env.example apps/web/.env

# 4. Initialiser la base de données
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Lancer le serveur de développement
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Structure du monorepo

```
eventrack/
├── apps/
│   └── web/                 # Application principale Next.js
├── packages/
│   ├── auth/                # Better Auth + RBAC
│   ├── database/            # Prisma schema + client
│   ├── shared/              # Types, rôles, constantes
│   ├── ui/                  # Design system Eventrack
│   └── ai-pipeline/         # Stub import IA (V2)
└── docker-compose.yml
```

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| Direction | Accès complet |
| Commercial | Événements, bons de commande, manquants |
| Responsable logistique | Stock, préparation, flotte |
| Chauffeur | App mobile livraison (V1.1) |

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build production |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm db:generate` | Générer le client Prisma |
| `pnpm db:push` | Pousser le schema en base |
| `pnpm db:seed` | Données de démo traiteur |
| `pnpm db:studio` | Prisma Studio |

## Charte graphique

| Token | Valeur | Usage |
|-------|--------|-------|
| Primary | `#16213E` | Sidebar, actions principales |
| Secondary | `#2563EB` | CTA, liens actifs |
| Alert | `#F97316` | Manquants, warnings |
| Success | `#22C55E` | Validations |
| Background | `#F8FAFC` | Fond principal |

Police : **Inter**

## MVP Démo (données mockées)

L'application fonctionne avec des **données mockées en mémoire** — idéal pour présenter le produit sans base de données.

```bash
pnpm dev
# → http://localhost:3000/dashboard
```

### Parcours démo recommandé (3 min)

1. **Dashboard** — KPI, événements du jour, alertes manquants
2. **Événements → Château Sénéjac** — onglet Bon de commande
3. Rechercher `vase` → ajouter au bon · modifier quantités
4. **Matériel & Stock** — catalogue + « Où est mon matériel ? »
5. **Manquants** — répondre « Commandé » à un ticket

### Modules MVP

| Route | Fonction |
|-------|----------|
| `/dashboard` | Vue opérationnelle |
| `/events` | Liste + création |
| `/events/[id]?tab=order` | Bon de commande |
| `/stock` | Catalogue + gestion stock |
| `/missing` | Manquants + réponses commerciales |

## Phases de développement

- **Phase 0** ✅ — Fondations (monorepo, auth, DB, design system, shell UI)
- **Phase 1** — Cœur métier (événements, bons de commande, stocks)
- **Phase 2** — Opérations terrain (manquants, QR, traçabilité)
- **Phase 3** — Mobile + Stripe billing
- **Phase 4** — Import IA premium

## Licence

Propriétaire — Eventrack © 2026
