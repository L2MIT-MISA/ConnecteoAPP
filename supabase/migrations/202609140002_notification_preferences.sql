-- Optional migration. Apply only after validating that no existing user-preference
-- table already owns these settings, then replace notificationPreferencesRepository.

create table if not exists public.notification_preferences (
  user_id uuid primary key,
  new_messages boolean not null default true,
  contact_requests boolean not null default true,
  network_alerts boolean not null default false,
  sound boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy notification_preferences_select_own on public.notification_preferences
  for select to authenticated using (auth.uid() = user_id);

create policy notification_preferences_insert_own on public.notification_preferences
  for insert to authenticated with check (auth.uid() = user_id);

create policy notification_preferences_update_own on public.notification_preferences
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
