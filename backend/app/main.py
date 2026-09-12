from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

# EcoDetect AI - Industrial Decarbonization Platform
from app.core.config import settings
from app.database.session import engine, Base

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.industry import router as industry_router
from app.api.v1.assessment import router as assessment_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.simulator import router as simulator_router
from app.api.v1.action_plan import router as action_plan_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema tables exist without seeding any entries
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="EcoDetect AI API",
    description="Industrial Emission & Ecological Leak-Point Detector & Circular Alternative Recommender",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=f"{api_v1}/auth", tags=["Authentication"])
app.include_router(industry_router, prefix=f"{api_v1}/industry", tags=["Industry Profile"])
app.include_router(assessment_router, prefix=f"{api_v1}/assessments", tags=["Assessments"])
app.include_router(analysis_router, prefix=api_v1, tags=["Carbon Analysis & Hotspots"])
app.include_router(simulator_router, prefix=f"{api_v1}/simulator", tags=["What-If Simulator"])
app.include_router(action_plan_router, prefix=f"{api_v1}/action-plans", tags=["Action Plan"])
app.include_router(dashboard_router, prefix=f"{api_v1}/dashboard", tags=["Dashboard Analytics"])
app.include_router(reports_router, prefix=f"{api_v1}/reports", tags=["Reports"])
app.include_router(assistant_router, prefix=f"{api_v1}/assistant", tags=["AI Copilot Assistant"])
app.include_router(admin_router, prefix=f"{api_v1}/admin", tags=["Admin & RBAC Management"])

@app.get("/")
def root():
    return {
        "app": "EcoDetect AI",
        "tagline": "Detect. Recommend. Simulate. Reduce.",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "EcoDetect AI Backend"}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        },
        headers=exc.headers
    )
