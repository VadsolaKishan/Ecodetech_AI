import time
from app.database.session import engine, Base

print("1. Connecting with engine.connect()...")
t0 = time.time()
with engine.connect() as conn:
    print(f"   Connected in {time.time() - t0:.2f}s!")
    
print("2. Calling Base.metadata.create_all(bind=engine)...")
t1 = time.time()
Base.metadata.create_all(bind=engine)
print(f"   create_all completed in {time.time() - t1:.2f}s!")

from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print("3. Tables created in Neon database:", tables)
