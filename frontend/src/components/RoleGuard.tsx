import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole, canAccessRoute } from "../types/roles";
import { ForbiddenPage } from "../pages/ForbiddenPage";

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
        <ForbiddenPage
          message={`This feature is restricted to [${allowedRoles.join(", ")}]. Your current role is ${role}.`}
        />
      );
    }
  } else {
    if (!canAccessRoute(role, location.pathname)) {
      return (
        <ForbiddenPage
          message={`Your role (${role}) does not have permission to access ${location.pathname}.`}
        />
      );
    }
  }

  return <>{children}</>;
};
