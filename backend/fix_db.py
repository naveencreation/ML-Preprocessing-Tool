import sqlite3
import os

db_path = "data/app.db"
if not os.path.exists(db_path):
    print(f"Database file {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        print("Adding dataset_type column...")
        cursor.execute("ALTER TABLE datasets ADD COLUMN dataset_type VARCHAR DEFAULT 'tabular'")
        conn.commit()
        print("Column added successfully.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
