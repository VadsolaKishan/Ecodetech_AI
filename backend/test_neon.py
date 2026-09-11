import psycopg2
import sys
from app.core.config import settings

raw_url = settings.DATABASE_URL.replace("&channel_binding=require", "").replace("?channel_binding=require", "")
if "?" not in raw_url and "sslmode=" not in raw_url:
    raw_url += "?sslmode=require"

print("Attempting connection to Database...")
try:
    conn = psycopg2.connect(raw_url, connect_timeout=10)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    v = cur.fetchone()
    print("SUCCESS! Connected to PostgreSQL version:")
    print(v[0])
    cur.close()
    conn.close()
except Exception as e:
    print("FAILED with raw_url:", e)
