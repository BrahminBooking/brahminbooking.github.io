begin;

select plan(8);
select has_table('public', 'consumer_booking_requests', 'private booking request table exists');
select has_table('public', 'consumer_booking_status_history', 'booking status history exists');
select has_table('public', 'consumer_booking_claim_challenges', 'claim challenge table exists');

set local role anon;
select throws_ok($$ select * from public.consumer_booking_requests $$, '42501', null, 'anonymous users cannot read booking requests');
select throws_ok($$ insert into public.consumer_booking_requests (idempotency_key, service_slug, date_flexible, preferred_time_window, city, area, service_mode, preferred_language, samagri_assistance, full_name, phone_display, phone_normalized, contact_consent_at, privacy_version, request_fingerprint) values (gen_random_uuid(), 'ganesh-puja', true, 'flexible', 'Test city', 'Test area', 'home', 'hindi', 'unsure', 'Test person', '9999999999', '9999999999', now(), 'v1', 'test') $$, '42501', null, 'anonymous users cannot insert booking requests');
select throws_ok($$ select * from public.consumer_booking_claim_challenges $$, '42501', null, 'anonymous users cannot read claim challenges');

reset role;
select function_privs_are('public', 'create_consumer_booking_request', array['jsonb', 'uuid', 'text'], 'service_role', array['EXECUTE'], 'service role can execute booking RPC');
select function_privs_are('public', 'create_consumer_booking_request', array['jsonb', 'uuid', 'text'], 'anon', array[]::text[], 'anonymous role cannot execute booking RPC');

select * from finish();
rollback;
