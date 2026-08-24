begin;
set local role service_role;

select * from public.create_consumer_booking_request(
  $payload${
    "serviceSlug":"griha-pravesh","serviceOther":"","preferredDate":"","dateFlexible":true,"timeWindow":"flexible",
    "city":"Bengaluru","area":"Jayanagar","serviceMode":"home","language":"kannada",
    "tradition":"smarta","samagriAssistance":"all","attendeeCount":"12","fullName":"Test Devotee","phone":"+91 90000 00000","email":"",
    "whatsapp":true,"notes":"","contactConsent":true,"website":""
  }$payload$::jsonb,
  '018f0ec9-7b5a-7ee2-8a90-11f651a6cd3c'::uuid,
  'consumer-test-fingerprint'
);

select * from public.create_consumer_booking_request(
  '{"serviceSlug":"griha-pravesh"}'::jsonb,
  '018f0ec9-7b5a-7ee2-8a90-11f651a6cd3c'::uuid,
  'consumer-test-fingerprint'
);
reset role;

do $$
begin
  if (select count(*) from public.consumer_booking_requests where idempotency_key = '018f0ec9-7b5a-7ee2-8a90-11f651a6cd3c') <> 1 then raise exception 'booking idempotency failed'; end if;
  if (select count(*) from public.consumer_booking_status_history where to_status = 'requested') <> 1 then raise exception 'initial booking history missing'; end if;
  if (select count(*) from public.audit_events where action = 'consumer_booking_requested') <> 1 then raise exception 'booking audit event missing'; end if;
end;
$$;
rollback;
