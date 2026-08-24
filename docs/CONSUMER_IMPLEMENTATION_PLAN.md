# Consumer Experience V0 Implementation Plan

Status: implemented on `feat/consumer-experience-v0`; production backend and
live Panchang provider still require external configuration and approval.

## Checkpoints

1. **Scope and architecture — complete.** Preserve supply onboarding; record
   consumer boundaries, provider abstraction, content review gates, guest claim
   model, analytics privacy, and static-export constraints.
2. **Premium shell and homepage — complete.** Responsive editorial shell,
   navigation, Today fixture, reviewed discovery content, finder, ceremonies,
   trust, human booking process and provider invitation.
3. **Panchang foundation — complete with fixtures.** Location persistence,
   permission-based browser coordinates, manual fallback, date navigation,
   typed provider contract, full field layout, provenance, freshness/error
   states and fixture noindex controls.
4. **Editorial catalogues — complete for initial seed.** Approved puja and
   festival collections, generated static detail routes, review/source metadata,
   and indexing restricted to approved content.
5. **Guest booking request — complete in code.** Four-part form, Zod validation,
   review step, optional post-submit sign-in, private request receipt and demo
   adapter used only by automated tests.
6. **Supabase security — complete in migration/function code.** Private request,
   history, rate-limit and one-time claim tables; default-deny RLS; service-role
   write RPC; verified-contact claim RPC; Edge validation and abuse limits.
7. **SEO, analytics and motion — complete.** Canonicals, Open Graph image,
   sitemap/robots architecture, Website JSON-LD, Motion reveal with reduced
   motion and sanitized analytics allowlist.
8. **Automated verification — complete.** Unit, validation, content-state,
   provider, timezone/freshness, analytics and Chromium E2E coverage at the five
   required widths.
9. **Production activation — pending external setup.** Apply Supabase migration,
   deploy Edge Function, configure keys/origins/auth redirect, replace fixtures
   only after Panchang expert acceptance, run connected-browser/manual-device
   visual and accessibility review, then deploy the branch.
