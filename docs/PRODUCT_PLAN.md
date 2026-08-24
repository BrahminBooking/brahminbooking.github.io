# BrahminBooking Supply Acquisition and Verification V0

Status: **Plan approved; public Purohit registration implemented locally and
awaiting Supabase project deployment.**

### Implementation status — 24 August 2026

| Checkpoint | Status |
| --- | --- |
| 0 — Plan approval | Complete; registration decisions recorded below |
| 1 — Static application foundation | Complete; GitHub Pages static export and CI workflows added |
| 2 — Supabase security foundation | Registration schema/RLS complete; admin workflow tables continue with dashboard work |
| 3 — Purohit registration | Complete locally in English, Hindi, Gujarati, and Kannada |
| 4 — Secure submission | Migration and Edge Function implemented and locally validated; production deployment requires Supabase project credentials |
| 5 onward | Not started |

### Confirmed product decisions

- The canonical public registration URL is `/register-as-brahmin/`.
- Registration is public and does not require an applicant account or login.
- The first registration release supports English, Hindi, Gujarati, and Kannada
  simultaneously.
- Geography remains generic for now; V0 does not assume or hard-code a pilot
  city, district, or state.
- GitHub Pages hosts the static application using the same overall deployment
  topology as Dayframe; Supabase supplies the database, RLS, Auth for admins, and
  privileged backend functions.
- Full Aadhaar remains excluded from initial registration. The current safe
  design is an optional Aadhaar availability declaration plus optional last four
  digits only.
- A successfully verified reference is not mandatory for submission or approval
  in the first pilot configuration. References can still be provided and checked.
- Codex will draft and review all four message catalogues before launch; external
  native-speaker review remains a recommended later quality check, not a launch
  blocker.

## 1. Product Intent

BrahminBooking will begin as a supply-first, trust-first marketplace. Its first
release is an operational system for acquiring, verifying, and activating a
high-quality network of Purohits/Brahmins, temples, and regional coordinators.
The initial advantage is institutional and ground-network support through a
Peethadheesh and his network of chelas, Purohits, and temples.

The V0 product is successful when the team can reliably move real applicants
from referral or self-registration through documented human verification, then
operate a small pilot without spreadsheets becoming the source of truth.

### Pilot target

- 25-50 verified Purohits
- 5 registered temples
- 1 concentrated pilot geography
- First 5-10 bookings coordinated manually outside the product

### V0 priorities

1. Purohit registration
2. Temple registration
3. Regional coordinator registration
4. Internal admin verification dashboard
5. Public consumer discovery and booking only in a later release

### Explicitly out of scope

- Customer accounts or customer authentication
- Online booking and automated matching
- Payments, payouts, bank details, or financial KYC
- Chat or in-product calling
- Reviews and ratings
- Complex availability calendars
- Native iOS or Android apps
- Full Aadhaar collection or storage
- Automated verification decisions
- Public provider directory in V0 (the data model will permit one later)

## 2. Users and Core Journeys

### Purohit applicant

Opens `/register-as-brahmin/`, chooses English, Hindi, Gujarati, or Kannada,
completes a mobile-first guided form, reviews consent, submits once, and receives
an application reference number plus realistic follow-up expectations. No
applicant account or authentication is required. Draft progress is kept locally
on the device until submission; it is not a durable cross-device account.

### Temple representative

Registers a temple, the authorized contact, affiliations, location, and services.
The team verifies both the institution and the representative's relationship to
it.

### Regional coordinator applicant

Registers identity, geography, network/institution relationship, relevant
experience, languages, references, and consent. Approval does not automatically
grant admin access. Staff access is a separate, explicit action.

### Reviewer/admin

Signs in with an invited Supabase Auth account, works a filterable application
queue, reviews complete application details, records calls and checks, requests
changes, moves applications through allowed statuses, awards badges, and sees an
audit trail.

## 3. Purohit Registration Scope

The public form is a short, mobile-first sequence rather than one long page.
Suggested steps and fields follow.

### A. Identity and contact

