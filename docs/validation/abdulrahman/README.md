# Discovery validation — 29 October 2026

All five assigned screens were rendered in production mode at 390×1000, 768×1000 and 1440×1000. The JPEG files capture the viewport, not the complete scrollable page. `layout-checks.json` records DOM measurements: no horizontal page overflow or clipped button labels at any target width.

Representative screenshots: [Phone home](S01-390.jpg), [tablet directory](S02-768.jpg), [desktop results](S03-1440.jpg), [access recovery](S47-1440.jpg), [404 recovery](S48-1440.jpg).

Browser interactions verified: homepage search with area, directory task search, no-match reset, quick area selection with sample-profile filtering, combined search/area filters, empty result reset, result layout switching, pagination, mobile navigation, Escape closure with focus restored, and the outer search focus treatment. Body/heading fonts were checked as the locally loaded Inter/Jakarta families. Logo uses `object-fit: contain` and has no clipped-height container.

Automated validation passed: lint, typecheck, 11 Vitest tests, production build, `git diff --check`; production dependency audit reported zero vulnerabilities. The tests exercise search normalization/filtering/sorting/pagination and client interactions, including failure retry without internal error disclosure.

Reduced-motion CSS is implemented; the OS preference was not changed during review. Loading and runtime-error boundaries compile, and retry is tested in Vitest; a live backend/network failure was not forced in the browser. Real backend, authentication and other owners’ routes remain outside this PR. The public `/forbidden` route is an informational screen, not access enforcement.
