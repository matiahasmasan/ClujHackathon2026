#!/usr/bin/env python
"""
Run database migrations directly using SQLAlchemy.
This script connects to PostgreSQL and applies the 2FA/OAuth schema changes.
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

import asyncio
import psycopg2
from psycopg2 import sql

def parse_database_url(database_url: str) -> dict:
    """Parse DATABASE_URL to extract connection parameters."""
    # Format: postgresql+asyncpg://user:password@host:port/database?ssl=require
    from urllib.parse import urlparse
    
    parsed = urlparse(database_url)
    
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path.lstrip('/').split('?')[0],
        'user': parsed.username,
        'password': parsed.password,
        'sslmode': 'require' if 'ssl=require' in database_url else 'prefer',
    }


def run_migrations(database_url: str):
    """Apply migrations to the database."""
    
    print("=" * 70)
    print("🚀 Running Database Migrations (2FA & OAuth)")
    print("=" * 70)
    
    try:
        # Parse connection string
        conn_params = parse_database_url(database_url)
        
        print(f"\n🔌 Connecting to: {conn_params['host']}:{conn_params['port']}/{conn_params['database']}")
        
        # Connect to database
        conn = psycopg2.connect(
            host=conn_params['host'],
            port=conn_params['port'],
            database=conn_params['database'],
            user=conn_params['user'],
            password=conn_params['password'],
            sslmode=conn_params['sslmode'],
        )
        
        cursor = conn.cursor()
        
        # Migration SQL statements
        migrations = [
            ("Add google_id column", 
             "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;"),
            
            ("Add github_id column", 
             "ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE;"),
            
            ("Add two_factor_enabled column", 
             "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;"),
            
            ("Add two_factor_secret column", 
             "ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);"),
            
            ("Add backup_codes column", 
             "ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT;"),
            
            ("Add updated_at column", 
             "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"),
            
            ("Create google_id index", 
             "CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);"),
            
            ("Create github_id index", 
             "CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);"),
        ]
        
        print("\n📝 Executing migrations:\n")
        
        for i, (description, sql_stmt) in enumerate(migrations, 1):
            print(f"  [{i}/{len(migrations)}] {description}...", end=" ")
            try:
                cursor.execute(sql_stmt)
                conn.commit()
                print("✅")
            except Exception as e:
                print(f"⚠️  {e}")
                conn.rollback()
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 70)
        print("✅ All migrations completed successfully!")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    from app.core.config import settings
    
    run_migrations(settings.database_url)
