from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Industry, User
from app.schemas.schemas import IndustryCreate, IndustryUpdate, IndustryOut, ApiResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/profile", response_model=ApiResponse)
def get_industry_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if not industry:
        # Create default empty profile if none exists
        industry = Industry(
            user_id=current_user.id,
            company_name="My Manufacturing Enterprise",
            industry_type="Manufacturing",
            factory_location="Pune Industrial Corridor",
            production_type="Batch Processing",
            monthly_production=100.0,
            production_unit="tonnes"
        )
        db.add(industry)
        db.commit()
        db.refresh(industry)

    return ApiResponse(
        success=True,
        data=IndustryOut.from_orm(industry).dict()
    )

@router.post("/profile", response_model=ApiResponse)
def create_industry_profile(
    profile_in: IndustryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    industry = Industry(
        user_id=current_user.id,
        **profile_in.dict()
    )
    db.add(industry)
    db.commit()
    db.refresh(industry)
    return ApiResponse(
        success=True,
        message="Industrial profile created successfully",
        data=IndustryOut.from_orm(industry).dict()
    )

@router.put("/profile", response_model=ApiResponse)
def update_industry_profile(
    profile_in: IndustryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    industry = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if not industry:
        industry = Industry(user_id=current_user.id, **profile_in.dict())
        db.add(industry)
    else:
        for key, val in profile_in.dict().items():
            setattr(industry, key, val)
    db.commit()
    db.refresh(industry)
    return ApiResponse(
        success=True,
        message="Industrial profile updated successfully",
        data=IndustryOut.from_orm(industry).dict()
    )
