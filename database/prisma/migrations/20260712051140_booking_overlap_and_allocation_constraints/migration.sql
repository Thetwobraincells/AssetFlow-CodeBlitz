-- This is an empty migration.
-- One active allocation per asset at a time
CREATE UNIQUE INDEX one_active_allocation_per_asset
  ON allocations (asset_id)
  WHERE status = 'active';

-- No overlapping bookings for the same asset
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    asset_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status != 'cancelled');