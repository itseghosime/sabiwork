# Abdulrahman’s five screens

| Screen | Route               | Implemented behaviour                                                                                                         |
| ------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| S01    | `/`                 | Responsive public navigation, service/area search, approved five-card fan, categories, four-step explanation, signup links    |
| S02    | `/categories`       | Search service names/tasks, area filter and shortcuts, sample estimate cards, reset and empty state                           |
| S03    | `/artisans`         | Combined search/trade/area/rating filters, sort, active-filter removal, list/grid views, pagination, loading/retry boundaries |
| S47    | `/forbidden`        | Generic access explanation, privacy guidance and safe recovery links                                                          |
| S48    | `app/not-found.tsx` | Framework not-found UI with safe search, home and category recovery                                                           |

## Run it

Use Node 22 LTS and npm: `npm ci`, then `npm run dev`. Public demo pages require no environment variables. `npm run build` then `npm start` serves production mode. The Webpack scripts avoid native filesystem-watcher failures in restricted desktop environments; if necessary use `WATCHPACK_POLLING=true npm run dev`.

## How the implementation works

- `src/app/layout.tsx` loads locally bundled Inter and Plus Jakarta Sans using `next/font/local`, metadata and shared CSS tokens. `(public)/layout.tsx` applies the public shell only to public routes, leaving room for the other owners’ protected route groups.
- `src/components/public-shell.tsx` contains the shared logo, navigation and footer. The original icon is fully visible without clipping, with editable text beside it. Mobile navigation announces expanded state, closes on selection/Escape and restores focus on Escape.
- `src/components/discovery.tsx` provides reusable category cards, portrait fallbacks, search form and artisan cards. Home-specific presentation is preserved as approved by the leader; directory-only enhancements are scoped away from it.
- `src/features/search/data.ts` holds typed fictional records, UUIDs, category IDs and prices in integer kobo. Coordinate ID changes with Emmanuel’s profile routes. Portraits illustrate fictional people; see `public/images/ASSETS.md`.
- `src/features/search/service.ts` validates URL parameters, combines filters and sorts/paginates. Replace `listArtisans()` with database access on Saturday while retaining this interface. Failures propagate to the route error boundary, rather than appearing as empty results.
- S03 is a Server Component and uses `next/form` GET navigation. Filters survive refresh and can be bookmarked. A keyed outer section refreshes uncontrolled form values when URL filters change; the Form component itself is not keyed. Small Client Components handle directory filtering, navigation and list/grid switching.
- `loading.tsx`, client `error.tsx` with Next’s `retry()` API, and framework `not-found.tsx` provide route recovery. Errors do not expose internal exception messages. `/forbidden` is informational UI, not server authorization or an assertion that its public route returns HTTP 403.

## Design and interaction

Root DESIGN.md remains unchanged. The final Stitch references guide the utility screens; the leader specifically approved keeping the implemented homepage. Copy omits unsupported inspection, escrow, accreditation, dispatch and support-office claims. Sample prices and review badges are labelled as fictional.

Short staggered entrance animations and restrained card/button hover feedback are disabled for reduced-motion preferences. Compound search fields use a subtle outer focus border/ring instead of a misplaced inset rectangle. Keyboard focus remains visible. Buttons have fixed minimum touch targets, do not shrink and do not split labels.

Official Next.js references consulted: [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Form](https://nextjs.org/docs/app/api-reference/components/form), [Fonts](https://nextjs.org/docs/app/api-reference/components/font), [Error handling](https://nextjs.org/docs/app/api-reference/file-conventions/error), [Not found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found). The installed Next 16.4.3 docs under `node_modules/next/dist/docs` were also read for version-specific APIs.

## What remains for integration

No authentication, server authorization, database search, live availability, persistence or payments are implemented. Natalie retains accounts/authentication ownership and protected shells. The minimal shared app foundation is included because none existed; everyone should build in this app after merge.

Profile/login/signup links use agreed routes and will reach the recovery page until their owners’ work merges. The mock adapter is an explicitly temporary Friday deliverable, not completed backend integration. `/forbidden` never reveals private record existence.

## Explain it to the tutor

Demonstrate homepage search, category search and area selection, combined result filters, an empty result and reset, sorting and page two, layout switching, mobile navigation, `/forbidden` and an unknown route. Explain the adapter that Saturday’s database integration will replace. AI assisted this implementation; read and demonstrate the code before submission.

Rendered evidence is in [the validation folder](validation/abdulrahman/README.md).

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Automated tests cover combined filters, query validation, sorting, pagination, currency, directory interactions, navigation and retry. Rendered viewport evidence is supplied with the PR.

Retain student feature branches after merge for tutor inspection. Automatic branch deletion is disabled; meaningful commits and PR discussions remain available. Only Abdulrahman merges.
