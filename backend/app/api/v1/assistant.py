from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import ChatQuery, ApiResponse
from app.core.roles import UserRole
from app.api.deps import get_current_user, require_roles, verify_assessment_access
from app.services.assistant_service import AssistantService

router = APIRouter()

@router.post("/chat", response_model=ApiResponse)
def chat_with_copilot(
    query: ChatQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACTORY_OWNER, UserRole.SUSTAINABILITY_CONSULTANT, UserRole.ADMIN))
):
    # Regulator is forbidden from AI Assistant chat per spec
    if query.assessment_id:
        verify_assessment_access(db, current_user, query.assessment_id, read_only=True)

    service = AssistantService(db)
    result = service.answer_query(
        assessment_id=query.assessment_id,
        message=query.message,
        history=query.history
    )
    return ApiResponse(
        success=True,
        data=result
    )
