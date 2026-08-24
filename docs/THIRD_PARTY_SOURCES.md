# Third-party Sources and Licenses

Reviewed 24 August 2026.

## Runtime software

- [Motion for React](https://motion.dev/) — MIT licensed; package `motion`
  12.43.0. Used only for progressive reveal motion. Reduced-motion preferences
  disable initial transforms. License source: [Motion repository](https://github.com/motiondivision/motion/blob/main/packages/motion/LICENSE.md).
- Next.js, React, React Hook Form, Zod, Tailwind CSS, next-intl and Supabase retain
  their package licenses as recorded in the lockfile. No proprietary component
  kits were added.
- [next-intl](https://github.com/amannn/next-intl) is MIT licensed and is the
  production localization layer. Tolgee, Weblate, and LibreTranslate were
  evaluated as optional free review/drafting tools but are not runtime
  dependencies. See `docs/LOCALIZATION.md`.

No source was copied or adapted from ReactBits, Magic UI, Aceternity UI, shadcn,
Hermès, Rolex, Ferrari/F1, Apple, Tesla, Nike or Prada. Their names informed only
high-level design qualities in the supplied brief. All interface components,
motifs and CSS in this branch are original repository code.

## Panchang provider research

- [Prokerala Astrology API documentation](https://api.prokerala.com/docs),
  [getting started](https://api.prokerala.com/getting-started),
  [credit model](https://api.prokerala.com/api-credits), and
  [terms](https://client-api.prokerala.com/tos). Strongest current hosted
  candidate, but not integrated or redistributed.
- [VedicAstroAPI pricing and feature catalogue](https://vedicastroapi.com/pricing/).
  Not integrated; written commercial terms and calculation-method details are
  required before selection.
- [Swiss Ephemeris licensing/readme](https://github.com/aloistr/swisseph/blob/master/readme.md).
  Not integrated; dual AGPL/professional licensing and the need to implement
  Panchang conventions make it unsuitable for this checkpoint.

Fixtures contain repository-authored illustrative strings and no copied
provider data.

## Generated social asset

`public/og-brahminbooking.png` was generated once with OpenAI image generation
for this project. It contains no text, logo, deity, person, Om symbol or copied
brand asset. Prompt summary: an original warm-ivory manuscript texture with a
maroon architectural threshold, restrained saffron/gold radial geometry and
left-side negative space. The asset is used only for social-sharing metadata.
