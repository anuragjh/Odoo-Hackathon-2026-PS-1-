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


-- organization schema

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information
    organization_name VARCHAR(200) NOT NULL,
    organization_code VARCHAR(30) UNIQUE NOT NULL,

    legal_name VARCHAR(250),
    description TEXT,

    logo_url TEXT,
    website VARCHAR(255),

    -- Contact
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(25),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    -- Time & Locale
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    currency VARCHAR(10) DEFAULT 'INR',
    date_format VARCHAR(30) DEFAULT 'DD-MM-YYYY',

    -- Subscription
    subscription_plan VARCHAR(50) DEFAULT 'FREE',
    subscription_start TIMESTAMP,
    subscription_end TIMESTAMP,

    max_users INTEGER DEFAULT 10,
    max_assets INTEGER DEFAULT 500,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    created_by UUID,
    updated_by UUID
);

-- department schema
CREATE TABLE departments
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    department_name VARCHAR(150) NOT NULL,

    department_code VARCHAR(20),

    description TEXT,

    parent_department_id UUID,

    department_head_id UUID,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_department_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_parent_department
        FOREIGN KEY (parent_department_id)
        REFERENCES departments(id),

    CONSTRAINT fk_department_head
        FOREIGN KEY (department_head_id)
        REFERENCES users(id)
);

--asset category schema
CREATE TABLE asset_categories
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    category_name VARCHAR(120) NOT NULL,

    category_code VARCHAR(20),

    description TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category_org
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
);