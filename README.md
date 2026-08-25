# BrahminBooking

Mobile-first supply acquisition and verification for Purohits/Brahmins, temples,
and regional coordinators. The current product slice is the public Purohit
registration at `/register-as-brahmin/`.

## Local development

Requirements: Node.js 22+, npm, and a Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Only browser-safe Supabase values belong in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Never expose a service-role key in a `NEXT_PUBLIC_` variable or GitHub Actions
build environment.

## Supabase setup

Apply the migrations and deploy the public submission function:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase secrets set RATE_LIMIT_SALT=GENERATE_A_LONG_RANDOM_VALUE
npx supabase secrets set ALLOWED_ORIGINS=https://brahminbooking.github.io,http://localhost:3000
npx supabase functions deploy submit-application --no-verify-jwt
```

The function uses Supabase-provided `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` secrets. The service-role value stays inside the
function runtime. Anonymous browsers have no direct read or write policy on
applications.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The production build is a static export in `out/`. GitHub Actions deploys that
directory to GitHub Pages after validation. Configure repository secrets
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then select
GitHub Actions as the Pages source.

## Current boundaries

- Applicant registration requires no account or login.
- Admin authentication and dashboard are planned next, not included yet.
- The public site and registration form support English plus all 22 Scheduled Indian languages.
- Full Aadhaar numbers, bank details, documents, payments, bookings, and customer
  accounts are not collected in this release.
- References are optional in the current pilot configuration.

See [the product plan](docs/PRODUCT_PLAN.md) for architecture, workflow, RLS, and
implementation checkpoints.
