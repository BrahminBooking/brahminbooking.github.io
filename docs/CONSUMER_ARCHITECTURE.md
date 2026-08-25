# Consumer Experience V0 Architecture

## Delivery boundary

The Next.js application is statically exported to GitHub Pages. Read-only
editorial content ships with the export. Runtime location choice is held in the
browser. Booking writes go to a rate-limited Supabase Edge Function; browser
clients never receive a service-role key and cannot insert directly into the
private booking table.

The export uses one persistent client-side locale preference and checked-in
`next-intl` catalogues for English and all 22 Scheduled Indian languages. Stable
language-neutral URLs are retained for V0. Reviewed puja and festival
translations are versioned beside their canonical English records; there is no
runtime machine-translation dependency. See `docs/LOCALIZATION.md`.

## Panchang provider decision

Consumer V0 defines a provider-neutral `PanchangProvider` contract and ships an
obviously labelled development fixture for UI and automated tests. No live
religious result is enabled without credentials and domain review.

Candidates reviewed on 24 August 2026:

| Option | Strength | Risk / decision |
| --- | --- | --- |
| Prokerala Astrology API | Documented Daily Panchang and calendar APIs; commercial app use described in terms; OAuth client credentials | Leading hosted candidate. Confirm plan, attribution, rate limit, regional conventions, ayanamsa, and expert sample comparison before selection. Secrets require an Edge Function proxy. |
| VedicAstroAPI | Panchang/festival endpoints, Indian-language support, location API, inexpensive trial/plans | Pricing and feature coverage are visible, but commercial licensing and calculation methodology are less explicit. Obtain written terms and expert validation first. |
| Swiss Ephemeris | High-quality astronomical primitives and full implementation control | Dual AGPL/professional licensing and substantial Panchang/festival rule engineering. Not suitable as a shortcut. |

The contract accepts local date, IANA timezone, latitude/longitude, locale, and
tradition preference, and returns typed values plus source, calculated-at,
expires-at, conventions, and confidence metadata. The UI supports `loading`,
`ready`, `stale`, `unavailable`, and `fixture` states. A cached value may be
shown only with an explicit stale timestamp; failure must never silently fall
back to a fabricated current result.

## Location model

The default is Bengaluru only as a clearly changeable display fallback, not as
a pilot-operations commitment. Users can choose a curated place manually or
grant browser location permission. Browser coordinates are kept locally and
sent only to the selected Panchang service when a result is requested. Denied
or unavailable geolocation always returns to manual selection.

## Booking request and later claim

Guest contact information and request details are private. Anonymous users call
`submit-booking-request`; the Edge Function validates a shared Zod-compatible
schema, normalizes the contact, applies abuse controls and idempotency, then
uses the service role to insert. RLS grants anonymous users no table access.

The returned public reference is random and non-enumerable but grants no read
access. Later claiming requires a signed-in user who verifies the same phone or
email through Supabase Auth. A privileged function atomically compares the
verified normalized contact, consumes a short-lived one-time claim challenge,
links `customer_user_id`, and appends an audit event. Knowing a reference number
alone is insufficient. Support overrides require an admin reason and audit row.

## Analytics privacy

Analytics events use an allowlist of route, action, content slug, coarse device
class, and coarse location choice (`manual`, `browser`, `fallback`). Names,
phones, emails, addresses, notes, search text, coordinates, and form payloads
are prohibited from event properties and application logs.

## Third-party software and sources

- Motion is MIT licensed and may be used for progressive-enhancement animation.
- Interface components, sacred motifs, and layouts are original repository code;
  no ReactBits, Magic UI, Aceternity, or shadcn component source is copied.
- Prokerala documentation/terms, VedicAstroAPI documentation/pricing, and Swiss
  Ephemeris licensing were used only to evaluate providers. Their content and
  data are not redistributed in fixtures.
