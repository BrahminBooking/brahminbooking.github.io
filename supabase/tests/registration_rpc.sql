begin;

set local role service_role;

select * from public.create_purohit_application(
  $payload${
    "fullName": "Acharya Ramesh Sharma",
    "displayName": "Acharya Ramesh",
    "phone": "+91 98765 43210",
    "whatsapp": "",
    "email": "",
    "preferredContact": "phone",
    "preferredTime": "10:00-14:00",
    "birthYear": 1980,
    "aadhaarAvailable": "yes",
    "aadhaarLastFour": "1234",
    "city": "Ahmedabad",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "country": "India",
    "postalCode": "380001",
    "serviceAreas": "Ahmedabad, Gandhinagar",
    "travelRadiusKm": 50,
    "spokenLanguages": ["hindi", "gujarati"],
    "ritualLanguages": ["hindi", "sanskrit"],
    "tradition": "smarta",
    "traditionOther": "",
    "guruName": "",
    "affiliation": "",
    "experienceYears": 20,
    "background": "Traditional study and twenty years of puja service.",
    "pujas": ["ganesh-puja"],
    "samskaras": ["vivaha"],
    "otherServices": "",
    "serviceModes": ["home", "temple"],
    "samagriCapability": "all",
    "samagriNotes": "",
    "dakshinaMin": 1100,
    "dakshinaMax": 5100,
    "chargeNotes": "",
    "referenceName": "",
    "referenceRelationship": "",
    "referencePhone": "",
    "referenceInstitution": "",
    "referralCode": "",
    "discoverySource": "Coordinator",
    "truthConsent": true,
    "contactConsent": true,
    "privacyConsent": true,
    "publicProfilePermission": false,
    "website": ""
  }$payload$::jsonb,
  'en',
  '018f0ec9-7b5a-7ee2-8a90-11f651a6cd2b'::uuid,
  'test-fingerprint'
);

-- Every reviewed UI locale must pass the database trust boundary. Reusing the
-- idempotency key proves this without creating duplicate applications.
do $$
declare
  test_locale text;
begin
  foreach test_locale in array array[
    'en', 'as', 'bn', 'brx', 'doi', 'gu', 'hi', 'kn', 'ks', 'kok', 'mai',
    'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd', 'ta', 'te'
  ] loop
    perform * from public.create_purohit_application(
      '{"fullName":"Idempotent locale check","phone":"+91 98765 43210"}'::jsonb,
      test_locale,
      '018f0ec9-7b5a-7ee2-8a90-11f651a6cd2b'::uuid,
      'test-fingerprint'
    );
  end loop;
end;
$$;

reset role;

do $$
begin
  if (select count(*) from public.applications where idempotency_key = '018f0ec9-7b5a-7ee2-8a90-11f651a6cd2b') <> 1 then
    raise exception 'idempotency failed';
  end if;
  if (select count(*) from public.purohit_details) <> 1 then
    raise exception 'purohit detail insert failed';
  end if;
  if (select count(*) from public.application_service_areas) <> 2 then
    raise exception 'service area insert failed';
  end if;
  if (select count(*) from public.application_languages) <> 3 then
    raise exception 'language insert failed';
  end if;
  if (select count(*) from public.application_status_history where to_status = 'submitted') <> 1 then
    raise exception 'status history insert failed';
  end if;
  if (select count(*) from public.consent_events) <> 4 then
    raise exception 'consent event insert failed';
  end if;
end;
$$;

rollback;
