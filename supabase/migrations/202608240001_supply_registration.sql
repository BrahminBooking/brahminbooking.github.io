create extension if not exists pgcrypto;

create sequence if not exists public.application_number_seq start 1;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.next_application_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'BB-BRA-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.application_number_seq')::text, 6, '0');
$$;

create table public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'reviewer', 'read_only')),
  active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  application_number text not null unique default public.next_application_number(),
  application_type text not null check (application_type in ('purohit', 'temple', 'coordinator')),
  status text not null default 'submitted' check (status in (
    'draft', 'submitted', 'initial_review', 'contacted', 'reference_verification',
    'document_verification', 'approved', 'profile_setup', 'active',
    'needs_changes', 'on_hold', 'rejected', 'suspended', 'archived'
  )),
  submission_locale text not null check (submission_locale in ('en', 'hi', 'gu', 'kn')),
  idempotency_key uuid not null unique,
  applicant_full_name text not null,
  applicant_display_name text,
  phone_normalized text not null,
  phone_display text not null,
  whatsapp_normalized text,
  whatsapp_display text,
  email text,
  preferred_contact text not null check (preferred_contact in ('phone', 'whatsapp')),
  preferred_contact_time text,
  city text not null,
  district text not null,
  state text not null,
  country text not null default 'India',
  postal_code text not null,
  referral_code_entered text,
  discovery_source text,
  public_profile_permission boolean not null default false,
  suspected_duplicate boolean not null default false,
  request_fingerprint text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.purohit_details (
  application_id uuid primary key references public.applications(id) on delete restrict,
  birth_year smallint check (birth_year is null or birth_year between 1920 and extract(year from current_date)::int - 18),
  aadhaar_available boolean,
  aadhaar_last_four text check (aadhaar_last_four is null or aadhaar_last_four ~ '^[0-9]{4}$'),
  tradition_code text not null,
  tradition_other text,
  guru_name text,
  affiliation text,
  experience_years smallint not null check (experience_years between 0 and 80),
  background text not null,
  travel_radius_km integer not null check (travel_radius_km between 0 and 1000),
  samagri_capability text not null check (samagri_capability in ('all', 'some', 'none')),
  samagri_notes text,
  dakshina_min_inr numeric check (dakshina_min_inr is null or dakshina_min_inr >= 0),
  dakshina_max_inr numeric check (dakshina_max_inr is null or dakshina_max_inr >= 0),
  charge_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dakshina_range_order check (dakshina_min_inr is null or dakshina_max_inr is null or dakshina_max_inr >= dakshina_min_inr),
  constraint no_last_four_without_availability check (aadhaar_available is true or aadhaar_last_four is null)
);

create table public.application_service_areas (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete restrict,
  area_name text not null,
  created_at timestamptz not null default now(),
  unique (application_id, area_name)
);

create table public.application_languages (
  application_id uuid not null references public.applications(id) on delete restrict,
  language_code text not null,
  spoken boolean not null default false,
  ritual boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (application_id, language_code),
  check (spoken or ritual)
);

create table public.application_services (
  application_id uuid not null references public.applications(id) on delete restrict,
  service_code text not null,
  category text not null check (category in ('puja', 'samskara', 'other')),
  custom_description text,
  created_at timestamptz not null default now(),
  primary key (application_id, service_code)
);

create table public.application_service_modes (
  application_id uuid not null references public.applications(id) on delete restrict,
  mode text not null check (mode in ('home', 'temple', 'remote')),
  created_at timestamptz not null default now(),
  primary key (application_id, mode)
);

