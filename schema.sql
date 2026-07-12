-- ============================================================
-- AssetFlow ERP - Initial Authentication Schema
-- PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE role_type AS ENUM (
    'ADMIN',
    'ASSET_MANAGER',
    'DEPARTMENT_HEAD',
    'EMPLOYEE'
);

CREATE TYPE account_status AS ENUM (
    'PENDING_APPROVAL',
    'ACTIVE',
    'INACTIVE',
    'LOCKED',
    'SUSPENDED'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_code VARCHAR(20) UNIQUE,

    full_name VARCHAR(120) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone_number VARCHAR(20),

    profile_image_url TEXT,

    password_hash TEXT NOT NULL,

    role role_type NOT NULL DEFAULT 'EMPLOYEE',

    organization_id UUID,

    department_id UUID,

    account_status account_status NOT NULL DEFAULT 'PENDING_APPROVAL',

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    failed_login_attempts INTEGER NOT NULL DEFAULT 0,

    last_login_at TIMESTAMP,

    password_changed_at TIMESTAMP,

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE refresh_tokens
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token TEXT NOT NULL UNIQUE,

    user_id UUID NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_role
ON users(role);

CREATE INDEX idx_users_department
ON users(department_id);

CREATE INDEX idx_users_org
ON users(organization_id);

CREATE INDEX idx_refresh_user
ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_token
ON refresh_tokens(token);
