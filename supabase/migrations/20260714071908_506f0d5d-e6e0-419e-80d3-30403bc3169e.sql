-- ============================================================
-- 1) ENUM + tabela de papéis (admin) + função has_role
-- ============================================================
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "users read own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create policy "admins read all roles"
  on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 2) Sequência do número do membro
-- ============================================================
create sequence public.vip_member_seq start 1;

-- ============================================================
-- 3) vip_members
-- ============================================================
create extension if not exists citext;

create table public.vip_members (
  id uuid primary key default gen_random_uuid(),
  member_number int not null unique default nextval('public.vip_member_seq'),
  full_name text not null check (char_length(full_name) between 2 and 80),
  instagram_handle citext not null unique check (char_length(instagram_handle) between 1 and 30),
  city text check (city is null or char_length(city) <= 80),
  status text not null default 'active' check (status in ('active','blocked')),
  access_code text not null,
  invited_by uuid references public.vip_members(id) on delete set null,
  accepted_terms_at timestamptz not null default now(),
  unlocked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  benefits_history jsonb not null default '[]'::jsonb
);

create index vip_members_invited_by_idx on public.vip_members(invited_by);
create index vip_members_status_idx on public.vip_members(status);

grant select, insert, update, delete on public.vip_members to authenticated;
grant all on public.vip_members to service_role;

alter table public.vip_members enable row level security;

-- Membros: nenhum acesso direto por 'anon' ou 'authenticated'.
-- Toda leitura/escrita passa por server functions com service_role.
-- Admins podem ler tudo (para o painel).
create policy "admins read all members"
  on public.vip_members for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admins update members"
  on public.vip_members for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4) vip_benefits
-- ============================================================
create table public.vip_benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  description text,
  type text not null check (type in ('coupon','invite','offer','raffle','early_access','gift')),
  code text,
  active boolean not null default true,
  min_invites int not null default 0 check (min_invites >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vip_benefits_active_idx on public.vip_benefits(active);

grant select, insert, update, delete on public.vip_benefits to authenticated;
grant all on public.vip_benefits to service_role;

alter table public.vip_benefits enable row level security;

create policy "admins manage benefits"
  on public.vip_benefits for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 5) vip_invites
-- ============================================================
create table public.vip_invites (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.vip_members(id) on delete cascade,
  invitee_id uuid references public.vip_members(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index vip_invites_sponsor_idx on public.vip_invites(sponsor_id);
create index vip_invites_status_idx on public.vip_invites(status);

grant select, insert, update, delete on public.vip_invites to authenticated;
grant all on public.vip_invites to service_role;

alter table public.vip_invites enable row level security;

create policy "admins manage invites"
  on public.vip_invites for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 6) vip_events (audit log)
-- ============================================================
create table public.vip_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.vip_members(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index vip_events_member_idx on public.vip_events(member_id);
create index vip_events_type_idx on public.vip_events(type);

grant select, insert, update, delete on public.vip_events to authenticated;
grant all on public.vip_events to service_role;

alter table public.vip_events enable row level security;

create policy "admins read events"
  on public.vip_events for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 7) Trigger updated_at
-- ============================================================
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vip_members_updated
  before update on public.vip_members
  for each row execute function public.tg_set_updated_at();

create trigger vip_benefits_updated
  before update on public.vip_benefits
  for each row execute function public.tg_set_updated_at();