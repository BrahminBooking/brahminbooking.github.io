# BrahminBooking Project Rules

These rules apply to the entire repository. More specific `AGENTS.md` files may
add local rules but must not weaken the product, privacy, or security constraints
below.

## Product Direction

- BrahminBooking is a trust-first marketplace for verified Purohits/Brahmins,
  temples, and Hindu religious services.
- Preserve the supply acquisition and verification foundation while developing
  the approved consumer discovery and guest booking-request experience.
- Current priority is: keep Purohit registration operational, ship trustworthy
  Panchang/festival/puja discovery, add guest booking requests, then continue
  temple/coordinator registration and the internal verification dashboard.
- Optimize the pilot for 25-50 verified Purohits, 5 temples, one concentrated
  geography, and 5-10 manually coordinated bookings.
- Treat the Peethadheesh, chela, Purohit, temple, and coordinator network as a
  core source of referrals and verification, while still recording evidence and
  review decisions consistently.

## V0 Scope Guardrails

- Consumer discovery and a manually coordinated guest booking-request flow are
  explicitly approved for Consumer V0. A booking request is not a confirmed
  booking and must never be represented as one.
- Do not add mandatory customer accounts, payments, chat, reviews, automated
  matching, real-time provider availability, complex calendars, or native
  mobile apps.
- Do not collect bank details or full Aadhaar numbers during initial
  registration.
- Collect only data required for onboarding, verification, pilot operations,
  and later public-profile setup.
- Prefer a small, operable workflow over speculative abstractions.

## Required Workflow

The main application workflow is:

`Draft -> Submitted -> Initial Review -> Contacted -> Reference Verification -> Document Verification -> Approved -> Profile Setup -> Active`

Alternative states are:

`Needs Changes`, `On Hold`, `Rejected`, `Suspended`, and `Archived`.

- Never change an application status without appending status history and an
  audit event.
- Require a reason for exceptional transitions, rejection, suspension, and
  archival.
- Badge awards must be explicit and auditable. Supported badges are Identity
  Verified, Reference Verified, Temple Affiliated, Institution Verified,
  Platform Trained, and Bookings Completed.
- A badge is not a substitute for workflow state, and workflow state is not a
  substitute for a badge.

## Architecture and Deployment

- The planned stack is Next.js, TypeScript, Tailwind CSS, React Hook Form, Zod,
  Supabase PostgreSQL/Auth/private Storage, Row-Level Security, and GitHub
  Actions.
- The canonical public Purohit registration URL is `/register-as-brahmin/`. It
  must remain accessible without authentication. Do not place public form routes
  behind an auth gate.
- Keep every public journey available in English and all 22 Scheduled Indian languages,
  including discovery, reviewed guide copy, guest booking, registration,
  privacy, and optional sign-in. Use versioned, repository-owned translation
  messages and stable language-neutral values in the database.
- Keep registration geography-neutral until a pilot geography is deliberately
  selected; do not hard-code one city, district, or state.
- GitHub Pages is a hard V0 hosting constraint. The Next.js application must be
  compatible with static export; do not depend on Next.js server actions,
  middleware, route handlers, runtime image optimization, or SSR.
- Browser code may use only public configuration such as the Supabase URL and
  anon key. Never expose a Supabase service-role key or another secret in the
  frontend or GitHub Pages build.
- Put privileged backend behavior and abuse-controlled anonymous writes in
  Supabase Edge Functions or narrowly scoped database functions. Keep the
  database protected even if a caller bypasses the UI.
- Keep uploaded verification documents in private Supabase Storage. Use
  short-lived signed URLs; never publish document object paths as public URLs.
- Admin authentication uses Supabase Auth. Applicant accounts remain out of
  scope. Consumer V0 is guest-first; optional account creation/claiming may be
  shown only after request submission and must not block the request.
- Religious calendar data must pass through a provider interface. Never present
  fixture, stale, inferred, or unreviewed data as authoritative. Show its source,
  location, date/timezone, freshness, and review status near the result.
- Festival and puja editorial content must carry source/provenance and review
  state. Only approved entries may be indexed or presented as reviewed guidance.

## Data and Security

- Enable RLS on every table exposed through Supabase. A new table is incomplete
  until its policies and policy tests exist.
- Deny anonymous reads of applications, contact details, references,
  verification notes, documents, and audit records.
- Public registration should be validated server-side and rate-limited; do not
  grant broad anonymous `insert` access merely for convenience.
- Admin authorization comes from an application-controlled admin membership
  table, not user-editable JWT metadata.
- Separate private application data from any later public-profile projection.
  Public-profile consent never makes private source records public.
- Use UUID primary keys, UTC `timestamptz` audit fields, and append-only history
  for workflow and security-sensitive events.
- Avoid logging PII, document contents, access tokens, or signed URLs.
- Do not collect or store a full Aadhaar number in the initial registration
  database. If product approval requires an Aadhaar-related field, limit it to an
  optional availability declaration or last four digits until a dedicated legal
  and Aadhaar Data Vault review approves anything stronger.
- Normalize phone numbers for operational use while preserving a user-entered
  display value only when necessary.
- Schema changes are forward-only SQL migrations under `supabase/migrations`.
  Never edit production data manually when a reviewed migration or auditable
  admin action can do the job.

## Engineering Practices

- Keep TypeScript strict and avoid `any` unless the reason is documented next to
  the use.
- Share Zod schemas between form validation and backend validation where the
  runtime permits it, but always validate again at the trust boundary.
- Organize code by product feature; keep reusable primitives small and avoid a
  premature generic framework.
- Build accessible, mobile-first forms with saved local progress, clear error
  summaries, resilient submission states, and keyboard support.
- Internationalization uses free/open-source application tooling and checked-in
  message files. Codex reviews every supported catalogue, including consent,
  privacy, identity, and submission copy. Independent native-speaker review is
  recommended before scaling but is not a V0 launch blocker.
- Never use unreviewed runtime machine translation for religious, consent,
  privacy, identity, or transactional copy. Automated translation may create a
  draft only; the reviewed repository catalogue is the production source.
- Use controlled vocabularies for services, languages, traditions, workflow
  states, and badges, with an `Other` path where field reality requires it.
- Store canonical values in English identifiers; presentation labels may be
  localized later.
- Add tests in proportion to risk. At minimum cover validation, RLS policies,
  allowed/forbidden workflow transitions, and the static production build.
- Run formatting, linting, type checking, tests, and `next build` before merging.
- Keep CI and deployment reproducible through GitHub Actions.

## Change Discipline

- `docs/PRODUCT_PLAN.md` is the V0 scope and architecture source of truth until
  implementation begins. Record approved scope or architecture changes there.
- Do not implement application code until the initial product plan and
  architecture have been reviewed and approved.
- Preserve unrelated user changes in a dirty worktree.
- Document assumptions and significant security tradeoffs in the relevant pull
  request or architecture note.
- Favor small checkpoints that leave the repository buildable and reviewable.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
