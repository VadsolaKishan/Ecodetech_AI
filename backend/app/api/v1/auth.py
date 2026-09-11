from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Industry
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token, ApiResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=ApiResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "factory_operator"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically create default factory profile for convenience
    default_ind = Industry(
        user_id=new_user.id,
        company_name=f"{new_user.full_name}'s Enterprise",
        industry_type="Manufacturing",
        factory_location="Industrial Area",
        monthly_production=100.0,
        production_unit="tonnes"
    )
    db.add(default_ind)
    db.commit()

    token = create_access_token(new_user.id)
    return ApiResponse(
        success=True,
        message="Registration successful",
        data={
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "full_name": new_user.full_name,
                "role": new_user.role
            }
        }
    )

@router.post("/login", response_model=ApiResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token(user.id)
    return ApiResponse(
        success=True,
        message="Login successful",
        data={
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role
            }
        }
    )

@router.get("/me", response_model=ApiResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        data={
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role
        }
    )

@router.post("/logout", response_model=ApiResponse)
def logout():
    return ApiResponse(success=True, message="Successfully logged out")
