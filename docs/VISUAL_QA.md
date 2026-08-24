# Consumer V0 Visual QA

Date: 24 August 2026

## Automated browser checks

Chromium executed the static production export at 360, 390, 768, 1024 and
1440px. At each width the homepage had no horizontal overflow and the primary
booking action remained visible. The suite also traversed every required route,
completed a guest request, verified the confirmation/account CTA and confirmed
that Panchang fixture disclosure and `noindex` metadata are present.

Routes exercised: `/`, `/panchang/`, `/pujas/`, `/pujas/griha-pravesh/`,
`/festivals/`, `/festivals/diwali/`, `/book/`, `/booking/requested/`, `/auth/`,
and `/register-as-brahmin/`.

## Visual states covered by implementation

- Responsive desktop/mobile header and direct mobile Today/Book/Pujas/Account access
- Homepage hero, Today card, discovery cards, finder, ritual rows, trust and process
- Panchang loading, unavailable/retry and explicit fixture result states
- Puja/festival catalogues and detail editorial layouts
- Booking fields, validation, review, submitting/error and confirmation states
- Optional account unavailable/sent states
- Reduced-motion path through Motion and CSS

## Limitation and manual launch gate

The in-app visual browser was not connected in this workspace session, so a
human visual inspection and screenshot capture could not be truthfully completed
through that surface. Automated Chromium layout/flow checks passed, but this is
not a substitute for perceptual review. Before production activation, connect
the browser and inspect each state above on at least one ordinary Android device,
Safari/iOS, Chromium desktop and keyboard-only navigation. Record screenshots
and correct any typography, wrapping, focus or contrast defects discovered.
