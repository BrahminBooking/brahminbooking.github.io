# BrahminBooking Consumer MVP Audit

Audit date: **31 August 2026**
Scope: repository implementation, production static export, automated journeys,
public Supabase function availability, and alignment with the approved Consumer
V0 and supply-registration foundations.

## Executive finding

The repository already contains a coherent Consumer V0 and should be improved
incrementally, not rebuilt. The static experience, editorial routes, guest form,
provider form, localization shell, SEO, and database security model are all
substantial and test cleanly. The largest production blocker is operational:
the two public-write Edge Function URLs currently return `404 NOT_FOUND`, so the
live forms cannot persist submissions. Accurate Panchang data also remains an
external launch dependency and the production UI correctly refuses to present
development fixtures as religious guidance.

## Implementation inventory

| Area | Status | Existing implementation retained | Gap or evidence | Important files |
| --- | --- | --- | --- | --- |
| Framework and routing | Complete | Next.js 16 App Router, strict TypeScript, React 19, static export with trailing slashes | No server-only Next.js features detected; build emits all 21 static pages | `package.json`, `next.config.ts`, `src/app/**` |
| Deployment and CI | Complete in code / backend functions missing externally | GitHub Actions validates lint, types, unit tests, build, static audit, E2E, then deploys Pages | The operator reports that migrations are applied; Supabase functions are deployed separately from Pages and both live function checks still returned 404 on this audit date | `.github/workflows/*`, `supabase/config.toml` |
| Homepage | Partially complete | Premium, mobile-first Panchang-led hierarchy, clear primary request CTA, trust and process sections | The "Today" utility can only show an honest unavailable state until a reviewed live Panchang provider exists | `src/app/page.tsx`, `src/features/home/*` |
| Panchang | Partially complete / production data missing | Typed provider contract, date/timezone primitives, provenance/freshness model, honest no-data UI, noindex | Production does not call a live provider; location/date controls and result states are currently dormant; provider conventions need expert acceptance | `src/features/panchang/PanchangExperience.tsx`, `src/lib/panchang/*`, `src/lib/location/*` |
| Location | Partially complete | Searchable free-form booking and registration fields; reusable city/district/state catalogue; Panchang location primitives | Panchang location selection is not exposed while live data is unavailable; catalogue is intentionally suggestive, not exhaustive | `src/components/PlaceSearchInput.tsx`, `src/data/indian-places.ts`, `src/lib/location/locations.ts` |
| Puja discovery | Complete for initial seed / limited breadth | Four approved static guides with provenance, review metadata, localized body content, detail CTAs | Taxonomy and catalogue breadth are intentionally small for V0 | `src/content/pujas.ts`, `src/app/pujas/**` |
| Festival discovery | Complete for initial seed / limited breadth | Three approved static guides, regional caveats, provenance, static SEO routes | No live local festival-date binding until Panchang provider is approved | `src/content/festivals.ts`, `src/app/festivals/**` |
| Guest booking UI | Partially complete | Guest-first request, Zod validation, idempotency, honest terminology, loading/error states, searchable place, summary | Existing four sections are all displayed at once and no consumer draft is saved; production submission is blocked by missing Edge Function | `src/features/booking/BookingForm.tsx`, `schema.ts`, `submit.ts` |
| Guest booking backend | Complete in code / broken externally | Private tables, status history, audit event, rate-limit attempts, service-role RPC, default-deny RLS | `submit-booking-request` returned 404 in production; migration application could not be verified from this workspace | `202608240002_consumer_booking_requests.sql`, `supabase/functions/submit-booking-request/` |
| Booking confirmation | Partially complete | Private reference, service/place/date summary, manual next steps, explicit "not confirmed" wording, missing-receipt empty state | Optional account copy exists but no end-to-end claim challenge issuance/consumption journey is wired; time window is not preserved in the receipt summary | `BookingRequested.tsx`, `src/app/booking/requested/` |
| Optional auth | Partially complete | Supabase email OTP UI; auth is never required before booking | No tracking dashboard and no complete secure request-claim handoff; do not promise tracking yet | `src/features/auth/AuthExperience.tsx`, consumer migration claim RPC |
| Purohit registration UI | Complete in code / broken externally | Six-step accessible form, device-local draft, 22 UI locales, optional Aadhaar last four only, consent, searchable place | Live `submit-application` returned 404 | `src/features/purohit-registration/**`, `supabase/functions/submit-application/` |
| Registration database locale handling | Broken | Edge validation and frontend support all 22 enabled locales | Existing SQL constraints and `create_purohit_application` accept only `en`, `hi`, `gu`, `kn`; the other 18 locales fail at the database boundary | `202608240001_supply_registration.sql` |
| Provider verification model | Complete foundation / admin UI missing | Workflow states, status history, audit events, badges/product rules, private source records | Internal verification dashboard and controlled transition functions remain future supply work | supply migration, `docs/PRODUCT_PLAN.md` |
| Localization | Complete catalogue coverage / quality debt | `next-intl`, 22 checked-in locale catalogues, RTL handling, catalogue parity tests, no runtime machine translation | Native-speaker review remains recommended; some generated catalogues need linguistic QA before scale | `src/i18n/**`, `src/messages/**`, `docs/LOCALIZATION.md` |
| Analytics | Complete privacy-safe abstraction / no sink | Allowlisted coarse events, PII property removal, CustomEvent boundary | No consented analytics destination is connected; several desired funnel stages are operational rather than browser events | `src/lib/analytics.ts`, `AnalyticsObserver.tsx` |
| Error, empty, loading states | Partially complete | Booking errors, registration errors, Panchang unavailable, receipt empty state, 404 and route error pages | System-page explanatory copy is English-only; error summary/focus behavior can be stronger in guest booking | `src/app/error.tsx`, `not-found.tsx`, feature forms |
| SEO | Complete for approved public content | Metadata, canonicals, OG image, robots, sitemap, JSON-LD, approved-content static routes | Panchang remains noindex until data is authoritative; no thin location pages are generated | `src/app/layout.tsx`, `robots.ts`, `sitemap.ts`, `JsonLd.tsx` |
| Privacy notice | Complete for V0 | Localized supply-data notice plus localized guest-request privacy, coordination, consent, and non-confirmation disclosures | Retention periods and a dedicated privacy contact should be finalized before scaling beyond the manual pilot | `src/app/privacy/page.tsx`, `src/features/privacy/PrivacyExperience.tsx` |
| Accessibility and responsive behavior | Complete baseline / manual QA pending | Semantic forms, labels, focus indicators, reduced motion, mobile menu, no-overflow checks at 360-1440 px | Connected perceptual review, iOS/Safari, Android device and screen-reader checks remain launch gates | `globals.css`, `e2e/consumer.spec.ts`, `docs/VISUAL_QA.md` |
| Performance | Complete baseline / measurement pending | Static HTML, limited images, no runtime image optimizer dependency, client boundaries kept feature-local | No field Core Web Vitals or formal bundle budget is recorded | `next.config.ts`, static export |

