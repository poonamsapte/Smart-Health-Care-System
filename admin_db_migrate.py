import sqlite3
from datetime import datetime

conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

try:
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200),
        email VARCHAR,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    print("Created feedbacks table")
    
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_feedbacks_email ON feedbacks(email)")
    print("Created feedback email index")
    
except sqlite3.OperationalError as e:
    print(f"Error creating table: {e}")

conn.commit()
conn.close()
print("Database migrated successfully.")