- Legal/full name and optional public/display name
- Mobile number, WhatsApp availability/number, and optional email
- Preferred contact method and preferred contact time
- Optional year of birth (avoid collecting full date unless operations prove it
  necessary)
- Optional `Aadhaar available for later private verification` choice. If a
  numeric field is approved, collect no more than the last four digits in V0 and
  label it optional; it is not itself an identity verification.
- Profile photo optional at initial submission

Do not request or store a full Aadhaar number in the initial application database.
Current UIDAI regulations state that an Offline Verification Seeking Entity may
not collect, use, or store an Aadhaar number except in accordance with the Act and
regulations, and UIDAI's paperless offline e-KYC is designed to verify identity
without collecting or storing that number. A full-number workflow therefore
needs a separate legal/security design and is disproportionate to this pilot. If
an identity document is requested later, instruct the applicant to use an
accepted, redacted document where operationally and legally appropriate.

### B. Location and service area

- Home city/town/village, district, state, country, and PIN/postal code
- Service areas (one or more named localities/cities/districts)
- Maximum travel radius in kilometres
- Service modes: at devotee's home, at temple, and remote/online

Precise home street address is not required for the initial public form. It can
be collected privately later only if pilot operations require it.

### C. Practice and experience

- Languages spoken and languages used for conducting rituals
- Sampradaya/tradition and optional sub-tradition
- Guru, institution, matha/peetha, or temple affiliation claims
- Years of experience and optional start year
- Short background/biography
- Training path or qualifications, as free text for V0

### D. Services

- Pujas performed, selected from a seeded catalogue plus `Other`
- Samskaras performed, selected from a seeded catalogue plus `Other`
- Other religious services or specializations
- Whether the applicant can arrange all samagri, some samagri, or none
- Samagri notes
- Indicative minimum and maximum dakshina/service range in INR, clearly labelled
  non-binding
- Travel or other common additional-charge notes

### E. Trust network and references

- Up to three optional references
- Reference name, relationship, institution/temple, phone, and location
- Coordinator/referral code when available
- How the applicant heard about BrahminBooking

References' contact data is private and used only for verification. The form must
state that applicants should have permission to share it.

### F. Consent

- Required truthfulness declaration
- Required consent to be contacted and have references contacted
- Required acknowledgement of the privacy notice and terms version
- Separate optional permission to create/publish a public profile after approval
- Consent timestamps and the displayed policy versions recorded at submission

Public-profile permission is not bundled into operational consent and may be
revoked later. It never makes the private application record public.

### G. Localization

The same form launches in all four supported languages:

| Code | Language | Script |
| --- | --- | --- |
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `gu` | Gujarati | Gujarati |
| `kn` | Kannada | Kannada |

- Use the free/open-source `next-intl` library and checked-in ICU/JSON message
  files; no paid translation API is needed for V0.
- Keep one stable set of Zod field keys and database values. Only labels, help
  text, choices, validation messages, consent copy, and receipts are translated.
- Show a visible language switcher and persist the selected language locally.
  Switching language must preserve entered form values.
- Store `submission_locale` on the application and use it for staff follow-up.
- English is the canonical source copy. Codex drafts and reviews Hindi, Gujarati,
  and Kannada in the repository, including consent, privacy, identity, and
  submission language. Independent native-speaker review remains recommended
  before scaling beyond the pilot.
- Use system fonts with appropriate script fallbacks initially and test on common
  Android devices. Do not render Indian-language copy as images.
- URLs remain stable and language-neutral in V0: `/register-as-brahmin/` with an
  in-page language choice. Locale-prefixed duplicate routes are unnecessary for
  this operational form.

## 4. Temple and Coordinator Registration Scope

Temple registration includes temple name, primary deity, tradition, established
year if known, full temple address and map link, official contact channels,
authorized representative, representative role, managing trust/institution,
registration identifier if applicable, services/facilities, affiliations,
references, referral code, and consent. Document collection happens privately
when verification reaches the relevant stage.

Coordinator registration includes identity/contact, base location, proposed
coverage areas, languages, relationship to the Peethadheesh/institution/network,
relevant community or field experience, approximate Purohit/temple network size,
references, referral source, availability, and consent.

