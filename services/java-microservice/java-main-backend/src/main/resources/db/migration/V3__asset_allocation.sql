CREATE TYPE allocation_status AS ENUM (
    'ACTIVE',
    'RETURNED',
    'OVERDUE'
);

CREATE TYPE transfer_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE asset_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    asset_id UUID NOT NULL,

    allocated_to_user_id UUID,

    allocated_department_id UUID,

    allocated_by UUID,

    allocated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expected_return_date DATE,

    actual_return_date TIMESTAMPTZ,

    status allocation_status NOT NULL DEFAULT 'ACTIVE',

    notes TEXT,

    return_notes TEXT,

    return_condition asset_condition,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_allocation_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_user FOREIGN KEY (allocated_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_allocation_department FOREIGN KEY (allocated_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_allocation_by FOREIGN KEY (allocated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_allocation_single_target
        CHECK ((allocated_to_user_id IS NOT NULL)::int + (allocated_department_id IS NOT NULL)::int = 1)
);

CREATE TABLE transfer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    asset_id UUID NOT NULL,

    from_user_id UUID,

    to_user_id UUID,

    to_department_id UUID,

    reason TEXT,

    status transfer_status NOT NULL DEFAULT 'PENDING',

    approved_by UUID,

    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transfer_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_transfer_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_transfer_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_transfer_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_transfer_to_department FOREIGN KEY (to_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_transfer_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_transfer_single_target
        CHECK ((to_user_id IS NOT NULL)::int + (to_department_id IS NOT NULL)::int = 1)
);

CREATE UNIQUE INDEX uq_active_allocation_per_asset
    ON asset_allocations (asset_id)
    WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX uq_pending_transfer_per_asset
    ON transfer_requests (asset_id)
    WHERE status = 'PENDING';

CREATE INDEX idx_allocations_org ON asset_allocations (organization_id);
CREATE INDEX idx_allocations_asset ON asset_allocations (asset_id);
CREATE INDEX idx_allocations_user ON asset_allocations (allocated_to_user_id);
CREATE INDEX idx_allocations_department ON asset_allocations (allocated_department_id);
CREATE INDEX idx_allocations_status ON asset_allocations (organization_id, status);
CREATE INDEX idx_allocations_expected_return ON asset_allocations (expected_return_date);

CREATE INDEX idx_transfers_org ON transfer_requests (organization_id);
CREATE INDEX idx_transfers_asset ON transfer_requests (asset_id);
CREATE INDEX idx_transfers_status ON transfer_requests (organization_id, status);

CREATE TRIGGER trg_allocations_updated_at
    BEFORE UPDATE ON asset_allocations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_transfers_updated_at
    BEFORE UPDATE ON transfer_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
