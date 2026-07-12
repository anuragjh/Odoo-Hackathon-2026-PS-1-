CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

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
    'SUSPENDED',
    'REJECTED'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_name VARCHAR(200) NOT NULL,
    organization_code VARCHAR(30) NOT NULL UNIQUE,

    legal_name VARCHAR(250),
    description TEXT,

    logo_url TEXT,
    website VARCHAR(255),

    email CITEXT NOT NULL UNIQUE,
    phone VARCHAR(25),

    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),

    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    date_format VARCHAR(30) NOT NULL DEFAULT 'DD-MM-YYYY',

    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'FREE',
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,

    max_users INTEGER NOT NULL DEFAULT 10,
    max_assets INTEGER NOT NULL DEFAULT 500,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by UUID,
    updated_by UUID
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_code VARCHAR(20) UNIQUE,

    full_name VARCHAR(120) NOT NULL,

    email CITEXT NOT NULL UNIQUE,

    phone_number VARCHAR(20),

    profile_image_url TEXT,

    password_hash TEXT NOT NULL,

    role role_type NOT NULL DEFAULT 'EMPLOYEE',

    organization_id UUID,

    department_id UUID,

    account_status account_status NOT NULL DEFAULT 'PENDING_APPROVAL',

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    failed_login_attempts INTEGER NOT NULL DEFAULT 0,

    joining_date DATE,

    last_login_at TIMESTAMPTZ,

    password_changed_at TIMESTAMPTZ,

    locked_until TIMESTAMPTZ,

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    department_name VARCHAR(150) NOT NULL,

    department_code VARCHAR(20),

    description TEXT,

    parent_department_id UUID,

    department_head_id UUID,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_department_not_self_parent
        CHECK (parent_department_id IS NULL OR parent_department_id <> id)
);

CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    category_name VARCHAR(120) NOT NULL,

    category_code VARCHAR(20),

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token TEXT NOT NULL UNIQUE,

    user_id UUID NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID,

    actor_id UUID,

    action VARCHAR(80) NOT NULL,

    entity_type VARCHAR(60) NOT NULL,

    entity_id UUID,

    details JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations
    ADD CONSTRAINT fk_org_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_org_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_user_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_user_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_user_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE departments
    ADD CONSTRAINT fk_department_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_parent_department FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_department_head FOREIGN KEY (department_head_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_department_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_department_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE asset_categories
    ADD CONSTRAINT fk_category_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_category_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_category_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX uq_department_name_per_org
    ON departments (organization_id, lower(department_name));

CREATE UNIQUE INDEX uq_department_code_per_org
    ON departments (organization_id, upper(department_code))
    WHERE department_code IS NOT NULL;

CREATE UNIQUE INDEX uq_category_name_per_org
    ON asset_categories (organization_id, lower(category_name));

CREATE UNIQUE INDEX uq_category_code_per_org
    ON asset_categories (organization_id, upper(category_code))
    WHERE category_code IS NOT NULL;

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_department ON users (department_id);
CREATE INDEX idx_users_org ON users (organization_id);
CREATE INDEX idx_users_status ON users (account_status);

CREATE INDEX idx_departments_org ON departments (organization_id);
CREATE INDEX idx_departments_parent ON departments (parent_department_id);
CREATE INDEX idx_departments_head ON departments (department_head_id);
CREATE INDEX idx_departments_active ON departments (organization_id, is_active);

CREATE INDEX idx_categories_org ON asset_categories (organization_id);
CREATE INDEX idx_categories_active ON asset_categories (organization_id, is_active);

CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_token ON refresh_tokens (token);

CREATE INDEX idx_audit_org ON audit_logs (organization_id);
CREATE INDEX idx_audit_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs (created_at);

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON asset_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
