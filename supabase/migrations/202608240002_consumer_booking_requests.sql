-- Consumer V0: private guest booking requests, audit history and secure later claim.
create extension if not exists pgcrypto;

alter table public.audit_events drop constraint audit_events_actor_type_check;
alter table public.audit_events add constraint audit_events_actor_type_check check (actor_type in ('anonymous', 'staff', 'customer', 'system'));

create table public.consumer_booking_requests (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique default ('BB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  idempotency_key uuid not null unique,
  service_slug text not null check (length(service_slug) between 1 and 80),
  service_other text check (service_other is null or length(service_other) <= 120),
  preferred_date date,
  date_flexible boolean not null default false,
  preferred_time_window text not null check (preferred_time_window in ('morning', 'afternoon', 'evening', 'flexible')),
  city text not null check (length(city) between 2 and 100),
  area text not null check (length(area) between 2 and 160),
  service_mode text not null check (service_mode in ('home', 'temple', 'remote', 'unsure')),
  preferred_language text not null check (length(preferred_language) between 1 and 40),
  tradition text check (tradition is null or length(tradition) <= 120),
  samagri_assistance text not null check (samagri_assistance in ('all', 'some', 'none', 'unsure')),
  attendee_count integer check (attendee_count is null or attendee_count between 1 and 9999),
  full_name text not null check (length(full_name) between 2 and 120),
  phone_display text not null check (length(phone_display) between 8 and 18),
  phone_normalized text not null check (phone_normalized ~ '^[0-9]{8,15}$'),
  email_normalized text check (email_normalized is null or length(email_normalized) <= 254),
  whatsapp boolean not null default false,
  private_notes text check (private_notes is null or length(private_notes) <= 800),
  contact_consent_at timestamptz not null,
  privacy_version text not null,
  status text not null default 'requested' check (status in ('requested', 'reviewing', 'contacted', 'coordinating', 'confirmed_offline', 'closed', 'cancelled', 'archived')),
  customer_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  request_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (preferred_date is not null or date_flexible),
  check ((service_slug = 'other' and nullif(trim(service_other), '') is not null) or service_slug <> 'other'),
  check ((customer_user_id is null and claimed_at is null) or (customer_user_id is not null and claimed_at is not null))
);

create table public.consumer_booking_status_history (
  id bigint generated always as identity primary key,
  booking_request_id uuid not null references public.consumer_booking_requests(id) on delete restrict,
  from_status text,
  to_status text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_kind text not null check (actor_kind in ('system', 'staff', 'customer')),
  reason text,
  created_at timestamptz not null default now()
);

create table public.consumer_booking_claim_challenges (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.consumer_booking_requests(id) on delete cascade,
  token_hash bytea not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (booking_request_id, token_hash)
);

create table public.public_booking_attempts (
  id bigint generated always as identity primary key,
  request_fingerprint text not null,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create index consumer_booking_requests_status_created_idx on public.consumer_booking_requests(status, created_at desc);
create index consumer_booking_requests_customer_idx on public.consumer_booking_requests(customer_user_id) where customer_user_id is not null;
create index consumer_booking_history_request_idx on public.consumer_booking_status_history(booking_request_id, created_at);
create index public_booking_attempts_fingerprint_created_idx on public.public_booking_attempts(request_fingerprint, created_at desc);
create trigger set_consumer_booking_requests_updated_at before update on public.consumer_booking_requests for each row execute function public.set_updated_at();

alter table public.consumer_booking_requests enable row level security;
alter table public.consumer_booking_status_history enable row level security;
alter table public.consumer_booking_claim_challenges enable row level security;
alter table public.public_booking_attempts enable row level security;

create policy "staff read booking requests" on public.consumer_booking_requests for select to authenticated using (public.is_active_staff());
create policy "customers read claimed booking requests" on public.consumer_booking_requests for select to authenticated using (customer_user_id = auth.uid());
create policy "staff read booking history" on public.consumer_booking_status_history for select to authenticated using (public.is_active_staff());
create policy "customers read own booking history" on public.consumer_booking_status_history for select to authenticated using (exists (select 1 from public.consumer_booking_requests request where request.id = booking_request_id and request.customer_user_id = auth.uid()));

grant select on public.consumer_booking_requests, public.consumer_booking_status_history to authenticated;
revoke all on public.consumer_booking_claim_challenges, public.public_booking_attempts from anon, authenticated;
revoke insert, update, delete on public.consumer_booking_requests, public.consumer_booking_status_history from anon, authenticated;

create or replace function public.create_consumer_booking_request(
  p_payload jsonb,
  p_idempotency_key uuid,
  p_request_fingerprint text
) returns table(public_reference text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  created_request public.consumer_booking_requests;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then raise exception 'not_authorized'; end if;
  select * into created_request from public.consumer_booking_requests where idempotency_key = p_idempotency_key;
  if found then return query select created_request.public_reference; return; end if;

  insert into public.consumer_booking_requests (
    idempotency_key, service_slug, service_other, preferred_date, date_flexible, preferred_time_window,
    city, area, service_mode, preferred_language, tradition, samagri_assistance, attendee_count, full_name,
    phone_display, phone_normalized, email_normalized, whatsapp, private_notes,
    contact_consent_at, privacy_version, request_fingerprint
  ) values (
    p_idempotency_key, p_payload->>'serviceSlug', nullif(trim(p_payload->>'serviceOther'), ''),
    nullif(p_payload->>'preferredDate', '')::date, coalesce((p_payload->>'dateFlexible')::boolean, false), p_payload->>'timeWindow',
    trim(p_payload->>'city'), trim(p_payload->>'area'), p_payload->>'serviceMode', p_payload->>'language',
    nullif(trim(p_payload->>'tradition'), ''), p_payload->>'samagriAssistance', nullif(p_payload->>'attendeeCount', '')::integer,
    trim(p_payload->>'fullName'), trim(p_payload->>'phone'),
    regexp_replace(p_payload->>'phone', '[^0-9]', '', 'g'), nullif(lower(trim(p_payload->>'email')), ''),
    coalesce((p_payload->>'whatsapp')::boolean, false), nullif(trim(p_payload->>'notes'), ''), now(),
    'consumer-privacy-v1', p_request_fingerprint
  ) returning * into created_request;

  insert into public.consumer_booking_status_history (booking_request_id, to_status, actor_kind, reason)
  values (created_request.id, 'requested', 'system', 'Guest booking request submitted');
  insert into public.audit_events (actor_type, action, target_table, target_id, request_fingerprint, metadata)
  values ('system', 'consumer_booking_requested', 'consumer_booking_requests', created_request.id, p_request_fingerprint, jsonb_build_object('public_reference', created_request.public_reference));
  return query select created_request.public_reference;
end;
$$;

revoke all on function public.create_consumer_booking_request(jsonb, uuid, text) from public, anon, authenticated;
grant execute on function public.create_consumer_booking_request(jsonb, uuid, text) to service_role;

create or replace function public.claim_consumer_booking_request(p_token text)
returns text
language plpgsql security definer
set search_path = public, auth, pg_temp
as $$
declare
  challenge public.consumer_booking_claim_challenges;
  request_row public.consumer_booking_requests;
  verified_email text;
  verified_phone text;
begin
  if auth.uid() is null then raise exception 'claim_not_available'; end if;
  select * into challenge from public.consumer_booking_claim_challenges
    where token_hash = digest(p_token, 'sha256') and consumed_at is null and expires_at > now()
    for update skip locked;
  if not found then raise exception 'claim_not_available'; end if;
  select * into request_row from public.consumer_booking_requests where id = challenge.booking_request_id for update;
  select lower(email), regexp_replace(phone, '[^0-9]', '', 'g') into verified_email, verified_phone from auth.users where id = auth.uid();
  if not ((verified_email is not null and verified_email = request_row.email_normalized) or (verified_phone is not null and verified_phone = request_row.phone_normalized)) then raise exception 'claim_not_available'; end if;
  if request_row.customer_user_id is not null and request_row.customer_user_id <> auth.uid() then raise exception 'claim_not_available'; end if;

  update public.consumer_booking_claim_challenges set consumed_at = now() where id = challenge.id;
  update public.consumer_booking_requests set customer_user_id = auth.uid(), claimed_at = now() where id = request_row.id;
  insert into public.audit_events (actor_id, actor_type, action, target_table, target_id, metadata)
  values (auth.uid(), 'customer', 'consumer_booking_claimed', 'consumer_booking_requests', request_row.id, '{}'::jsonb);
  return request_row.public_reference;
end;
$$;

revoke all on function public.claim_consumer_booking_request(text) from public, anon;
grant execute on function public.claim_consumer_booking_request(text) to authenticated;
