-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (ieee-fycintern-tracker Supabase project)
--
-- Lets an admin flag an account (e.g. a dev/test account) as hidden from
-- FYC peer sharing — it never shows up in another student's "classmates
-- sharing their tracker" list and its applications can't be viewed by
-- peers, even if it has FYC access and sharing turned on. It stays
-- fully visible to admins, and can still browse/view other sharing
-- students itself (only its own visibility to others is affected).

-- 1. Opt-out-of-peer-visibility flag (default false = normal visibility)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS hidden_from_peers boolean NOT NULL DEFAULT false;

-- 2. Profile-browsing policy: a hidden profile is no longer returned
--    when other FYC members browse who's sharing.
DROP POLICY IF EXISTS "fyc_members_view_fyc_profiles" ON profiles;

CREATE POLICY "fyc_members_view_fyc_profiles"
  ON profiles FOR SELECT
  USING (can_access_fyc = true AND hidden_from_peers = false AND shares_progress());

-- 3. Shared-applications policy: a hidden member's applications are no
--    longer readable by peers.
DROP POLICY IF EXISTS "fyc_members_view_shared_applications" ON applications;

CREATE POLICY "fyc_members_view_shared_applications"
  ON applications FOR SELECT
  USING (
    shares_progress()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = applications.user_id
        AND p.can_access_fyc = true
        AND p.share_progress = true
        AND p.hidden_from_peers = false
    )
  );

-- To hide a specific account (e.g. a dev/test account) right away:
--   UPDATE profiles SET hidden_from_peers = true WHERE email = 'dev@example.com';
-- Going forward, use the "Hide from FYC peers" checkbox in the admin's
-- Edit Access modal instead of raw SQL.
