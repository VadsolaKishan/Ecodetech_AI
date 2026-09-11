import random
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Industry, Role
from app.schemas.schemas import UserCreate, UserLogin, ApiResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.roles import UserRole, AuditEvent
from app.api.deps import get_current_user
from app.services.audit_service import log_audit_event
from app.core.cache import api_cache

router = APIRouter()

@router.post("/register", response_model=ApiResponse)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Disallow registering as admin publicly
    role_str = (user_in.role or UserRole.FACTORY_OWNER.value).lower().strip()
    if role_str == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=400,
            detail="Administrator accounts cannot be registered publicly. Please contact system administration."
        )

    allowed_public_roles = [
        UserRole.FACTORY_OWNER.value,
        UserRole.SUSTAINABILITY_CONSULTANT.value,
        UserRole.REGULATOR_AUDITOR.value
    ]
    if role_str not in allowed_public_roles:
        role_str = UserRole.FACTORY_OWNER.value

    role_obj = db.query(Role).filter(Role.name == role_str).first()

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role_str,
        role_id=role_obj.id if role_obj else None,
        is_active=True,
        industry_id=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        subject=new_user.id,
        role=new_user.role,
        industry_id=new_user.industry_id
    )

    log_audit_event(
        db, action="USER_REGISTERED", entity_type="USER",
        user=new_user, entity_id=new_user.id,
        details={"email": new_user.email, "role": new_user.role},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Registration successful",
        data={
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "full_name": new_user.full_name,
                "role": new_user.role,
                "industry_id": new_user.industry_id
            }
        }
    )

@router.post("/login", response_model=ApiResponse)
def login(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled. Please contact your system administrator."
        )

    token = create_access_token(
        subject=user.id,
        role=user.role,
        industry_id=user.industry_id
    )

    log_audit_event(
        db, action=AuditEvent.LOGIN, entity_type="SESSION",
        user=user, entity_id=user.id,
        details={"ip": request.client.host if request.client else None},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Login successful",
        data={
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "industry_id": user.industry_id
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
            "role": current_user.role,
            "industry_id": current_user.industry_id,
            "is_active": current_user.is_active
        }
    )

@router.post("/logout", response_model=ApiResponse)
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(
        db, action=AuditEvent.LOGOUT, entity_type="SESSION",
        user=current_user, entity_id=current_user.id,
        request=request
    )
    return ApiResponse(success=True, message="Successfully logged out")

@router.post("/forgot-password", response_model=ApiResponse)
def forgot_password(req: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account associated with this email address was found."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account has been deactivated. Please contact your administrator."
        )

    # Generate 6-digit verification code
    code = f"{random.randint(100000, 999999)}"
    cache_key = f"pwd_reset_{user.email.lower()}"
    api_cache.set(cache_key, code, ttl=900)  # 15 minutes validity

    log_audit_event(
        db, action="PASSWORD_RESET_REQUESTED", entity_type="USER",
        user=user, entity_id=user.id,
        details={"email": user.email},
        request=request
    )

    return ApiResponse(
        success=True,
        message=f"Verification code has been generated. Enter code to reset your password.",
        data={"email": user.email, "code": code}
    )

@router.post("/reset-password", response_model=ApiResponse)
def reset_password(req: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User account not found."
        )

    cache_key = f"pwd_reset_{user.email.lower()}"
    cached_code = api_cache.get(cache_key)

    # Allow cached code or demo fallback code 123456
    if not cached_code or (cached_code != req.code.strip() and req.code.strip() != "123456"):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code. Please request a new code."
        )

    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters long."
        )

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    # Clear cached code after successful reset
    api_cache.delete(cache_key)

    log_audit_event(
        db, action="PASSWORD_RESET_COMPLETED", entity_type="USER",
        user=user, entity_id=user.id,
        details={"email": user.email},
        request=request
    )

    return ApiResponse(
        success=True,
        message="Your password has been successfully reset! You can now sign in."
    )

