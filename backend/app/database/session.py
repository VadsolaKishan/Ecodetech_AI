from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings

connect_args = {}
engine_kwargs = {"echo": False}

db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Neon PostgreSQL serverless connection
    # Strip channel_binding=require if present to prevent pgbouncer SSL eof
    if "channel_binding=require" in db_url:
        db_url = db_url.replace("&channel_binding=require", "").replace("channel_binding=require&", "").replace("channel_binding=require", "")
        if db_url.endswith("?"):
            db_url = db_url[:-1]

    # Neon PgBouncer pooler works best with NullPool or aggressive recycle
    engine_kwargs["poolclass"] = NullPool
    engine_kwargs["connect_args"] = {"connect_timeout": 15, "sslmode": "require"}

engine = create_engine(
    db_url,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
