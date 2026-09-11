from enum import Enum
from typing import Dict, List, Set

class UserRole(str, Enum):
    FACTORY_OWNER = "factory_owner"
    SUSTAINABILITY_CONSULTANT = "sustainability_consultant"
    REGULATOR_AUDITOR = "regulator_auditor"
    ADMIN = "admin"

class AuditEvent(str, Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    ASSESSMENT_CREATED = "ASSESSMENT_CREATED"
    ASSESSMENT_UPDATED = "ASSESSMENT_UPDATED"
    ASSESSMENT_DELETED = "ASSESSMENT_DELETED"
    CALCULATION_RUN = "CALCULATION_RUN"
    RECOMMENDATION_GENERATED = "RECOMMENDATION_GENERATED"
    SCENARIO_CREATED = "SCENARIO_CREATED"
    ACTION_PLAN_CHANGED = "ACTION_PLAN_CHANGED"
    REPORT_GENERATED = "REPORT_GENERATED"
    EMISSION_FACTOR_CHANGED = "EMISSION_FACTOR_CHANGED"
    USER_ROLE_CHANGED = "USER_ROLE_CHANGED"

# Normalized permissions mapping
ROLE_PERMISSIONS: Dict[UserRole, Set[str]] = {
    UserRole.FACTORY_OWNER: {
        "dashboard:read",
        "factory:read_own",
        "factory:write_own",
        "assessment:read_own",
        "assessment:write_own",
        "assessment:delete_own",
        "analysis:read_own",
        "hotspots:read_own",
        "recommendations:read_own",
        "simulator:read_own",
        "simulator:write_own",
        "scenarios:read_own",
        "scenarios:write_own",
        "action_plan:read_own",
        "action_plan:write_own",
        "reports:read_own",
        "reports:generate_own",
        "history:read_own",
        "ai_assistant:use",
    },
    UserRole.SUSTAINABILITY_CONSULTANT: {
        "dashboard:read",
        "factory:read_assigned",
        "assessment:read_assigned",
        "assessment:write_assigned",
        "analysis:read_assigned",
        "hotspots:read_assigned",
        "recommendations:read_assigned",
        "simulator:read_assigned",
        "simulator:write_assigned",
        "scenarios:read_assigned",
        "scenarios:write_assigned",
        "action_plan:read_assigned",
        "action_plan:write_assigned",
        "reports:read_assigned",
        "reports:generate_assigned",
        "history:read_assigned",
        "ai_assistant:use",
    },
    UserRole.REGULATOR_AUDITOR: {
        "dashboard:read",
        "dashboard:read_readonly",
        "factory:read_readonly",
        "assessment:read_readonly",
        "analysis:read_readonly",
        "hotspots:read_readonly",
        "recommendations:read_readonly",
        "simulator:read_readonly",
        "scenarios:read_readonly",
        "action_plan:read_readonly",
        "reports:read_readonly",
        "reports:export",
        "history:read_readonly",
        "audit_logs:read",
        "emission_factors:read",
        "recommendation_knowledge:read",
    },
    UserRole.ADMIN: {
        "dashboard:read",
        "factory:all",
        "assessment:all",
        "analysis:all",
        "hotspots:all",
        "recommendations:all",
        "simulator:all",
        "scenarios:all",
        "action_plan:all",
        "reports:all",
        "history:all",
        "ai_assistant:use",
        "users:manage",
        "factories:manage",
        "emission_factors:manage",
        "recommendation_knowledge:manage",
        "audit_logs:all",
        "admin:access",
    }
}

def normalize_role(role_val: str) -> UserRole:
    if not role_val:
        return UserRole.FACTORY_OWNER
    r = str(role_val).lower().strip()
    for valid_role in UserRole:
        if valid_role.value == r:
            return valid_role
    return UserRole.FACTORY_OWNER

def has_permission(user_role: str, permission: str) -> bool:
    role = normalize_role(user_role)
    perms = ROLE_PERMISSIONS.get(role, set())
    return permission in perms or "admin:access" in perms
