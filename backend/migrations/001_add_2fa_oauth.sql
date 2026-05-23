-- Migration: Add 2FA and OAuth support to users table
-- Date: 2026-05-23

BEGIN;

-- Add OAuth columns
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN github_id VARCHAR(255) UNIQUE;

-- Add 2FA columns
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN backup_codes TEXT;

-- Add updated_at column
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for OAuth lookups
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_github_id ON users(github_id);

COMMIT;
