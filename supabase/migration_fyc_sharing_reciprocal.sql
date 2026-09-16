-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (ieee-fycintern-tracker Supabase project)
--
-- Follow-up to migration_add_fyc_sharing.sql: makes sharing reciprocal.
-- A student can only browse/view other members' shared trackers if they
-- have ALSO enabled sharing on their own tracker. Non-sharing students
-- can still see the list length/toggle, but not peers' data.

-- 1. Helper: is the current user an FYC member who has sharing turned on?
CREATE OR REPLACE FUNCTION shares_progress()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND can_access_fyc = true AND share_progress = true
  );
$$;

-- 2. Replace the profile-browsing policy: require the viewer to be
--    sharing too, not just to have FYC access.
DROP POLICY IF EXISTS "fyc_members_view_fyc_profiles" ON profiles;

CREATE POLICY "fyc_members_view_fyc_profiles"
  ON profiles FOR SELECT
  USING (can_access_fyc = true AND shares_progress());

-- 3. Replace the shared-applications policy: same reciprocity
--    requirement on the viewer.
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
    )
  );

-- has_fyc_access() from the previous migration is no longer used by any
-- policy but is left in place in case it's useful elsewhere.