The three application types share the same workflow and audit model, while their
type-specific answers remain in separate tables.

## 5. Verification Operations

### Main workflow

`Draft -> Submitted -> Initial Review -> Contacted -> Reference Verification -> Document Verification -> Approved -> Profile Setup -> Active`

### Alternative states

- `Needs Changes`: applicant input is required; reviewer records the request
- `On Hold`: temporarily paused with a reason and optional review date
- `Rejected`: verification failed or applicant is unsuitable; reason required
- `Suspended`: an approved/active supply record is temporarily disabled
- `Archived`: retained but removed from normal operational queues

### Transition rules

- Normal progression is sequential; exceptional forward skips require an admin
  reason.
- `Needs Changes` may be entered from review stages and returns to the stage that
  requested the change after the change is resolved.
- `On Hold` records the previous status and resumes to it.
- Only admins may mark `Rejected`, `Suspended`, or `Archived`.
- `Approved` means verification requirements passed; it is distinct from
  `Active`, which means profile setup and operational onboarding are complete.
- Every transition records actor, previous and new status, UTC timestamp, and
  reason/notes where required.
- The database transition function is the final enforcement point; hiding a UI
  button is not authorization.

### Verification checklist and evidence

Reviewers record outcomes for initial review, contact attempt, reference checks,
document checks, affiliation checks, training/onboarding, and profile readiness.
Each check has an assignee, result, timestamps, notes, and optional supporting
document reference. Notes are always private.

### Badges

- Identity Verified
- Reference Verified
- Temple Affiliated
- Institution Verified
- Platform Trained
- Bookings Completed

Each awarded badge stores who awarded it, when, supporting verification check,
and optional expiry/revocation data. `Bookings Completed` remains unavailable or
manually recorded during V0 because booking automation is out of scope.

### Minimum approval policy for the pilot

Before `Approved`, require successful contact, identity check completion, and
resolution of material inconsistencies. A verified reference is useful evidence
but is not mandatory in the initial pilot configuration. Temple/Institution
badges require separate evidence; they are not automatically granted because
affiliation was claimed.

## 6. Architecture Proposal

### Deployment boundary

The end-to-end system can use GitHub Pages, with an important split:

```text
Mobile/desktop browser
        |
        | static HTML/CSS/JS
        v
GitHub Pages (Next.js static export)
        |
        | HTTPS using Supabase anon session or public endpoint
        v
Supabase
  - Auth: invited admins only
  - Edge Functions: validated public writes and privileged workflows
  - PostgreSQL: RLS-protected source of truth
  - Private Storage: verification documents
```

GitHub Pages runs no application server. Therefore:

- Configure Next.js for static export (`output: 'export'`), trailing slash-safe
  routing, and unoptimized/local images where required.
- Do not use Server Components that require runtime data, server actions, route
  handlers, middleware, ISR, SSR, or Next.js runtime image optimization.
- Fetch runtime data from Supabase in the browser after authentication.
- Keep the Supabase service-role key only in Supabase Edge Function secrets,
  never in GitHub Actions output or browser bundles.
- The Supabase URL and anon key are public identifiers; RLS remains the security
  boundary.
- The repository name is an organization/user Pages domain, so the expected base
  path is `/`. Revisit `basePath` only if deployment changes to a project site.
- Generate a real static page for `/register-as-brahmin/`, so direct links and
  refreshes work on GitHub Pages without hash URLs or an SPA 404 workaround.

This mirrors Dayframe's proven operating boundary—GitHub Actions builds a static
frontend with browser-safe Supabase values, GitHub Pages serves it, and Supabase
owns persistent data and security. BrahminBooking keeps Next.js rather than
copying Dayframe's Vite/HashRouter implementation because static Next.js pages
provide the requested clean registration URL directly.

### Public submission

The recommended V0 trust boundary is a `submit-application` Edge Function:

1. The browser validates with Zod for immediate feedback.
2. The function repeats validation, normalizes data, verifies basic abuse
   controls (honeypot, rate limit, payload limit, allowed origin), and writes the
   application transactionally with the service role.
