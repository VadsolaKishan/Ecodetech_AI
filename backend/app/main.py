from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.seed_factors import seed_emission_factors
from app.database.demo_seed import seed_demo_factories

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
from app.api.v1.demo import router as demo_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_emission_factors(db)
        seed_demo_factories(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CarbonCopilot AI API",
    description="Industrial Emission Leak-Point Detector & Circular Alternative Recommender (HackOut'26)",
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
app.include_router(demo_router, prefix=f"{api_v1}/demo", tags=["Demo Mode"])

@app.get("/")
def root():
    return {
        "app": "CarbonCopilot AI",
        "tagline": "Detect. Recommend. Simulate. Reduce.",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "CarbonCopilot Backend"}

# Custom Exception Handler for Standardized Error Format
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc)
            }
        }
    )
