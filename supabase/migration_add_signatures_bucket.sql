-- Run this in Supabase Dashboard → SQL Editor on your existing project
-- (same project as migration_add_permissions.sql)
--
-- Creates a PRIVATE storage bucket for reimbursement signature images so the
-- actual PNGs never live in the (public) git repo. Only admins can read/write.

-- 1. Create the bucket (private — public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Restrict all access to admins (reuses the is_admin() helper from migration_add_permissions.sql)
CREATE POLICY "admins_read_signatures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures' AND is_admin());

CREATE POLICY "admins_write_signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures' AND is_admin());

CREATE POLICY "admins_update_signatures"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'signatures' AND is_admin())
  WITH CHECK (bucket_id = 'signatures' AND is_admin());

CREATE POLICY "admins_delete_signatures"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'signatures' AND is_admin());

-- 3. After running this, upload the 4 signature PNGs to the "signatures" bucket
--    via Dashboard → Storage → signatures (source files: ieee-reimbursement/public/signatures/*.png).
--    They should NOT be committed to this repo — see public/.gitignore note.
