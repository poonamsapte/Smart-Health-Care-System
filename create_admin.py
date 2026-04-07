"""
Run this script to create an admin user in the database.
Usage: python create_admin.py
"""
import sqlite3
from passlib.context import CryptContext

# Must match backend/auth.py
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# ---- Edit these before running ----
ADMIN_EMAIL    = "admin@smarthealthcare.com"
ADMIN_PASSWORD = "Admin1234"
ADMIN_NAME     = "Super Admin"
# ------------------------------------

conn = sqlite3.connect("sql_app.db")
cursor = conn.cursor()

# Check if already exists
cursor.execute("SELECT id FROM users WHERE email = ?", (ADMIN_EMAIL,))
existing = cursor.fetchone()

if existing:
    print(f"Admin user '{ADMIN_EMAIL}' already exists (id={existing[0]}).")
else:
    hashed_pw = pwd_context.hash(ADMIN_PASSWORD)
    cursor.execute(
        "INSERT INTO users (email, hashed_password, full_name, is_active, role) VALUES (?, ?, ?, ?, ?)",
        (ADMIN_EMAIL, hashed_pw, ADMIN_NAME, 1, "admin")
    )
    conn.commit()
    print(f"✅ Admin user created successfully!")
    print(f"   Email   : {ADMIN_EMAIL}")
    print(f"   Password: {ADMIN_PASSWORD}")
    print(f"   Role    : admin")

conn.close()
