from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.models.models import ActionPlan, Assessment, User
from app.schemas.schemas import ActionPlanCreate, ActionPlanUpdate, ActionPlanOut, ApiResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=ApiResponse)
def get_action_plans(
    assessment_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ActionPlan).filter(ActionPlan.user_id == current_user.id)
    if assessment_id:
        query = query.filter(ActionPlan.assessment_id == assessment_id)
    items = query.order_by(ActionPlan.created_at.desc()).all()
    return ApiResponse(
        success=True,
        data=[ActionPlanOut.from_orm(item).dict() for item in items]
    )

@router.post("", response_model=ApiResponse)
def create_action_plan(
    action_in: ActionPlanCreate,
    assessment_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

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
    return ApiResponse(
        success=True,
        message="Action item added to plan",
        data=ActionPlanOut.from_orm(item).dict()
    )

@router.put("/{action_id}", response_model=ApiResponse)
def update_action_plan(
    action_id: int,
    action_in: ActionPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ActionPlan).filter(ActionPlan.id == action_id, ActionPlan.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    for key, val in action_in.dict(exclude_unset=True).items():
        setattr(item, key, val)

    db.commit()
    db.refresh(item)
    return ApiResponse(
        success=True,
        message="Action item updated",
        data=ActionPlanOut.from_orm(item).dict()
    )

@router.delete("/{action_id}", response_model=ApiResponse)
def delete_action_plan(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ActionPlan).filter(ActionPlan.id == action_id, ActionPlan.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()
    return ApiResponse(success=True, message="Action item deleted")