3. PostgreSQL assigns an opaque UUID and human-friendly application number,
   appends the initial status event, and returns only the reference number.
4. Anonymous clients receive no `select` access to application data.

Local device storage may hold an unfinished draft after explicit notice. It must
not hold document contents, admin data, or more PII than the form already shows.
Server-side drafts are deferred unless field testing demonstrates a need for
cross-device recovery.

### Document collection

Initial registration does not need identity documents. During review, an admin
can send an expiring, single-purpose upload link. A Supabase Edge Function
validates the capability, generates a randomized private object path, validates
file type/size, and creates a short-lived signed upload. The link must expire and
be revocable. Reviewers access documents through short-lived signed read URLs.

This keeps documents outside GitHub Pages and avoids broad anonymous Storage
permissions. Malware scanning can be added before broader rollout; V0 should at
least enforce an allow-list, a conservative size limit, random filenames, and no
inline rendering of untrusted uploads.

### Admin application

The admin route is a statically hosted client shell. Supabase Auth manages invited
admin sessions. After login, the client reads RLS-authorized data. Sensitive
mutations such as workflow transitions, badge awards, staff role changes, and
signed document access use database RPCs or Edge Functions that verify both the
session and staff role and write audit records transactionally.

## 7. Proposed Database Schema

All IDs are UUIDs, timestamps are UTC `timestamptz`, and mutable tables have
`created_at`/`updated_at`. Enums may be PostgreSQL enums or constrained text;
constrained lookup tables are preferable where pilot vocabulary will evolve.

### Identity, access, and referral

| Table | Purpose and important fields |
| --- | --- |
| `admin_memberships` | `user_id` (FK to `auth.users`), role (`admin`, `reviewer`, `read_only`), active, invited_by, created_at. Only an admin can manage membership. |
| `referral_codes` | unique normalized code, owner coordinator/application or institution label, coverage area, active dates, active flag. |
| `consent_events` | application_id, consent type, granted boolean, policy version, captured_at, capture source. Append-only. |

Coordinator approval does not create an `admin_memberships` row automatically.

### Applications and type-specific answers

| Table | Purpose and important fields |
| --- | --- |
| `applications` | application_number, type (`purohit`, `temple`, `coordinator`), status, applicant name, phones, email, preferred contact, base location fields, referral_code_id, source, submission_locale, submitted_at, previous_status_for_resume, public_profile_permission, status timestamps. Private source record. |
| `purohit_details` | application_id (unique FK), public/display name, optional birth year, optional Aadhaar-available flag and optional last-four-only field if approved, tradition and sub-tradition, guru/training/background, experience years/start year, travel radius, samagri capability/notes, indicative fee min/max/currency, extra charge notes. Never stores full Aadhaar. |
| `temple_details` | application_id, temple name, primary deity, tradition, established year, address/map link, official contacts, representative name/role, managing institution, optional registration identifier, facilities/notes. |
| `coordinator_details` | application_id, coverage description, network relationship, experience, approximate network size, availability, notes. |
| `application_service_areas` | application_id, locality/city, district, state, country, postal code, optional radius/priority. |
| `application_affiliations` | application_id, type (`guru`, `temple`, `matha_peetha`, `institution`, `other`), name, location, contact, claim notes, verification state/check ID. |
| `application_references` | application_id, name, relationship, institution, phone, location, permission attested, status. Strictly private. |

### Controlled vocabularies and many-to-many selections

| Table | Purpose and important fields |
| --- | --- |
| `languages` | stable code, display label, active, sort order. |
| `services` | stable code, category (`puja`, `samskara`, `other`), display label, active, sort order. |
| `traditions` | stable code, display label, optional parent, active. |
| `application_languages` | application_id, language_id, spoken flag, ritual flag. |
| `application_services` | application_id, service_id, experience/notes; custom value for `other` only. |
| `application_service_modes` | application_id, mode (`home`, `temple`, `remote`). |

Seeded catalogue changes must be migrations so forms and historical data remain
consistent. Admin-editable catalogue management is not needed in V0.

### Verification, documents, and audit

