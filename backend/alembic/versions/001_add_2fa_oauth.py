"""Add 2FA and OAuth fields to users.

Revision ID: 001_add_2fa_oauth
Revises:
Create Date: 2026-05-23 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_2fa_oauth'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add OAuth columns
    op.add_column('users', sa.Column('google_id', sa.String(255), nullable=True, unique=True))
    op.add_column('users', sa.Column('github_id', sa.String(255), nullable=True, unique=True))
    
    # Add 2FA columns
    op.add_column('users', sa.Column('two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('two_factor_secret', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('backup_codes', sa.Text(), nullable=True))
    
    # Add updated_at column
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()))
    
    # Create indexes for OAuth lookups
    op.create_index(op.f('idx_users_google_id'), 'users', ['google_id'], unique=True)
    op.create_index(op.f('idx_users_github_id'), 'users', ['github_id'], unique=True)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('idx_users_github_id'), table_name='users')
    op.drop_index(op.f('idx_users_google_id'), table_name='users')
    
    # Drop columns in reverse order
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'backup_codes')
    op.drop_column('users', 'two_factor_secret')
    op.drop_column('users', 'two_factor_enabled')
    op.drop_column('users', 'github_id')
    op.drop_column('users', 'google_id')
