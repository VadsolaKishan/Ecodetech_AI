from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings

engine_kwargs = {"echo": False, "pool_pre_ping": True}

db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Neon PostgreSQL serverless connection
    # Strip channel_binding=require if present to prevent pgbouncer SSL eof
    if "channel_binding=require" in db_url:
        db_url = db_url.replace("&channel_binding=require", "").replace("channel_binding=require&", "").replace("channel_binding=require", "")
        if db_url.endswith("?"):
            db_url = db_url[:-1]

    # PgBouncer / Neon works best with NullPool
    engine_kwargs["poolclass"] = NullPool
    
    pg_connect_args = {
        "connect_timeout": 20,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5
    }

    # Determine SSL mode:
    # - If DB_SSLMODE is set, use it
    # - If neon.tech or sslmode=require in URL, require SSL
    # - For local / docker postgres without SSL, do not force require
    ssl_mode = settings.DB_SSLMODE or ""
    if not ssl_mode:
        if "neon.tech" in db_url or "sslmode=require" in db_url:
            ssl_mode = "require"
        elif "localhost" in db_url or "@postgres:" in db_url or "127.0.0.1" in db_url:
            ssl_mode = "prefer"

    if ssl_mode:
        pg_connect_args["sslmode"] = ssl_mode

    engine_kwargs["connect_args"] = pg_connect_args

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
