from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User
from app.schemas.schemas import ChatQuery, ApiResponse
from app.api.deps import get_current_user
from app.services.assistant_service import AssistantService

router = APIRouter()

@router.post("/chat", response_model=ApiResponse)
def chat_with_copilot(
    query: ChatQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = AssistantService(db)
    result = service.answer_query(
        assessment_id=query.assessment_id,
        message=query.message
    )
    return ApiResponse(
        success=True,
        data=result
    )
