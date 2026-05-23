"""
Simple migration script to add 2FA and OAuth fields to users table.
Usage: python run_migrations.py
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings


async def run_migrations():
    """Apply all pending migrations."""
    
    # Create async engine
    engine = create_async_engine(settings.database_url, echo=False)
    
    # Migration SQL statements
    migration_sql = """
    -- Add OAuth columns
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE;
    
    -- Add 2FA columns
    ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT;
    
    -- Add updated_at column
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    -- Create indexes for OAuth lookups (if not exist)
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
    """
    
    print(f"🔄 Applying migrations to: {settings.database_url}")
    print("-" * 60)
    
    try:
        async with engine.begin() as conn:
            # Split and execute each statement
            statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
            for i, stmt in enumerate(statements, 1):
                print(f"[{i}/{len(statements)}] Executing: {stmt[:60]}...")
                await conn.execute(text(stmt))
        
        print("-" * 60)
        print("✅ All migrations applied successfully!")
        
    except Exception as e:
        print("-" * 60)
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Running database migrations...")
    print("=" * 60)
    asyncio.run(run_migrations())

