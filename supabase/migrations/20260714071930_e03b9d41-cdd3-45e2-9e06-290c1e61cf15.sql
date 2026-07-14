-- Revoke execute on has_role from anon and authenticated (only RLS policies need it,
-- and policies bypass EXECUTE grants when running under the security-definer owner).
revoke execute on function public.has_role(uuid, public.app_role) from public;
revoke execute on function public.has_role(uuid, public.app_role) from anon;
revoke execute on function public.has_role(uuid, public.app_role) from authenticated;

-- Move citext extension out of public schema
create schema if not exists extensions;
alter extension citext set schema extensions;