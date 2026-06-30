-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (ieee-fycintern-tracker Supabase project)

-- 1. Add permission columns (default false for existing members)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS can_access_mediagen boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_access_fyc      boolean NOT NULL DEFAULT false;

-- 2. Grant all existing admins access to both tools
UPDATE profiles
  SET can_access_mediagen = true,
      can_access_fyc      = true
  WHERE role = 'admin';

-- 3. Allow admins to update profiles directly (used for permission toggles in the UI)
CREATE POLICY "admins_update_profiles"
  ON profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());
