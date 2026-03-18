-- Stores one-time 6-digit codes for password reset verification
CREATE TABLE IF NOT EXISTS public.password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL CHECK (char_length(code) = 6),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON public.password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON public.password_resets(expires_at);

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Public reset flow needs insert/select/update by email+code from client.
-- Keep this narrow and only for this table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'password_resets'
      AND policyname = 'Allow anon insert reset codes'
  ) THEN
    CREATE POLICY "Allow anon insert reset codes"
      ON public.password_resets
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'password_resets'
      AND policyname = 'Allow anon select reset codes'
  ) THEN
    CREATE POLICY "Allow anon select reset codes"
      ON public.password_resets
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'password_resets'
      AND policyname = 'Allow anon update reset codes'
  ) THEN
    CREATE POLICY "Allow anon update reset codes"
      ON public.password_resets
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Required for password hashing in auth.users updates
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove legacy overload if present to avoid PostgREST resolving the wrong function variant
DROP FUNCTION IF EXISTS public.reset_password_with_code(TEXT, TEXT, UUID);

-- Server-side password update for verified code flow
CREATE OR REPLACE FUNCTION public.reset_password_with_code(
  p_email TEXT,
  p_reset_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_reset public.password_resets;
BEGIN
  IF p_new_password IS NULL OR char_length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;

  SELECT *
  INTO v_reset
  FROM public.password_resets
  WHERE id = p_reset_id
    AND lower(email) = lower(p_email)
    AND used = true
    AND expires_at >= now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired reset session.';
  END IF;

  UPDATE auth.users
  SET encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE lower(email::text) = lower(p_email);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User account not found.';
  END IF;

  DELETE FROM public.password_resets
  WHERE lower(email) = lower(p_email);

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_password_with_code(TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_password_with_code(TEXT, UUID, TEXT) TO anon, authenticated;

-- Preferred unique RPC target to avoid overload/schema-cache mismatches in PostgREST
CREATE OR REPLACE FUNCTION public.reset_password_with_code_v1(
  p_email TEXT,
  p_reset_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_reset public.password_resets;
BEGIN
  IF p_new_password IS NULL OR char_length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;

  SELECT *
  INTO v_reset
  FROM public.password_resets
  WHERE id = p_reset_id
    AND lower(email) = lower(p_email)
    AND used = true
    AND expires_at >= now()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired reset session.';
  END IF;

  UPDATE auth.users
  SET encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE lower(email::text) = lower(p_email);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User account not found.';
  END IF;

  DELETE FROM public.password_resets
  WHERE lower(email) = lower(p_email);

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_password_with_code_v1(TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_password_with_code_v1(TEXT, UUID, TEXT) TO anon, authenticated;