import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Truck,
  UserCircle,
  Package,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Users,
  ClipboardCheck,
  HelpCircle,
  Menu,
} from "lucide-react";

export const APP_NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/preparation", label: "Préparation", icon: ClipboardCheck },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/trucks", label: "Camions", icon: Truck },
  { href: "/drivers", label: "Chauffeurs", icon: UserCircle },
  { href: "/stock", label: "Matériel & Stock", icon: Package },
  { href: "/missing", label: "Manquants", icon: AlertTriangle },
  { href: "/returns", label: "Retours", icon: RotateCcw },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/help", label: "Besoin d'aide ?", icon: HelpCircle },
] as const;

export const MOBILE_TAB_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/preparation", label: "Préparation", icon: ClipboardCheck },
  { href: "/missing", label: "Manquants", icon: AlertTriangle, badge: true },
  { href: "__menu__", label: "Menu", icon: Menu },
] as const;
