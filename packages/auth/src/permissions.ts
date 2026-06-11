import {
  hasPermission,
  type Permission,
  type Role,
  ROLES,
} from "@eventrack/shared";

export { hasPermission, ROLES };
export type { Permission, Role };

export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

export function canAccessRoute(role: Role, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": ["events:read"],
    "/events": ["events:read"],
    "/stock": ["stock:read"],
    "/missing": ["missing:read"],
    "/trucks": ["trucks:read"],
    "/drivers": ["drivers:read"],
    "/reports": ["events:read"],
    "/settings": ["org:admin"],
  };

  const required = routePermissions[route];
  if (!required) return true;
  return required.some((p) => hasPermission(role, p));
}
