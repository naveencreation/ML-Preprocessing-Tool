import sqlite3
import os

db_path = "data/app.db"
if not os.path.exists(db_path):
    print(f"Database file {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(datasets)")
        columns = cursor.fetchall()
        print("Columns in 'datasets' table:")
        for col in columns:
            print(col)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
