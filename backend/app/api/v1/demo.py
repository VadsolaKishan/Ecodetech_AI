from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Industry, Assessment
from app.schemas.schemas import ApiResponse
from app.core.security import create_access_token
from app.database.demo_seed import seed_demo_factories

router = APIRouter()

DEMO_FACTORIES = [
    {
        "id": 1,
        "name": "Surat Eco-Weave Textiles",
        "industry": "Textile",
        "location": "Pandesara GIDC, Surat, Gujarat",
        "description": "High-intensity thermal coal & electricity consumer with virgin polyester filament yarn."
    },
    {
        "id": 2,
        "name": "Punjab Agro-Foods Ltd",
        "industry": "Food Processing",
        "location": "Focal Point Phase IV, Ludhiana, Punjab",
        "description": "Agro-processing facility with high organic waste methane leaks and cold storage loads."
    },
    {
        "id": 3,
        "name": "GreenPack Polymer Solutions",
        "industry": "Packaging",
        "location": "Chakan Industrial Area, Pune, Maharashtra",
        "description": "Polymer film extrusion plant with virgin resin supply lines and long-distance freight."
    }
]

@router.get("/factories", response_model=ApiResponse)
def list_demo_factories():
    return ApiResponse(success=True, data=DEMO_FACTORIES)

@router.post("/load/{factory_id}", response_model=ApiResponse)
def load_demo_factory(
    factory_id: int,
    db: Session = Depends(get_db)
):
    # Ensure seed data is initialized
    user = seed_demo_factories(db)

    factory_names = {
        1: "Surat Eco-Weave Textiles",
        2: "Punjab Agro-Foods Ltd",
        3: "GreenPack Polymer Solutions"
    }
    target_name = factory_names.get(factory_id, "Surat Eco-Weave Textiles")

    industry = db.query(Industry).filter(
        Industry.user_id == user.id,
        Industry.company_name == target_name
    ).first()

    if not industry:
        industry = db.query(Industry).filter(Industry.user_id == user.id).first()

    assessment = db.query(Assessment).filter(
        Assessment.industry_id == industry.id,
        Assessment.status == "calculated"
    ).order_by(Assessment.total_emissions_tco2e.desc()).first()

    if not assessment:
        assessment = db.query(Assessment).filter(
            Assessment.industry_id == industry.id
        ).order_by(Assessment.created_at.desc()).first()

    token = create_access_token(user.id)

    return ApiResponse(
        success=True,
        message=f"Demo factory '{industry.company_name}' loaded successfully",
        data={
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
            },
            "industry": {
                "id": industry.id,
                "company_name": industry.company_name,
                "industry_type": industry.industry_type,
                "factory_location": industry.factory_location
            },
            "assessment_id": assessment.id if assessment else None
        }
    )