## Priority

### P0 — functional production MVP

1. Apply the checked-in Supabase migrations and deploy both public Edge
   Functions with production origins and rate-limit secrets. Re-test preflight,
   invalid input, idempotent retry, and a controlled real submission.
2. Expand database registration-locale validation to the same 22 locale codes
   accepted by the frontend and Edge Function, with a forward migration and SQL
   regression test.
3. Select and integrate a Panchang provider only after API terms, calculation
   conventions, timezone/location behavior, and expert acceptance are complete.
   Until then, retain the honest unavailable state.

### P1 — strongly improves the MVP

1. Make the existing booking sections progressive, persist only non-sensitive
   planning fields locally, and focus each step accessibly.
2. Complete a secure post-booking account-claim handshake before displaying the
   existing "track your booking" promise.
3. Add production monitoring for Edge Function failure/rate-limit rates without
   logging PII.
4. Complete connected-browser, real-device, keyboard and screen-reader review.
5. Perform native-language review of the 22 production catalogues.

### P2 — follow-up product

- Customer tracking/history, family profiles, My Purohit, reminders, advanced
  matching, real-time availability, payments, reviews, and transactional temple
  services.

## Verification performed before changes

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — 13 files and 145 tests passed.
- `npm run build` — passed; 21 static pages emitted.
- `npm run audit:static` — passed.
- `npm run test:e2e` — all 21 Chromium journeys passed, including guest request,
  localization, reduced motion, 404, navigation, place search, and mobile
  overflow checks.
- Production `OPTIONS` and invalid `POST` checks to `submit-application` and
  `submit-booking-request` — both returned Supabase `404 NOT_FOUND`.

The SQL pgTAP tests were inspected but not executed because a linked/local
Supabase database is not available in this workspace. Their execution remains
part of migration deployment verification.

## Implementation checkpoint completed from this audit

- Added `202608310001_expand_submission_locales.sql` so application and consent
  provenance, plus the secure creation RPC, accept the same 22 reviewed locales
  as the frontend and Edge Function.
- Expanded the registration RPC test to exercise all 22 locales through one
  idempotent application.
- Converted guest booking into four validated steps with an accessible progress
  indicator, keyboard focus transfer, Back/Continue controls, and analytics at
  actual step completion.
- Added a versioned device-local guest draft containing ceremony-planning
  preferences only. Contact details, notes, consent, and anti-bot fields are
  excluded and the draft is removed after a successful submission.
- Corrected the mobile header wordmark wrapping found during screenshot review.
- Expanded the privacy notice to explicitly cover guest booking requests in all
  22 supported languages using the reviewed, repository-owned booking catalogue.
