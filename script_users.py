import psycopg2
from psycopg2.extras import RealDictCursor
import json

DB_CONFIG = {
    "dbname": "vibe_db",
    "user": "postgres",
    "password": "your_password",
    "host": "localhost",
    "port": "5432"
}

def export_users_to_json():
    print("⏳ Connecting to the database...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Am actualizat interogarea pentru a aduce first_name și last_name
        cur.execute("SELECT id, first_name, last_name, email, phone_number, created_at FROM users;")
        users_data = cur.fetchall()
        
        class DateTimeEncoder(json.JSONEncoder):
            def default(self, obj):
                from datetime import datetime
                if isinstance(obj, datetime):
                    return obj.isoformat()
                return super().default(obj)

        filename = "users_export.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(users_data, f, indent=4, cls=DateTimeEncoder)
            
        print(f"✅ Export successful! File saved as '{filename}'.")
        print("Data preview:\n", json.dumps(users_data[:1], indent=2, cls=DateTimeEncoder))
        
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    export_users_to_json()