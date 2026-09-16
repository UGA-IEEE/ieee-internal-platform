-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (ieee-fycintern-tracker Supabase project)
--
-- Follow-up to migration_add_fyc_sharing.sql / migration_fyc_sharing_reciprocal.sql.
--
-- Turning sharing ON (or cancelling a pending turn-off) takes effect
-- immediately. Turning sharing OFF does not — it schedules the turn-off
-- for 2 days later, and the student's tracker (and their ability to view
-- others') stays active until then. This stops students from flipping
-- sharing on/off on demand to peek at classmates' trackers without
-- reliably exposing their own.

-- 1. When a turn-off is requested, this holds the timestamp it takes
--    effect. NULL = no turn-off pending.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS share_off_requested_at timestamptz;

-- 2. Replace the RPC so it enforces the cooldown instead of flipping the
--    flag immediately in both directions.
CREATE OR REPLACE FUNCTION set_share_progress(new_value boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_value THEN
    -- Turning on, or cancelling a pending turn-off: immediate.
    UPDATE profiles
      SET share_progress = true,
          share_off_requested_at = null
      WHERE id = auth.uid();
  ELSE
    -- Turning off: only schedule it if sharing is currently on and a
    -- turn-off isn't already pending (repeat clicks don't push the
    -- cooldown further out).
    UPDATE profiles
      SET share_off_requested_at = now() + interval '2 days'
      WHERE id = auth.uid()
        AND share_progress = true
        AND share_off_requested_at IS NULL;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION set_share_progress(boolean) TO authenticated;

-- 3. Background job that actually flips share_progress to false once a
--    pending turn-off's cooldown has elapsed. Requires the pg_cron
--    extension (Database → Extensions → pg_cron in the Supabase
--    dashboard, or run the CREATE EXTENSION line below if you have
--    permission to).
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'fyc-sharing-cooldown-flip';

SELECT cron.schedule(
  'fyc-sharing-cooldown-flip',
  '*/15 * * * *',
  $$
    UPDATE profiles
      SET share_progress = false,
          share_off_requested_at = null
      WHERE share_off_requested_at IS NOT NULL
        AND share_off_requested_at <= now();
  $$
);

-- If pg_cron isn't available on your plan/project, skip step 3 and
-- instead create an equivalent scheduled job from Database → Cron Jobs
-- in the Supabase dashboard, running the same UPDATE statement on a
-- recurring schedule (e.g. every 15 minutes).
