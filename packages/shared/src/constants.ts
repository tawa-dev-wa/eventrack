export const ORDER_SECTIONS = [
  "decoration_buffet",
  "table_material",
  "cutlery_goutte",
  "cutlery_vieux_paris",
  "table_linen",
  "kitchen_linen",
  "service_linen",
  "soft_drinks",
  "beers",
  "wines",
  "spirits",
  "staff",
  "remarks",
] as const;

export type OrderSection = (typeof ORDER_SECTIONS)[number];

export const ORDER_SECTION_LABELS: Record<OrderSection, string> = {
  decoration_buffet: "Décoration & Buffet",
  table_material: "Matériel de table",
  cutlery_goutte: "Couvert Goutte",
  cutlery_vieux_paris: "Couvert Vieux Paris",
  table_linen: "Linge de table",
  kitchen_linen: "Linge de cuisine",
  service_linen: "Linge de service",
  soft_drinks: "Boissons",
  beers: "Bières",
  wines: "Vins",
  spirits: "Spiritueux",
  staff: "Personnel",
  remarks: "Remarques",
};

export const EVENT_STATUSES = [
  "draft",
  "to_prepare",
  "preparing",
  "ready",
  "in_delivery",
  "completed",
  "cancelled",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Brouillon",
  to_prepare: "À préparer",
  preparing: "En préparation",
  ready: "Prêt",
  in_delivery: "En livraison",
  completed: "Terminé",
  cancelled: "Annulé",
};

export const MISSING_RESPONSE_TYPES = [
  "ordered",
  "replaced",
  "client_informed",
  "cancelled",
] as const;

export type MissingResponseType = (typeof MISSING_RESPONSE_TYPES)[number];

export const SUBSCRIPTION_PLANS = {
  TRIAL: "trial",
  PRO: "pro",
  PRO_AI: "pro_ai",
} as const;

export const BRAND_COLORS = {
  primary: "#16213E",
  secondary: "#2563EB",
  alert: "#F97316",
  success: "#22C55E",
  neutral: "#E2E8F0",
  background: "#F8FAFC",
  critical: "#EF4444",
} as const;
