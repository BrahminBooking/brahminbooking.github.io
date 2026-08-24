begin;

select plan(8);

select has_table('public', 'applications', 'applications table exists');
select has_table('public', 'purohit_details', 'purohit details table exists');
select has_table('public', 'consent_events', 'consent event table exists');

set local role anon;
select is_empty($$ select * from public.catalog_languages where not active $$, 'anonymous users see only active language rows');
select throws_ok($$ select * from public.applications $$, '42501', null, 'anonymous users cannot select applications');
select throws_ok($$ insert into public.applications (application_type, submission_locale, idempotency_key, applicant_full_name, phone_normalized, phone_display, preferred_contact, city, district, state, country, postal_code) values ('purohit', 'en', gen_random_uuid(), 'Test', '9999999999', '9999999999', 'phone', 'Test', 'Test', 'Test', 'India', '000000') $$, '42501', null, 'anonymous users cannot insert applications');

reset role;
select function_privs_are('public', 'create_purohit_application', array['jsonb', 'text', 'uuid', 'text'], 'service_role', array['EXECUTE'], 'service role can execute registration RPC');
select function_privs_are('public', 'create_purohit_application', array['jsonb', 'text', 'uuid', 'text'], 'anon', array[]::text[], 'anonymous role cannot execute registration RPC');

select * from finish();
rollback;
