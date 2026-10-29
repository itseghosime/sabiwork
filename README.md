# SabiWork

**Skilled hands. Trusted work.** Group Four's artisan marketplace for Nigeria.

Customers discover verified artisans, request work, compare quotes, pay in milestones using Paystack **test mode**, track progress and leave reviews. Artisans manage work, availability and training; admins manage verification and disputes.

## Team: start your assigned pages

**Frontend deadline: Friday, 30 October 2026, 2 p.m. WAT. Backend integration: Saturday, 31 October.**

1. Send Abdulrahman your GitHub username and accept the repository invitation.
2. Find your name and screen IDs in [the team allocation](docs/TEAM.md) and [your task issue](https://github.com/itseghosime/sabiwork/issues).
3. Open the [finished design reference in Stitch](https://stitch.withgoogle.com/projects/6038732663245800013) and find those same screen IDs.
4. Follow [START-HERE.md](START-HERE.md) to clone the repo, create a branch and check the shared app foundation.
5. Open the repo in OpenCode. Read [AGENTS.md](AGENTS.md), [DESIGN.md](DESIGN.md), [the beginner guide](docs/BEGINNER-GUIDE.md) and [your route ownership](docs/SCREEN-OWNERSHIP.md).
6. Paste [the OpenCode implementation prompt](docs/OPENCODE-PROMPT.md), your assigned Stitch code and screenshots. Build inside the shared app; do not create a separate project.
7. Check phone/tablet/desktop and submit a pull request with a short explanation of your code. AI may help draft it, but you must understand and explain it yourself. Follow [the complete submission checklist](docs/TEAM.md#friday-acceptance). Only Abdulrahman reviews for acceptance and merges main.

**Foundation status:** this branch adds the shared app and Abdulrahman’s S01/S02/S03/S47/S48. After the PR is merged, everyone builds in this same app. Accounts, profiles, jobs and payments still belong to their assigned owners.

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

Planned stack follows the guide: Next.js App Router + TypeScript, Neon Postgres, Better Auth, Resend, Paystack test mode and Vercel. Use npm with one committed package-lock.json.

The public discovery frontend is implemented using fictional typed fixtures. Authentication, profile detail, job/payment flows and database search are pending their owners’ integration. No mocked interaction counts as a completed server integration.

## Run the shared app

Use Node **22 LTS** (`nvm use`) and npm. No environment secrets are needed for these demo screens.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` before submitting. `npm start` serves a production build.

The app uses Webpack to avoid native filesystem watcher failures in restricted desktop environments. On such machines use `WATCHPACK_POLLING=true npm run dev`. Versions are pinned in the npm lockfile.

See [the discovery implementation walkthrough](docs/DISCOVERY-HANDOFF.md) for routes, shared components, animations and backend replacement points.

The guide's page heading says Group 7 / ArtisanPro; the group leader confirmed that this team's identity is **Group Four / SabiWork**. The ten feature/non-code-role pairs are retained; names have been allocated as an initial plan.

Do not commit credentials, real identity documents or real customer data. Use fictional demonstration records and test payments only.
