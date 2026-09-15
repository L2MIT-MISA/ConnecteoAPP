-- Apply only after confirming that public.messages has no equivalent RLS policies.
-- This migration assumes Supabase Auth UUIDs match public.messages.sender_id/receiver_id.

alter table public.messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'connecteo_messages_select_participants'
  ) then
    create policy connecteo_messages_select_participants on public.messages
      for select to authenticated
      using (auth.uid() = sender_id or auth.uid() = receiver_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'connecteo_messages_insert_sender'
  ) then
    create policy connecteo_messages_insert_sender on public.messages
      for insert to authenticated
      with check (auth.uid() = sender_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'connecteo_messages_update_receiver'
  ) then
    create policy connecteo_messages_update_receiver on public.messages
      for update to authenticated
      using (auth.uid() = receiver_id)
      with check (auth.uid() = receiver_id);
  end if;
end
$$;

revoke all on public.messages from anon;
revoke delete on public.messages from authenticated;
revoke update on public.messages from authenticated;
grant select, insert on public.messages to authenticated;
grant update (read) on public.messages to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'messages'
    ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;
