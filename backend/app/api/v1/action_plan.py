from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.models import ActionPlan, Assessment, User
from app.schemas.schemas import ActionPlanCreate, ActionPlanUpdate, ActionPlanOut, ApiResponse
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user, require_roles, verify_assessment_access
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.get("", response_model=ApiResponse)
def get_action_plans(
    assessment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if assessment_id:
        verify_assessment_access(db, current_user, assessment_id, read_only=True)
        query = db.query(ActionPlan).filter(ActionPlan.assessment_id == assessment_id)
    else:
        # Fallback to all action plans accessible to user
        user_role = (current_user.role or "").lower()
        if user_role == UserRole.ADMIN:
            query = db.query(ActionPlan)
        else:
            query = db.query(ActionPlan).filter(ActionPlan.user_id == current_user.id)

    items = query.order_by(ActionPlan.created_at.desc()).all()
    return ApiResponse(
        success=True,
        data=[ActionPlanOut.from_orm(item).dict() for item in items]
    )

@router.post("", response_model=ApiResponse)
def create_action_plan(
    action_in: ActionPlanCreate,
    request: Request,
    assessment_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    # Enforce write access (blocks Regulator)
    assessment = verify_assessment_access(db, current_user, assessment_id, read_only=False)

    item = ActionPlan(
        user_id=current_user.id,
        assessment_id=assessment_id,
        recommendation_id=action_in.recommendation_id,
        title=action_in.title,
        category=action_in.category,
        priority=action_in.priority,
        owner=action_in.owner,
        deadline=action_in.deadline,
        estimated_cost_inr=action_in.estimated_cost_inr,
        expected_co2_reduction_kg=action_in.expected_co2_reduction_kg,
        status=action_in.status or "Planned"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    log_audit_event(
        db, action=AuditEvent.ACTION_PLAN_CHANGED, entity_type="ACTION_PLAN",
        user=current_user, entity_id=item.id, factory_id=assessment.industry_id,
        details={"title": item.title, "action": "CREATE", "status": item.status},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Action item added to plan",
        data=ActionPlanOut.from_orm(item).dict()
    )

@router.put("/{action_id}", response_model=ApiResponse)
def update_action_plan(
    action_id: int,
    action_in: ActionPlanUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    item = db.query(ActionPlan).filter(ActionPlan.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    # Enforce access to parent assessment
    verify_assessment_access(db, current_user, item.assessment_id, read_only=False)

    if action_in.status:
        item.status = action_in.status
    if action_in.owner:
        item.owner = action_in.owner
    if action_in.deadline:
        item.deadline = action_in.deadline
    if action_in.priority:
        item.priority = action_in.priority

    db.commit()
    db.refresh(item)

    log_audit_event(
        db, action=AuditEvent.ACTION_PLAN_CHANGED, entity_type="ACTION_PLAN",
        user=current_user, entity_id=item.id,
        details={"title": item.title, "action": "UPDATE", "new_status": item.status},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Action item updated",
        data=ActionPlanOut.from_orm(item).dict()
    )

@router.delete("/{action_id}", response_model=ApiResponse)
def delete_action_plan(
    action_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    item = db.query(ActionPlan).filter(ActionPlan.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    verify_assessment_access(db, current_user, item.assessment_id, read_only=False)

    db.delete(item)
    db.commit()

    log_audit_event(
        db, action=AuditEvent.ACTION_PLAN_CHANGED, entity_type="ACTION_PLAN",
        user=current_user, entity_id=action_id,
        details={"title": item.title, "action": "DELETE"},
        request=request
    )

    return ApiResponse(success=True, message="Action item removed from plan")
