# Standalone API migration

Backend source, versioned MySQL migrations, tests, OpenAPI/Postman documentation,
deployment configuration and the data-migration runbook now live in the private
[BrahminBooking API repository](https://github.com/BrahminBooking/brahminbooking-api).

- [Staging deployment and exact operator steps](https://github.com/BrahminBooking/brahminbooking-api/blob/main/docs/STAGING.md)
- [Data migration and rollback](https://github.com/BrahminBooking/brahminbooking-api/blob/main/docs/GO_MYSQL_MIGRATION.md)
- [OpenAPI](https://github.com/BrahminBooking/brahminbooking-api/blob/main/docs/openapi.json)

`https://brahminbooking.github.io` is the staging frontend. Pushes to `main`
automatically build and deploy Pages. The GitHub `staging` environment variable
`NEXT_PUBLIC_API_BASE_URL` selects the Go API at build time. Leave it unset until
the isolated staging API has passed HTTPS, CORS, Auth and form verification;
the existing Supabase transport then remains operational. No failed API write
falls back automatically to another database.

Supabase Auth is retained. Firebase migration is future work. Production MySQL
`brahminbooking`/`bb_app` must never be used by this staging frontend/backend.
The new staging database is `brahminbooking_staging` on the same OCI DB system.
