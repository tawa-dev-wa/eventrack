export const ROLES = {
  DIRECTION: "direction",
  COMMERCIAL: "commercial",
  LOGISTICS: "logistics",
  DRIVER: "driver",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  direction: "Direction",
  commercial: "Commercial",
  logistics: "Responsable logistique",
  driver: "Chauffeur",
};

export const PERMISSIONS = {
  EVENTS_READ: "events:read",
  EVENTS_WRITE: "events:write",
  ORDERS_WRITE: "orders:write",
  STOCK_READ: "stock:read",
  STOCK_WRITE: "stock:write",
  PREPARATION_WRITE: "preparation:write",
  MISSING_READ: "missing:read",
  MISSING_WRITE: "missing:write",
  MISSING_RESPOND: "missing:respond",
  TRUCKS_READ: "trucks:read",
  TRUCKS_WRITE: "trucks:write",
  DRIVERS_READ: "drivers:read",
  DRIVERS_WRITE: "drivers:write",
  AUDIT_READ: "audit:read",
  ORG_ADMIN: "org:admin",
  DELIVERY_WRITE: "delivery:write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  direction: Object.values(PERMISSIONS),
  commercial: [
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.EVENTS_WRITE,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.STOCK_READ,
    PERMISSIONS.MISSING_READ,
    PERMISSIONS.MISSING_RESPOND,
    PERMISSIONS.TRUCKS_READ,
    PERMISSIONS.DRIVERS_READ,
  ],
  logistics: [
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.STOCK_READ,
    PERMISSIONS.STOCK_WRITE,
    PERMISSIONS.PREPARATION_WRITE,
    PERMISSIONS.MISSING_READ,
    PERMISSIONS.MISSING_WRITE,
    PERMISSIONS.TRUCKS_READ,
    PERMISSIONS.TRUCKS_WRITE,
    PERMISSIONS.DRIVERS_READ,
    PERMISSIONS.DRIVERS_WRITE,
  ],
  driver: [
    PERMISSIONS.EVENTS_READ,
    PERMISSIONS.DELIVERY_WRITE,
    PERMISSIONS.MISSING_WRITE,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
