CREATE TYPE asset_status AS ENUM (
    'AVAILABLE',
    'ALLOCATED',
    'RESERVED',
    'UNDER_MAINTENANCE',
    'LOST',
    'RETIRED',
    'DISPOSED'
);

CREATE TYPE asset_condition AS ENUM (
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'DAMAGED'
);

CREATE SEQUENCE asset_tag_seq START 1 INCREMENT 1;

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    asset_tag VARCHAR(30) NOT NULL UNIQUE,

    asset_name VARCHAR(200) NOT NULL,

    category_id UUID NOT NULL,

    department_id UUID NOT NULL,

    location VARCHAR(255) NOT NULL,

    description TEXT,

    serial_number VARCHAR(120),

    manufacturer VARCHAR(120),

    model VARCHAR(120),

    acquisition_date DATE,

    acquisition_cost NUMERIC(14, 2),

    vendor VARCHAR(150),

    warranty_expiry DATE,

    condition asset_condition NOT NULL DEFAULT 'GOOD',

    status asset_status NOT NULL DEFAULT 'AVAILABLE',

    is_shared BOOLEAN NOT NULL DEFAULT FALSE,

    photo_url TEXT,

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_asset_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_asset_category FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    CONSTRAINT fk_asset_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_asset_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_asset_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_asset_cost_non_negative CHECK (acquisition_cost IS NULL OR acquisition_cost >= 0),
    CONSTRAINT chk_asset_warranty_after_acquisition
        CHECK (warranty_expiry IS NULL OR acquisition_date IS NULL OR warranty_expiry >= acquisition_date)
);

CREATE TABLE asset_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    asset_id UUID NOT NULL,

    document_name VARCHAR(200) NOT NULL,

    document_url TEXT NOT NULL,

    document_type VARCHAR(60),

    uploaded_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_document_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE asset_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    asset_id UUID NOT NULL,

    event_type VARCHAR(60) NOT NULL,

    details TEXT,

    actor_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_event_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX uq_asset_serial_per_org
    ON assets (organization_id, upper(serial_number))
    WHERE serial_number IS NOT NULL;

CREATE INDEX idx_assets_org ON assets (organization_id);
CREATE INDEX idx_assets_category ON assets (category_id);
CREATE INDEX idx_assets_department ON assets (department_id);
CREATE INDEX idx_assets_status ON assets (organization_id, status);
CREATE INDEX idx_assets_condition ON assets (organization_id, condition);
CREATE INDEX idx_assets_shared ON assets (organization_id, is_shared);
CREATE INDEX idx_assets_tag ON assets (asset_tag);
CREATE INDEX idx_asset_documents_asset ON asset_documents (asset_id);
CREATE INDEX idx_asset_events_asset ON asset_events (asset_id);

CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
