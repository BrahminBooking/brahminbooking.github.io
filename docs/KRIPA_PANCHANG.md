# KRIPA-backed Panchang

The homepage and `/panchang/` use the Go API `/v1/panchang/today`; GitHub Pages
still exports static files. Only `NEXT_PUBLIC_API_BASE_URL` is needed in the
browser. The private KRIPA URL/token never enters the frontend build.

The user explicitly selects one of five known city-coordinate/timezone pairs.
There is no silent default location, inferred geocoding, or GPS permission.
This does not change the existing searchable booking/registration place fields.
More Panchang locations can be added only with correct coordinates/timezones.

Fresh snapshots are cached in memory only. Refresh occurs at the earliest
current limb transition, sunrise or midnight, and when the page becomes active.
Failure clears expired data; retry and guest booking remain available. The
source, location, civil and Panchang dates, freshness, profile and preview
status are visible. Before sunrise the Panchang day is yesterday; event dates
are displayed to avoid calling yesterday's sunrise today's sunrise.

The astronomical-preview caution has checked-in copy in all 22 supported
catalogues. Proper Panchang names currently retain KRIPA's canonical Sanskrit
transliteration; UI labels and dates use the selected locale. Independent
native-speaker review remains recommended, particularly low-resource scripts.
No runtime translation service or religious fixture is used.

Deploy the Go backend first, verify its real KRIPA response, then deploy Pages.
Review status remains preview: neither full Drik parity nor festival/vrat/lunar
month correctness has been established. Unsupported values are omitted.
