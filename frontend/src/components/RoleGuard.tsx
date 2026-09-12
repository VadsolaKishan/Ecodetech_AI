import React, { Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole, canAccessRoute } from "../types/roles";

const ForbiddenPage = lazy(() => import("../pages/ForbiddenPage").then(m => ({ default: m.ForbiddenPage })));


interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { role } = useAuth();
  const location = useLocation();

  if (allowedRoles) {
    if (!allowedRoles.includes(role)) {
      return (
        <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-industrial-400">Verifying permissions...</div>}>
          <ForbiddenPage
            message={`This feature is restricted to [${allowedRoles.join(", ")}]. Your current role is ${role}.`}
          />
        </Suspense>
      );
    }
  } else {
    if (!canAccessRoute(role, location.pathname)) {
      return (
        <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-industrial-400">Verifying permissions...</div>}>
          <ForbiddenPage
            message={`Your role (${role}) does not have permission to access ${location.pathname}.`}
          />
        </Suspense>
      );
    }
  }

  return <>{children}</>;
};
