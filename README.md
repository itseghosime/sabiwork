# SabiWork

**Skilled hands. Trusted work.** Group Four's artisan marketplace for Nigeria.

Customers discover listed artisan work profiles, request work, compare quotes, and track progress. Artisan search reads listed profiles and persisted review summaries from Neon; profiles without uploaded portraits show initials. Payment screens remain Paystack **test mode** previews and do not confirm or hold real funds.

## Team: start your assigned pages

**Frontend deadline: Friday, 30 October 2026, 2 p.m. WAT. Backend integration: Saturday, 31 October.**

1. Send Abdulrahman your GitHub username and accept the repository invitation.
2. Find your name and screen IDs in [the team allocation](docs/TEAM.md) and [your task issue](https://github.com/itseghosime/sabiwork/issues).
3. Open the [finished design reference in Stitch](https://stitch.withgoogle.com/projects/6038732663245800013) and find those same screen IDs.
4. Follow [START-HERE.md](START-HERE.md) to clone the repo, create a branch and check the shared app foundation.
5. Open the repo in OpenCode. Read [AGENTS.md](AGENTS.md), [DESIGN.md](DESIGN.md), [the beginner guide](docs/BEGINNER-GUIDE.md) and [your route ownership](docs/SCREEN-OWNERSHIP.md).
6. Paste [the OpenCode implementation prompt](docs/OPENCODE-PROMPT.md), your assigned Stitch code and screenshots. Build inside the shared app; do not create a separate project.
7. Check phone/tablet/desktop and submit a pull request with a short explanation of your code. AI may help draft it, but you must understand and explain it yourself. Follow [the complete submission checklist](docs/TEAM.md#friday-acceptance). Only Abdulrahman reviews for acceptance and merges main.

**Foundation status:** this shared Next.js app now includes Neon-backed account, work-profile, artisan discovery, request, quote, job, progress, review, and admin workflows. Payment flows use Paystack test mode only; training progress and dispute handling remain limited.

## Start here

- [Team assignments and Friday acceptance criteria](docs/TEAM.md)
- [Screen routes and owners](docs/SCREEN-OWNERSHIP.md)
- [Canonical Clear Trade Modern design](DESIGN.md)
- [Contribution and merge rules](CONTRIBUTING.md)
- [Shared implementation contract](docs/IMPLEMENTATION.md)
- [Screen inventory and design handoff](docs/DESIGN.md)
- [Delivery schedule](docs/DELIVERY.md)
- [Leader's ready-to-share team message](docs/TEAM-MESSAGE.md)
- [Repository controls](docs/GOVERNANCE.md)

## Delivery

Working responsive frontend code (with disclosed typed mock data) is due to Abdulrahman **Friday, 30 October 2026 at 2:00 p.m. WAT (UTC+1)**. Final submission: **Monday, 2 November 2026**; instructor's submission time is to be confirmed.

Backend foundations start early; whole-team backend integration is Saturday, 31 October. Read [the beginner guide](docs/BEGINNER-GUIDE.md) and [OpenCode prompt](docs/OPENCODE-PROMPT.md).

## Stack and current status

The planned stack follows the guide: Next.js App Router + TypeScript, Neon Postgres and Managed Auth, Resend, Paystack test mode, and Vercel. Use npm with one committed package-lock.json.

Neon Postgres, Managed Auth, and Realtime are provisioned, and migrations `0001`–`0007` are applied to the production database. Signed-in non-admin accounts can hire; any such account can create an optional work profile to be hired. Listed, account-created profiles and saved reviews power production artisan search. Local development may show the explicitly disclosed fictional seed profiles for presentations; production listings exclude them. Paystack is test-mode only, training progress is session-only, and formal dispute handling is unavailable. See [the implementation status](docs/IMPLEMENTATION.md#current-neon-backend-status) for exact boundaries.

## Run the shared app

Use Node **22 LTS** (`nvm use`) and npm. Configure the local variables from `.env.example` in an ignored `.env.local`; never use live payment keys for this prototype.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The home and category pages can render without a database connection; `/explore`, `/artisans`, account, and workspace routes require the Neon environment variables. Presentation seed profiles appear only in local development and are labeled as fictional. Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` before submitting. `npm start` serves a production build.

For the isolated validation branch only, apply the initial migration and verify Postgres plus Realtime with:

```sh
node --env-file=.env.backend-test.local scripts/migrate.mjs
node --env-file=.env.backend-test.local scripts/backend-smoke.mjs
```

Verify `NEON_BRANCH` before running either command. Do not point the smoke test at production.

The app uses Webpack to avoid native filesystem watcher failures in restricted desktop environments. On such machines use `WATCHPACK_POLLING=true npm run dev`. Versions are pinned in the npm lockfile.

See [the discovery implementation walkthrough](docs/DISCOVERY-HANDOFF.md) for routes, shared components, animations and backend replacement points.

The guide's page heading says Group 7 / ArtisanPro; the group leader confirmed that this team's identity is **Group Four / SabiWork**. The ten feature/non-code-role pairs are retained; names have been allocated as an initial plan.

Do not commit credentials, real identity documents or real customer data. Use fictional demonstration records and test payments only.
