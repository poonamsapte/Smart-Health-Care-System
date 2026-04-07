from sqlalchemy import create_engine, inspect
from backend.database import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
inspector = inspect(engine)
print(inspector.get_table_names())
