export type UserRole =
  | "FACTORY_OWNER"
  | "SUSTAINABILITY_CONSULTANT"
  | "REGULATOR_AUDITOR"
  | "ADMIN";

export const USER_ROLES: Record<string, UserRole> = {
  FACTORY_OWNER: "FACTORY_OWNER",
  SUSTAINABILITY_CONSULTANT: "SUSTAINABILITY_CONSULTANT",
  REGULATOR_AUDITOR: "REGULATOR_AUDITOR",
  ADMIN: "ADMIN",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  FACTORY_OWNER: "Factory Owner",
  SUSTAINABILITY_CONSULTANT: "Sustainability Consultant",
  REGULATOR_AUDITOR: "Regulator / Auditor",
  ADMIN: "System Administrator",
};

export const ROLE_BADGE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  FACTORY_OWNER: { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-700/50" },
  SUSTAINABILITY_CONSULTANT: { bg: "bg-sky-950/60", text: "text-sky-400", border: "border-sky-700/50" },
  REGULATOR_AUDITOR: { bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-700/50" },
  ADMIN: { bg: "bg-purple-950/60", text: "text-purple-400", border: "border-purple-700/50" },
};

// Route accessibility matrix according to specification
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  "/dashboard": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/industry/profile": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/profile": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/assessment/new": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "ADMIN"], // Forbidden for Regulator
  "/assessments": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/carbon-analysis": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/hotspots": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/recommendations": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/simulator": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/scenarios": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/action-plan": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/reports": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/history": ["FACTORY_OWNER", "SUSTAINABILITY_CONSULTANT", "REGULATOR_AUDITOR", "ADMIN"],
  "/audit-logs": ["REGULATOR_AUDITOR", "ADMIN"], // Forbidden for Owner and Consultant
  "/admin": ["ADMIN"],
  "/admin/users": ["ADMIN"],
  "/admin/industries": ["ADMIN"],
  "/admin/emission-factors": ["ADMIN", "REGULATOR_AUDITOR"], // Regulator has read-only
  "/admin/recommendation-knowledge": ["ADMIN", "REGULATOR_AUDITOR"], // Regulator has read-only
};

export function isReadOnlyRole(role?: string): boolean {
  return (role || "").toUpperCase() === "REGULATOR_AUDITOR";
}

export function canAccessRoute(role: string | undefined, path: string): boolean {
  if (!role) return false;
  const normalizedRole = role.toUpperCase() as UserRole;
  if (normalizedRole === "ADMIN") return true;

  // Match exact route or parent route
  const exactMatch = ROUTE_ACCESS[path];
  if (exactMatch) {
    return exactMatch.includes(normalizedRole);
  }

  // Check prefix matches for dynamic routes (e.g., /assessments/:id)
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
    if (path.startsWith(routePattern)) {
      return allowedRoles.includes(normalizedRole);
    }
  }

  return true;
}
