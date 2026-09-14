-- ============================================================
-- 1. Table "profiles"
-- ============================================================
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    email text,
    phoneNumber text,
    date_creation timestamp default now()
);


-- ============================================================
-- 2. Fonction déclenchée à chaque nouvelle inscription
-- ============================================================
create function public.gerer_nouvel_utilisateur()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phoneNumber)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phoneNumber'
  );
  return new;
end;
$$ language plpgsql security definer;
-- Différence avec la version précédente :
-- "new.email"   → vient maintenant de la colonne native de auth.users,
--                 car l'email est l'identifiant de connexion (signUp email+password).
-- "new.raw_user_meta_data->>'phoneNumber'" → le téléphone n'est PLUS natif,
--                 il doit être envoyé manuellement dans options.data lors du signUp.


-- ============================================================
-- 3. Trigger
-- ============================================================
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.gerer_nouvel_utilisateur();


-- ============================================================
-- 4. Sécurité RLS
-- ============================================================
alter table public.profiles enable row level security;

create policy "Lecture de son propre profil"
on public.profiles
for select
using (auth.uid() = id);

create policy "Modification de son propre profil"
on public.profiles
for update
using (auth.uid() = id);