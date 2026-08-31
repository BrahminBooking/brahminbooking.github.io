-- Keep database consent/application provenance aligned with every reviewed UI
-- locale accepted by the public registration Edge Function.

alter table public.applications
  drop constraint if exists applications_submission_locale_check;
alter table public.applications
  add constraint applications_submission_locale_check check (submission_locale in (
    'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai',
    'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te'
  )) not valid;
alter table public.applications
  validate constraint applications_submission_locale_check;

alter table public.consent_events
  drop constraint if exists consent_events_submission_locale_check;
alter table public.consent_events
  add constraint consent_events_submission_locale_check check (submission_locale in (
    'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai',
    'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te'
  )) not valid;
alter table public.consent_events
  validate constraint consent_events_submission_locale_check;

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
  if p_submission_locale not in (
    'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai',
    'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te'
  ) then
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