create table public.application_references (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete restrict,
  reference_name text not null,
  relationship text,
  phone_normalized text not null,
  phone_display text not null,
  institution text,
  status text not null default 'not_contacted' check (status in ('not_contacted', 'contacted', 'verified', 'failed', 'unreachable')),
  permission_attested boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete restrict,
  consent_type text not null check (consent_type in ('truthfulness', 'contact_and_reference', 'privacy', 'public_profile')),
  granted boolean not null,
  policy_version text not null,
  submission_locale text not null check (submission_locale in ('en', 'hi', 'gu', 'kn')),
  captured_at timestamptz not null default now()
);

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete restrict,
  from_status text,
  to_status text not null,
  actor_type text not null check (actor_type in ('applicant', 'staff', 'system')),
  actor_id uuid,
  reason text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('anonymous', 'staff', 'system')),
  actor_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid not null,
  request_fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.public_registration_attempts (
  id bigint generated always as identity primary key,
  request_fingerprint text not null,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.catalog_languages (
  code text primary key,
  english_label text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table public.catalog_services (
  code text primary key,
  category text not null check (category in ('puja', 'samskara', 'other')),
  english_label text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table public.catalog_traditions (
  code text primary key,
  english_label text not null,
  active boolean not null default true,
  sort_order integer not null default 0
);

insert into public.catalog_languages (code, english_label, sort_order) values
  ('hindi', 'Hindi', 10), ('sanskrit', 'Sanskrit', 20), ('english', 'English', 30),
  ('gujarati', 'Gujarati', 40), ('kannada', 'Kannada', 50), ('marathi', 'Marathi', 60),
  ('telugu', 'Telugu', 70), ('tamil', 'Tamil', 80), ('bengali', 'Bengali', 90), ('other', 'Other', 100);

insert into public.catalog_services (code, category, english_label, sort_order) values
  ('ganesh-puja', 'puja', 'Ganesh Puja', 10), ('satyanarayan-puja', 'puja', 'Satyanarayan Puja', 20),
  ('griha-pravesh', 'puja', 'Griha Pravesh', 30), ('rudrabhishek', 'puja', 'Rudrabhishek', 40),
  ('lakshmi-puja', 'puja', 'Lakshmi Puja', 50), ('navagraha-puja', 'puja', 'Navagraha Puja', 60),
  ('havan-homa', 'puja', 'Havan / Homa', 70), ('vastu-puja', 'puja', 'Vastu Puja', 80),
  ('vivaha', 'samskara', 'Vivaha / Wedding', 110), ('upanayana', 'samskara', 'Upanayana / Janeu', 120),
  ('namakarana', 'samskara', 'Namakarana', 130), ('annaprashana', 'samskara', 'Annaprashana', 140),
  ('mundan', 'samskara', 'Mundan', 150), ('antyeshti', 'samskara', 'Antyeshti', 160),
  ('shraddha', 'samskara', 'Shraddha', 170);

insert into public.catalog_traditions (code, english_label, sort_order) values
  ('smarta', 'Smarta', 10), ('vaishnava', 'Vaishnava', 20), ('shaiva', 'Shaiva', 30),
  ('shakta', 'Shakta', 40), ('swaminarayan', 'Swaminarayan', 50), ('madhva', 'Madhva', 60),
  ('ramanandi', 'Ramanandi', 70), ('other', 'Other', 100);

create index applications_queue_idx on public.applications (status, application_type, submitted_at desc);
create index applications_phone_idx on public.applications (phone_normalized, submitted_at desc);
create index registration_attempts_fingerprint_idx on public.public_registration_attempts (request_fingerprint, created_at desc);
create index status_history_application_idx on public.application_status_history (application_id, created_at desc);
create index audit_events_target_idx on public.audit_events (target_table, target_id, created_at desc);

create trigger set_admin_memberships_updated_at before update on public.admin_memberships for each row execute function public.set_updated_at();
create trigger set_applications_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger set_purohit_details_updated_at before update on public.purohit_details for each row execute function public.set_updated_at();
create trigger set_application_references_updated_at before update on public.application_references for each row execute function public.set_updated_at();

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_memberships
    where user_id = auth.uid() and active
  );
$$;

create or replace function public.has_staff_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_memberships
    where user_id = auth.uid() and active and role = any(required_roles)
  );
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.next_application_number() from public, anon, authenticated;
revoke all on function public.is_active_staff() from public, anon;
revoke all on function public.has_staff_role(text[]) from public, anon;
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.has_staff_role(text[]) to authenticated;

create or replace function public.create_purohit_application(
  p_payload jsonb,
  p_submission_locale text,
  p_idempotency_key uuid,
  p_request_fingerprint text
)
returns table (application_id uuid, application_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application_id uuid;
  v_application_number text;
  v_phone_normalized text;
  v_whatsapp_normalized text;
  v_language text;
  v_area text;
  v_service text;
  v_mode text;
begin
  if p_submission_locale not in ('en', 'hi', 'gu', 'kn') then
    raise exception 'invalid locale';
  end if;

  select a.id, a.application_number
    into v_application_id, v_application_number
  from public.applications a
  where a.idempotency_key = p_idempotency_key;

  if found then
    return query select v_application_id, v_application_number;
    return;
  end if;

  v_phone_normalized := regexp_replace(p_payload->>'phone', '[^0-9]', '', 'g');
  v_whatsapp_normalized := nullif(regexp_replace(coalesce(p_payload->>'whatsapp', ''), '[^0-9]', '', 'g'), '');

  if length(v_phone_normalized) < 10 or length(v_phone_normalized) > 15 then
    raise exception 'invalid phone';
  end if;

  insert into public.applications (
    application_type, submission_locale, idempotency_key, applicant_full_name,
    applicant_display_name, phone_normalized, phone_display, whatsapp_normalized,
    whatsapp_display, email, preferred_contact, preferred_contact_time, city,
    district, state, country, postal_code, referral_code_entered, discovery_source,
    public_profile_permission, suspected_duplicate, request_fingerprint
  ) values (
    'purohit', p_submission_locale, p_idempotency_key, p_payload->>'fullName',
    nullif(p_payload->>'displayName', ''), v_phone_normalized, p_payload->>'phone',
    v_whatsapp_normalized, nullif(p_payload->>'whatsapp', ''), nullif(lower(p_payload->>'email'), ''),
    p_payload->>'preferredContact', nullif(p_payload->>'preferredTime', ''),
    p_payload->>'city', p_payload->>'district', p_payload->>'state', p_payload->>'country',
    p_payload->>'postalCode', nullif(upper(p_payload->>'referralCode'), ''),
    nullif(p_payload->>'discoverySource', ''), coalesce((p_payload->>'publicProfilePermission')::boolean, false),
    exists (select 1 from public.applications a where a.phone_normalized = v_phone_normalized and a.submitted_at > now() - interval '365 days'),
    p_request_fingerprint
  ) returning id, applications.application_number into v_application_id, v_application_number;

  insert into public.purohit_details (
    application_id, birth_year, aadhaar_available, aadhaar_last_four, tradition_code,
    tradition_other, guru_name, affiliation, experience_years, background,
    travel_radius_km, samagri_capability, samagri_notes, dakshina_min_inr,
    dakshina_max_inr, charge_notes
  ) values (
    v_application_id, nullif(p_payload->>'birthYear', '')::smallint,
    case p_payload->>'aadhaarAvailable' when 'yes' then true when 'no' then false else null end,
    case when p_payload->>'aadhaarAvailable' = 'yes' then nullif(p_payload->>'aadhaarLastFour', '') else null end,
    p_payload->>'tradition', nullif(p_payload->>'traditionOther', ''),
    nullif(p_payload->>'guruName', ''), nullif(p_payload->>'affiliation', ''),
    (p_payload->>'experienceYears')::smallint, p_payload->>'background',
    (p_payload->>'travelRadiusKm')::integer, p_payload->>'samagriCapability',
    nullif(p_payload->>'samagriNotes', ''), nullif(p_payload->>'dakshinaMin', '')::numeric,
    nullif(p_payload->>'dakshinaMax', '')::numeric, nullif(p_payload->>'chargeNotes', '')
  );

  for v_area in select distinct trim(value) from regexp_split_to_table(p_payload->>'serviceAreas', ',') value where trim(value) <> '' loop
    insert into public.application_service_areas (application_id, area_name) values (v_application_id, v_area);
  end loop;

  for v_language in
    select distinct value from (
      select jsonb_array_elements_text(p_payload->'spokenLanguages') value
      union all
      select jsonb_array_elements_text(p_payload->'ritualLanguages') value
    ) values_union
  loop
    insert into public.application_languages (application_id, language_code, spoken, ritual)
    values (
      v_application_id,
      v_language,
      (p_payload->'spokenLanguages') ? v_language,
      (p_payload->'ritualLanguages') ? v_language
    );
  end loop;

  for v_service in select jsonb_array_elements_text(p_payload->'pujas') loop
    insert into public.application_services (application_id, service_code, category) values (v_application_id, v_service, 'puja');
  end loop;
  for v_service in select jsonb_array_elements_text(p_payload->'samskaras') loop
    insert into public.application_services (application_id, service_code, category) values (v_application_id, v_service, 'samskara');
  end loop;
  if nullif(p_payload->>'otherServices', '') is not null then
    insert into public.application_services (application_id, service_code, category, custom_description)
    values (v_application_id, 'other-' || substr(encode(digest(p_payload->>'otherServices', 'sha256'), 'hex'), 1, 12), 'other', p_payload->>'otherServices');
  end if;

  for v_mode in select jsonb_array_elements_text(p_payload->'serviceModes') loop
    insert into public.application_service_modes (application_id, mode) values (v_application_id, v_mode);
  end loop;

  if nullif(p_payload->>'referenceName', '') is not null then
    insert into public.application_references (
      application_id, reference_name, relationship, phone_normalized, phone_display, institution
    ) values (
      v_application_id, p_payload->>'referenceName', nullif(p_payload->>'referenceRelationship', ''),
      regexp_replace(p_payload->>'referencePhone', '[^0-9]', '', 'g'), p_payload->>'referencePhone',
      nullif(p_payload->>'referenceInstitution', '')
    );
  end if;

  insert into public.consent_events (application_id, consent_type, granted, policy_version, submission_locale) values
    (v_application_id, 'truthfulness', (p_payload->>'truthConsent')::boolean, 'v0.1', p_submission_locale),
    (v_application_id, 'contact_and_reference', (p_payload->>'contactConsent')::boolean, 'v0.1', p_submission_locale),
    (v_application_id, 'privacy', (p_payload->>'privacyConsent')::boolean, 'v0.1', p_submission_locale),
    (v_application_id, 'public_profile', coalesce((p_payload->>'publicProfilePermission')::boolean, false), 'v0.1', p_submission_locale);

  insert into public.application_status_history (application_id, from_status, to_status, actor_type)
  values (v_application_id, null, 'submitted', 'applicant');

  insert into public.audit_events (actor_type, action, target_table, target_id, request_fingerprint, metadata)
  values ('anonymous', 'application.submitted', 'applications', v_application_id, p_request_fingerprint, jsonb_build_object('locale', p_submission_locale, 'type', 'purohit'));

  return query select v_application_id, v_application_number;
end;
$$;

revoke all on function public.create_purohit_application(jsonb, text, uuid, text) from public, anon, authenticated;
grant execute on function public.create_purohit_application(jsonb, text, uuid, text) to service_role;

alter table public.admin_memberships enable row level security;
alter table public.applications enable row level security;
alter table public.purohit_details enable row level security;
alter table public.application_service_areas enable row level security;
alter table public.application_languages enable row level security;
alter table public.application_services enable row level security;
alter table public.application_service_modes enable row level security;
alter table public.application_references enable row level security;
alter table public.consent_events enable row level security;
alter table public.application_status_history enable row level security;
alter table public.audit_events enable row level security;
alter table public.public_registration_attempts enable row level security;
alter table public.catalog_languages enable row level security;
alter table public.catalog_services enable row level security;
alter table public.catalog_traditions enable row level security;

create policy "staff read own membership" on public.admin_memberships for select to authenticated using (user_id = auth.uid() or public.has_staff_role(array['admin']));
create policy "staff read applications" on public.applications for select to authenticated using (public.is_active_staff());
create policy "staff read purohit details" on public.purohit_details for select to authenticated using (public.is_active_staff());
create policy "staff read service areas" on public.application_service_areas for select to authenticated using (public.is_active_staff());
create policy "staff read application languages" on public.application_languages for select to authenticated using (public.is_active_staff());
create policy "staff read application services" on public.application_services for select to authenticated using (public.is_active_staff());
create policy "staff read application modes" on public.application_service_modes for select to authenticated using (public.is_active_staff());
create policy "staff read references" on public.application_references for select to authenticated using (public.is_active_staff());
create policy "staff read consent" on public.consent_events for select to authenticated using (public.is_active_staff());
create policy "staff read status history" on public.application_status_history for select to authenticated using (public.is_active_staff());
create policy "staff read audit" on public.audit_events for select to authenticated using (public.has_staff_role(array['admin']));
create policy "public read language catalog" on public.catalog_languages for select to anon, authenticated using (active);
create policy "public read service catalog" on public.catalog_services for select to anon, authenticated using (active);
create policy "public read tradition catalog" on public.catalog_traditions for select to anon, authenticated using (active);

grant select on public.catalog_languages, public.catalog_services, public.catalog_traditions to anon, authenticated;
grant select on public.admin_memberships, public.applications, public.purohit_details,
  public.application_service_areas, public.application_languages, public.application_services,
  public.application_service_modes, public.application_references, public.consent_events,
  public.application_status_history, public.audit_events to authenticated;