| Table | Purpose and important fields |
| --- | --- |
| `verification_checks` | application_id, type, result (`pending`, `passed`, `failed`, `inconclusive`, `waived`), assignee, started/completed timestamps, private notes. |
| `application_status_history` | application_id, from_status, to_status, actor_id, reason, created_at. Append-only. |
| `verification_badges` | application_id, badge type, status (`active`, `revoked`, `expired`), awarded_by/at, supporting_check_id, expires_at, revoked_by/at/reason. Unique active badge per application/type. |
| `documents` | application_id, verification_check_id, document type, private bucket/object path, original display name, MIME, byte size, checksum, uploaded_at, uploaded_by type/id, review state. Metadata only; object remains private. |
| `document_upload_grants` | application_id, token hash (never plaintext), allowed document type, expires_at, max uploads, used/revoked timestamps. |
| `admin_notes` | application_id, author_id, note, created_at; private and append-only or correction-linked. |
| `audit_events` | actor type/id, action, target table/id, request/correlation ID, minimal before/after metadata, created_at. Append-only and PII-minimized. |

### Public projection (reserved, not exposed in V0)

| Table | Purpose and important fields |
| --- | --- |
| `public_profiles` | application_id, slug, approved public name, coarse location, bio, public contact policy, publication state/timestamps. Created only after approval, profile setup, and permission. |
| `public_profile_languages`, `public_profile_services`, `public_profile_badges` | Curated projections rather than direct access to private application joins. |

These tables may be created only when Profile Setup work needs them. Do not grant
public access to the private application tables to build a directory.

### Important constraints and indexes

- Unique application number and normalized active referral code
- One type-detail row matching each application's declared type
- Fee values non-negative and maximum not less than minimum
- Birth/established/start years within reasonable ranges
- Travel radius and file sizes capped
- Unique language/service/mode selection per application
- Unique active badge per application and badge type
- Index queue queries on `(status, type, submitted_at)` and assignment/check
  queries on assignee/result
- Lowercase/normalized indexes for operational email and phone duplicate checks;
  suspected duplicates are flagged, not silently merged
- Foreign keys use restrictive deletion for audit/history and explicit archival
  instead of cascading away verification evidence

## 8. RLS and Authorization Model

RLS is enabled for every exposed table. The default posture is deny. The
service-role bypass is used only inside reviewed Supabase Edge Functions and is
never delivered to a browser.

| Actor | Applications/PII | Verification/audit | Documents | Catalogues | Public profiles |
| --- | --- | --- | --- | --- | --- |
| Anonymous browser | No direct read/write; submits through rate-limited Edge Function | None | No direct listing/read; capability-based signed upload only | Read active rows | Read published projection only when later enabled |
| Authenticated non-staff | None (no such product user in V0) | None | None | Read active rows | Same public reads only |
| `read_only` staff | Read applications and checks | Read history/notes/audit as policy permits | Signed read through authorized function | Read | Read |
| `reviewer` | Read/update operational fields through scoped policies/functions | Create checks/notes; permitted normal transitions; award permitted badges | Signed read and metadata update | Read | Prepare profile data, cannot publish unless granted |
| `admin` | Full operational access, not hard delete | All transitions, badge revoke, staff/referral management, audit read | Signed read, quarantine/revoke | Manage seed data only through migrations in V0 | Publish/unpublish later |
| Edge Function service role | Only the operation implemented by that function | Transactional history/audit writes | Signed URLs and constrained metadata | Read | Constrained writes for profile setup later |

### Policy mechanics

- `is_active_staff()` and `has_staff_role(required_roles[])` are stable,
  security-definer helper functions with a locked `search_path`; execute grants
  are minimal.
- Staff cannot update their own role through ordinary table updates.
- Direct updates cannot change `applications.status`; a transition RPC validates
  the state graph, role, required reason/checks, and writes status plus history
  and audit in one transaction.
- Status history, consent events, audit events, and awarded/revoked badge history
  are not directly updateable or deletable from the client.
- Storage bucket `verification-documents` is private. Object paths use randomized
  IDs, not phone numbers or names. Admin access uses short-lived signed URLs
  issued after authorization.
