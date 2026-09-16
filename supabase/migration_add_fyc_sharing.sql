-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (ieee-fycintern-tracker Supabase project)
--
-- Lets FYC students opt in to letting other FYC students view their
-- internship application tracker (read-only). Off by default — a
-- student's applications stay private to themselves and admins unless
-- they explicitly enable sharing.

-- 1. Opt-in sharing flag (default false = private)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS share_progress boolean NOT NULL DEFAULT false;

-- 2. Helper: does the current logged-in user have FYC tracker access?
--    SECURITY DEFINER so it can read profiles without recursing into the
--    RLS policies that call it.
CREATE OR REPLACE FUNCTION has_fyc_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND can_access_fyc = true
  );
$$;

-- 3. Let FYC members browse the (name/email-level) profile info of other
--    FYC members, so they can see who has sharing enabled.
CREATE POLICY "fyc_members_view_fyc_profiles"
  ON profiles FOR SELECT
  USING (can_access_fyc = true AND has_fyc_access());

-- 4. Let FYC members read another FYC member's applications, but only
--    when that member has turned sharing on.
CREATE POLICY "fyc_members_view_shared_applications"
  ON applications FOR SELECT
  USING (
    has_fyc_access()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = applications.user_id
        AND p.can_access_fyc = true
        AND p.share_progress = true
    )
  );

-- 5. Let a student flip their own sharing flag on/off. Implemented as an
--    RPC (rather than a broad "update own profile" RLS policy) so a
--    student can only ever change share_progress on their own row and
--    can't use the same policy to grant themselves admin/access flags.
CREATE OR REPLACE FUNCTION set_share_progress(new_value boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET share_progress = new_value WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION set_share_progress(boolean) TO authenticated;
