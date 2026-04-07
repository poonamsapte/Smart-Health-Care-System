import sqlite3

# Connect to the database
conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

# Add license_number column
try:
    cursor.execute("ALTER TABLE doctors ADD COLUMN license_number VARCHAR")
    print("Added license_number column")
except sqlite3.OperationalError as e:
    print(f"Error adding license_number: {e}")

# Add availability column
try:
    cursor.execute("ALTER TABLE doctors ADD COLUMN availability VARCHAR DEFAULT 'Mon-Fri 9am-5pm'")
    print("Added availability column")
except sqlite3.OperationalError as e:
    print(f"Error adding availability: {e}")

# Commit and close
conn.commit()
conn.close()
print("Database updated successfully.")
