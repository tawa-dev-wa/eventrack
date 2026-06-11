import {
  Wine,
  UtensilsCrossed,
  Leaf,
  Shirt,
  Package,
  Truck,
  ClipboardList,
  AlertTriangle,
  User,
  HardHat,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; color: string; icon: LucideIcon }
> = {
  decoration: {
    label: "Décoration",
    emoji: "🌿",
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    icon: Leaf,
  },
  linen: {
    label: "Linge",
    emoji: "🧺",
    color: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    icon: Shirt,
  },
  cutlery: {
    label: "Vaisselle",
    emoji: "🍽️",
    color: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    icon: UtensilsCrossed,
  },
  table: {
    label: "Matériel table",
    emoji: "📋",
    color: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    icon: Package,
  },
  drinks: {
    label: "Boissons",
    emoji: "🍷",
    color: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    icon: Wine,
  },
};

export function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] ?? {
      label: category,
      emoji: "📦",
      color: "bg-brand-secondary/15 text-brand-secondary",
      icon: Package,
    }
  );
}

export const MODULE_ICONS = {
  stock: Package,
  order: ClipboardList,
  departure: Truck,
  missing: AlertTriangle,
  commercial: User,
  preparer: HardHat,
} as const;