- The public submission function has a narrowly scoped payload, idempotency key,
  origin allow-list, bot honeypot, per-IP/per-phone throttling, and generic error
  responses. CAPTCHA can be added if pilot abuse warrants it.
- Admin list queries return only fields needed by the queue. Full PII is loaded
  on an authorized detail view, reducing accidental exposure.
- Policy integration tests cover anonymous, unauthenticated, reviewer, admin,
  inactive staff, and service-function behavior.

## 9. Proposed Repository Structure

```text
.
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── docs/
│   ├── PRODUCT_PLAN.md
│   ├── DATA_DICTIONARY.md          # created with schema implementation
│   └── RUNBOOK.md                  # created before pilot
├── public/
│   └── static assets
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── register-as-brahmin/page.tsx
│   │   ├── register-temple/page.tsx
│   │   ├── register-coordinator/page.tsx
│   │   ├── submission-received/page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── login/page.tsx
│   │       └── applications/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── features/
│   │   ├── applications/
│   │   ├── purohit-registration/
│   │   ├── temple-registration/
│   │   ├── coordinator-registration/
│   │   └── verification/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validation/
│   │   ├── i18n/
│   │   ├── constants/
│   │   └── telemetry/
│   ├── messages/
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── gu.json
│   │   └── kn.json
│   ├── styles/
│   └── types/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   ├── seed.sql
│   ├── functions/
│   │   ├── submit-application/
│   │   ├── create-document-upload/
│   │   └── admin-workflow/
│   └── tests/
│       ├── rls/
│       └── database/
├── tests/
│   ├── unit/
│   └── e2e/
├── AGENTS.md
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

Feature folders own form steps, Zod schemas, hooks, mappings, and tests. Shared
UI contains visual primitives only. Supabase generated database types live under
`src/types` or `src/lib/supabase` and are regenerated in CI or a documented local
command.

## 10. Implementation Checkpoints

Each checkpoint should be a small, reviewable change. The planning gate has been
approved; implementation progress is summarized at the top of this document.

### Checkpoint 0 - Plan approval

- Review V0 boundaries, form fields, workflow, database/RLS proposal, and GitHub
  Pages split
- Confirm that the form and service-area model remain geography-neutral
- Review Codex-prepared English, Hindi, Gujarati, and Kannada catalogues
- Confirm which documents are acceptable during private verification
- Confirm admin roles and who may approve/reject applications
- Approve this plan or record revisions

**Exit:** written approval to begin implementation.

### Checkpoint 1 - Static application foundation

- Scaffold strict Next.js/TypeScript/Tailwind project
- Configure static export and GitHub Pages base-path behavior
- Add formatting, lint, type check, unit test, and production build scripts
- Add accessible mobile layout, error boundary, privacy/terms placeholders
- Add CI and a non-production Pages build check

**Exit:** empty application shell builds to static files in CI.

### Checkpoint 2 - Supabase security foundation

- Create local Supabase project configuration
- Add enums/lookups, admin memberships, applications, and audit/history migrations
- Add helper functions, status-transition RPC, RLS, private Storage bucket, and
  policy tests
- Seed controlled language/service/tradition catalogues
- Document environment setup and secret ownership

**Exit:** database tests demonstrate anonymous denial and role-scoped admin access.

### Checkpoint 3 - Purohit registration, local flow

- Implement step-based React Hook Form with shared Zod schema
- Implement English, Hindi, Gujarati, and Kannada message catalogues and a
  value-preserving language switcher
- Add local draft save/clear with user notice
- Implement fields, catalogue loading/fallback, review screen, consent, accessible
  validation, and mobile QA
- Unit test transformations and conditional requirements
- Add missing-key/pseudo-localization checks and native-language review sign-off

**Exit:** representative users can complete the form locally without backend
submission.

### Checkpoint 4 - Secure Purohit submission

- Implement `submit-application` Edge Function with server validation,
  normalization, idempotency, abuse limits, transactional insert, history/audit,
  and safe errors
- Connect form and receipt page; return only application reference number
- Add duplicate suspicion flags and operational alert/logging without PII leakage
- Test retry, offline/error, malicious payload, and bypass cases

**Exit:** a submitted Purohit application appears safely in the database exactly
once and cannot be read back anonymously.

### Checkpoint 5 - Admin authentication and queue

- Configure invite-only Supabase Auth and protected client-side admin routes
- Build queue with status/type/date/search filters, pagination, assignment, and
  minimal PII columns
- Handle expired sessions and unauthorized users safely

**Exit:** authorized staff can find submissions; all other roles are denied by RLS.

### Checkpoint 6 - Verification detail and workflow

- Build private application detail view
- Add verification checklist, references, notes, contact attempts, status
  transition controls, badge award/revoke, and full history
- Enforce transition and reason requirements in the database, not only the UI
- Add role and transition integration tests

**Exit:** staff can move a test application through the full audited workflow.

### Checkpoint 7 - Private document verification

- Implement time-limited upload grants and signed upload/read functions
- Add file allow-list, size/checksum metadata, randomized paths, expiry/revocation,
  and reviewer document states
- Add retention and incident procedures to the runbook

**Exit:** documents remain private, upload capabilities expire, and access is
auditable.

### Checkpoint 8 - Temple registration

- Add temple-specific form, validation, submission mapping, admin detail sections,
  and verification checks
- Reuse the shared application workflow without forcing Purohit fields into the
  temple model

**Exit:** a temple can register and be verified end-to-end.

### Checkpoint 9 - Coordinator registration and referral operations

- Add coordinator form and verification detail
- Add referral code creation/deactivation and attribution reporting
- Keep coordinator approval separate from staff/admin access

**Exit:** coordinators can be verified and referral-code supply can be traced.

### Checkpoint 10 - Pages deployment and hardening

- Deploy static export with GitHub Actions and protected environments
- Configure production Supabase allowed origins, auth redirects, CSP/security
  headers available through Pages/custom domain, monitoring, backups, and rate
  limits
- Run accessibility, mobile-device, cross-browser, RLS, data leakage, and restore
  checks
- Create admin operating runbook and data retention/deletion process

**Exit:** production smoke test passes without exposing secrets or private records.

### Checkpoint 11 - Pilot readiness

- Seed production catalogues and invite minimum admin team
- Train staff on verification criteria and audit-note hygiene
- Run 3-5 internal/test submissions, then a small real cohort
- Measure completion, review time, reference success, approval reasons, and field
  corrections before scaling to the pilot target

**Exit:** team can onboard and verify supply consistently and manually coordinate
the first bookings.

## 11. Acceptance and Operating Metrics

### Product acceptance

- A typical applicant can complete the Purohit form on a low-width mobile screen
  with clear progress and recoverable local draft state.
- Submission retries do not create duplicate applications.
- Anonymous visitors cannot retrieve application or document data.
- Reviewers can see assigned work and the complete evidence trail.
- Invalid workflow transitions and unauthorized badge awards fail at the database
  boundary.
- Every sensitive admin action identifies actor, target, and time.
- The static production artifact deploys on GitHub Pages; runtime functions and
  data remain on Supabase.

### Pilot metrics

- Started-to-submitted form completion rate
- Median form completion time and most-corrected fields
- Submitted-to-first-contact time
- Submitted-to-approval time
- Reference contact success rate
- Approval, needs-changes, hold, and rejection rates with reason categories
- Active Purohits and temples by service area/language/service
- Referral code contribution and approval quality
- Verification checklist consistency across reviewers

Avoid vanity marketplace metrics before consumer booking exists.

## 12. Decisions Needed at Plan Review

1. Which identity documents will the verification team accept later, and should
   redacted Aadhaar be excluded entirely in favor of alternatives?
2. Which staff roles may approve, reject, suspend, award each badge, and create
   referral codes?
3. What retention period applies to rejected applications, references, and
   verification documents?
4. Will GitHub Pages use the default `brahminbooking.github.io` host or a custom
   domain at pilot launch?

These answers affect configuration and policy, but none prevents review of the
overall architecture.
