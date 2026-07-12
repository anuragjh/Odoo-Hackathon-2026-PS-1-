CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE booking_status AS ENUM (
    'UPCOMING',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL,

    resource_id UUID NOT NULL,

    booked_by_user_id UUID NOT NULL,

    purpose VARCHAR(200),

    start_time TIMESTAMPTZ NOT NULL,

    end_time TIMESTAMPTZ NOT NULL,

    status booking_status NOT NULL DEFAULT 'UPCOMING',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_booking_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_resource FOREIGN KEY (resource_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_user FOREIGN KEY (booked_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_booking_time_order CHECK (end_time > start_time),
    CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    ) WHERE (status <> 'CANCELLED')
);

CREATE INDEX idx_bookings_org ON bookings (organization_id);
CREATE INDEX idx_bookings_resource ON bookings (resource_id);
CREATE INDEX idx_bookings_user ON bookings (booked_by_user_id);
CREATE INDEX idx_bookings_status ON bookings (organization_id, status);
CREATE INDEX idx_bookings_start ON bookings (start_time);

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
