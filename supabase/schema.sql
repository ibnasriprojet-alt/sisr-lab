-- ============================================================
--  SISR://LAB — schéma Supabase (PostgreSQL)
--
--  Supabase → SQL Editor → New query → colle TOUT le contenu
--  de ce fichier brut (sans en-tête de diff, sans ```) → Run
--
--  Le script est idempotent : tu peux le relancer sans erreur.
-- ============================================================

-- 1. Profils utilisateurs (liés à Supabase Auth)
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  year         int check (year in (1, 2)),   -- 1 = 1re année, 2 = 2e année
  created_at   timestamptz not null default now()
);

-- 2. Progression (chapitres validés, XP, quiz, cartes, série…)
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3. Création AUTOMATIQUE du profil à l'inscription.
--    Indispensable si la confirmation e-mail est activée :
--    la ligne existe dès que le compte est confirmé.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  4. Row Level Security : chaque utilisateur ne voit QUE ses
--     propres données (la clé anon peut rester publique).
-- ============================================================
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own" on public.progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
--  Terminé. Tu devrais voir « Success. No rows returned ».
--
--  Pour un test rapide, désactive la confirmation e-mail :
--  Supabase → Authentication → Providers → Email
--  → décocher « Enable email confirmations » → Save.
--  (En production, laisse-la : l'app affiche le message adapté.)
-- ============================================================
