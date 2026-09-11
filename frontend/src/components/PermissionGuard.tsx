import React from "react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/roles";

interface PermissionGuardProps {
  children: React.ReactNode;
  requireWrite?: boolean;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
  disableInsteadOfHide?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requireWrite = false,
  allowedRoles,
  fallback = null,
  disableInsteadOfHide = false,
}) => {
  const { role, isReadOnly } = useAuth();

  const isRoleAllowed = !allowedRoles || allowedRoles.includes(role);
  const isWriteAllowed = !requireWrite || (!isReadOnly && role !== "REGULATOR_AUDITOR");

  const permitted = isRoleAllowed && isWriteAllowed;

  if (!permitted) {
    if (disableInsteadOfHide && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        disabled: true,
        title: "Disabled in Regulator / Auditor read-only mode",
        className: `${(children as React.ReactElement<any>).props.className || ""} opacity-40 cursor-not-allowed pointer-events-none`,
      });
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
