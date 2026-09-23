-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (ieee-fycintern-tracker Supabase project)
--
-- Adds a second, separate internship application tracker for members who
-- are NOT in FYC. Same feature set as the FYC tracker (log applications,
-- weekly progress, opt-in peer sharing) but on its own table/permission,
-- and with a per-member weekly goal the member can adjust themselves
-- instead of a fixed target.

-- 1. Permission flag + adjustable weekly goal on profiles.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS can_access_general_tracker boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weekly_goal integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS share_progress_general boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_off_requested_at_general timestamptz;

ALTER TABLE profiles
  ADD CONSTRAINT weekly_goal_range CHECK (weekly_goal BETWEEN 1 AND 200);

-- Admins are NOT auto-granted this one: it's a personal tracker, so an
-- admin turns it on for themselves via the toggle in the Admin Dashboard.

-- 2. Applications table for the general tracker. Kept separate from
--    `applications` (the FYC table) so the two trackers' data, weekly
--    targets, and sharing rules never mix.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS general_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  app_number      integer,
  date_applied    date not null,
  company         text not null,
  position_name   text not null,
  reference_link  text,
  location        text,
  pay             text,
  status          text not null default 'applied',
  created_at      timestamptz not null default now()
);

CREATE OR REPLACE FUNCTION set_general_app_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.app_number := COALESCE(
    (SELECT MAX(app_number) FROM general_applications WHERE user_id = NEW.user_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_general_app_number ON general_applications;
CREATE TRIGGER trg_set_general_app_number
  BEFORE INSERT ON general_applications
  FOR EACH ROW EXECUTE FUNCTION set_general_app_number();

ALTER TABLE general_applications ENABLE ROW LEVEL SECURITY;

-- Members manage only their own rows.
CREATE POLICY "users_manage_own_general_applications"
  ON general_applications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view/manage everyone's rows (same pattern as FYC's
-- applications table).
CREATE POLICY "admins_manage_general_applications"
  ON general_applications FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Let a member adjust their own weekly goal. RPC (not a broad "update
--    own profile" policy) so they can only ever touch weekly_goal, not
--    access/admin flags.
CREATE OR REPLACE FUNCTION set_weekly_goal(new_goal integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_goal < 1 OR new_goal > 200 THEN
    RAISE EXCEPTION 'weekly_goal must be between 1 and 200';
  END IF;
  UPDATE profiles SET weekly_goal = new_goal WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION set_weekly_goal(integer) TO authenticated;

-- 4. Opt-in peer sharing for the general tracker — mirrors
--    migration_add_fyc_sharing.sql / _reciprocal / _cooldown / _hide_from_peers,
--    reusing the existing `hidden_from_peers` flag (an account hidden from
--    FYC peers should stay hidden from general-tracker peers too).

CREATE OR REPLACE FUNCTION shares_progress_general()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND can_access_general_tracker = true
      AND share_progress_general = true
  );
$$;

CREATE POLICY "general_members_view_general_profiles"
  ON profiles FOR SELECT
  USING (
    can_access_general_tracker = true
    AND hidden_from_peers = false
    AND shares_progress_general()
  );

CREATE POLICY "general_members_view_shared_general_applications"
  ON general_applications FOR SELECT
  USING (
    shares_progress_general()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = general_applications.user_id
        AND p.can_access_general_tracker = true
        AND p.share_progress_general = true
        AND p.hidden_from_peers = false
    )
  );

CREATE OR REPLACE FUNCTION set_share_progress_general(new_value boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_value THEN
    UPDATE profiles
      SET share_progress_general = true,
          share_off_requested_at_general = null
      WHERE id = auth.uid();
  ELSE
    UPDATE profiles
      SET share_off_requested_at_general = now() + interval '2 days'
      WHERE id = auth.uid()
        AND share_progress_general = true
        AND share_off_requested_at_general IS NULL;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION set_share_progress_general(boolean) TO authenticated;

-- Background flip job, same shape as fyc-sharing-cooldown-flip. Requires
-- pg_cron (Database → Extensions in the Supabase dashboard).
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'general-tracker-sharing-cooldown-flip';

SELECT cron.schedule(
  'general-tracker-sharing-cooldown-flip',
  '*/15 * * * *',
  $$
    UPDATE profiles
      SET share_progress_general = false,
          share_off_requested_at_general = null
      WHERE share_off_requested_at_general IS NOT NULL
        AND share_off_requested_at_general <= now();
  $$
);

-- If pg_cron isn't available on your plan/project, skip the block above
-- and instead create an equivalent scheduled job from Database → Cron
-- Jobs in the Supabase dashboard, running the same UPDATE on a recurring
-- schedule (e.g. every 15 minutes).
