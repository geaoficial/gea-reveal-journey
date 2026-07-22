
ALTER TABLE public.vip_members
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS whatsapp text;

ALTER TABLE public.vip_members
  ALTER COLUMN instagram_handle DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS vip_members_email_unique
  ON public.vip_members (lower(email))
  WHERE email IS NOT NULL;
