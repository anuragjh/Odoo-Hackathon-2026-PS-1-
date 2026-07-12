CREATE TYPE audit_cycle_status AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'CLOSED'
);

CREATE TYPE audit_result AS ENUM (
    'PENDING',
    'VERIFIED',
    'MISSING',
    'DAMAGED'
);

CREATE TABLE audit_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    name VARCHAR(200) NOT NULL,

    scope_department_id UUID,

    scope_location VARCHAR(255),

    start_date DATE,

    end_date DATE,

    status audit_cycle_status NOT NULL DEFAULT 'PLANNED',

    created_by UUID,

    closed_by UUID,

    closed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cycle_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_cycle_department FOREIGN KEY (scope_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_cycle_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_cycle_closed_by FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE audit_cycle_auditors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cycle_id UUID NOT NULL,

    user_id UUID NOT NULL,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_auditor_cycle FOREIGN KEY (cycle_id) REFERENCES audit_cycles(id) ON DELETE CASCADE,
    CONSTRAINT fk_auditor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_cycle_auditor UNIQUE (cycle_id, user_id)
);

CREATE TABLE audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cycle_id UUID NOT NULL,

    asset_id UUID NOT NULL,

    result audit_result NOT NULL DEFAULT 'PENDING',

    notes TEXT,

    audited_by UUID,

    audited_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_item_cycle FOREIGN KEY (cycle_id) REFERENCES audit_cycles(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_audited_by FOREIGN KEY (audited_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_cycle_asset UNIQUE (cycle_id, asset_id)
);

CREATE INDEX idx_cycles_org ON audit_cycles (organization_id, status);
CREATE INDEX idx_auditors_cycle ON audit_cycle_auditors (cycle_id);
CREATE INDEX idx_auditors_user ON audit_cycle_auditors (user_id);
CREATE INDEX idx_items_cycle ON audit_items (cycle_id);
CREATE INDEX idx_items_result ON audit_items (cycle_id, result);

CREATE TRIGGER trg_cycles_updated_at
    BEFORE UPDATE ON audit_cycles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
