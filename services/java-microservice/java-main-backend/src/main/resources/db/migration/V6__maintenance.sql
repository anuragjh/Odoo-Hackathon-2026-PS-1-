CREATE TYPE maintenance_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE maintenance_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'TECHNICIAN_ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED'
);

CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    asset_id UUID NOT NULL,

    raised_by UUID,

    issue_description TEXT NOT NULL,

    priority maintenance_priority NOT NULL DEFAULT 'MEDIUM',

    photo_url TEXT,

    status maintenance_status NOT NULL DEFAULT 'PENDING',

    technician_id UUID,

    technician_name VARCHAR(150),

    approved_by UUID,

    rejection_reason TEXT,

    resolution_notes TEXT,

    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_maintenance_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_raised_by FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_technician FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_maintenance_org ON maintenance_requests (organization_id);
CREATE INDEX idx_maintenance_asset ON maintenance_requests (asset_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests (organization_id, status);
CREATE INDEX idx_maintenance_created ON maintenance_requests (created_at);

CREATE TRIGGER trg_maintenance_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
