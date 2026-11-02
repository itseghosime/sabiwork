# Shared implementation contract

This is the shared contract for team implementation. SCREEN-OWNERSHIP.md supersedes the approximate routes below. Owners must agree changes in the relevant issue before dependent code is changed.

## Application conventions

One Next.js App Router / TypeScript app, one Neon database, Better Auth, Resend, Paystack test mode, Vercel. Use feature folders under src/features/{search,profiles,requests,payments,tracking,reviews,dashboard,verification,training,accounts}. Shared UI goes in src/components; server-only modules must not be imported into client components.

Natalie owns the foundation and shared auth/types; each feature owner owns their data access, validation and migration. Coordinate package/lockfile and shared-layout changes. Foundation PR documents supported Node version, npm scripts, migration runner and environment variable names without values. Commit package-lock.json.

## Data and access

UUID application IDs, UTC timestamps, NGN currency, money as integer kobo, no floating-point amounts. Render human dates in Africa/Lagos. Auth library keeps its own supported ID/schema conventions; reference its user ID consistently rather than changing it blindly.

| Entity | Key data / owning feature |
|---|---|
| User/session | Better Auth user ID and server-managed role: customer, artisan, admin (10) |
| ArtisanProfile | userId, skills, area, bio, portfolio, verificationStatus (02; verification managed by 08) |
| JobRequest | customerId, category, area, description, images, desired date (03) |
| Quote | jobRequestId, artisanId, totalKobo, status, milestone plan (03/04) |
| Job | acceptedQuoteId, customerId, artisanId, status (03/05) |
| Milestone/payment | jobId, kind, amountKobo, reference, provider status, processed event/reference (04/10) |
| ProgressUpdate | jobId, authorId, text, photo references, timestamp (05) |
| Review/dispute | jobId, customerId, rating/reason, resolution and audit data (06) |
| Availability | artisanId, start/end, available flag (07) |
| VerificationRequest | artisanId, private fictional evidence, status, reviewer/time/reason (08) |
| Guide/completion | guide content, userId, guideId, completedAt (09) |

Quote states: pending -> accepted or rejected; only one accepted quote per request, enforced transactionally. Job states: awaiting_deposit -> in_progress -> awaiting_signoff -> completed, with a separately authorised cancellation path. Deposit confirmation enables work; customer sign-off enables the final balance; completion requires confirmed final payment. Disputes are a separate record and do not invent an automatic refund. Agree any changes before implementing.

Search ratings are calculated from persisted eligible reviews. Verified badges derive from admin decisions. Earnings derive from confirmed test payment records. Public pages never expose identity documents, private addresses or other customers' requests.

## Routes and boundary owners

| Surface | Routes | Owner |
|---|---|---|
| Discovery | /, /artisans, /categories | 01 |
| Profiles | /artisans/[id], /artisan/profile | 02 |
| Requests/quotes | /requests/new, /requests/[id], /requests/[id]/quotes | 03 |
| Payments | /jobs/[id]/payments, /payments/[reference] | 04 |
| Tracking | /jobs, /jobs/[id] | 05 |
| Reviews/disputes | /jobs/[id]/review, /jobs/[id]/dispute, /disputes/[id], /admin/disputes | 06 |
| Dashboard | /artisan, /artisan/jobs, /artisan/earnings, /artisan/availability | 07 |
| Verification | /artisan/verification, /admin/verification, /admin/verification/[id] | 08 |
| Training | /training, /training/[id], /training/[id]/certificate | 09 |
| Accounts | /login, /signup, /forgot-password, /reset-password, /settings, /api/auth/[...all], /api/webhooks/paystack | 10 |

Preferred JSON envelope for feature APIs: `{ data: ... }`; errors `{ error: { code, message, fields? } }`. Use appropriate 400, 401, 403/404, 409 and 5xx statuses, pagination on lists and validation on the server. App Router server actions may be used consistently instead, but preserve the same authorisation and error semantics. Never trust role, price, userId or payment success from the client.

Natalie verifies Paystack's signature on the raw webhook body before dispatching to George's transaction-safe handler. Validate reference, expected amount and currency against server records and provider verification. Use unique references and idempotency, never mark success from a browser redirect alone. Persist no card details. Refunds and escrow are outside the prototype unless explicitly implemented and validated; the UI must not promise protection the test flow does not provide.

## Current Neon backend status

Neon Postgres, Managed Auth, and Realtime are provisioned. Application migrations `0001`–`0007` are applied to the production database. Local environment variables are listed in `.env.example`; never commit `.env.local` or `.env.backend-test.local`, and verify `NEON_BRANCH` before running `npm run db:migrate`.

Implemented in this branch:

- Managed Auth signup, login, sign-out, and password reset. Email OTP/verification is intentionally disabled.
- Server-checked sessions and database-backed role checks. Any signed-in non-admin account can hire; an account may also create an optional work profile to be hired. Admin remains a separately provisioned role.
- Database-backed work profiles and public search. Production `/explore`, `/artisans`, and public artisan details include only listed account-created profiles and saved review summaries. Local development may show the explicitly disclosed fictional seed profiles for presentations; these do not appear in production listings or public APIs. Missing real portraits render as initials.
- Customer requests, itemized quotes, jobs, progress updates, and reviews use Neon with ownership and role checks. Amounts are stored as integer kobo.
- Admin verification, trade, audit, escrow-ledger, and payout workflows are server/API-backed where implemented. Identity-document storage and formal dispute arbitration are not implemented.
- Paystack deposit/transfer integrations are test-mode only. Deposit status is based on server-side provider verification and webhook validation; no real funds are moved and no escrow guarantee is made.
- Device preferences are local to the browser. Training progress and certificate views are preview-only and are not persisted or accredited.

The current production database contains 20 seeded artisan records and zero account-created artisan profiles. The public listing filters out those seeds; create and list real work profiles to populate production discovery. Do not run the seed script against production to represent these fixtures as real people.

The migration runner uses the configured database connection. For an isolated validation branch, the smoke-test commands are:

```sh
node --env-file=.env.backend-test.local scripts/migrate.mjs
node --env-file=.env.backend-test.local scripts/backend-smoke.mjs
```

## Shared component contract

AppShell, Sidebar, MobileNav, Button, Input, Select, FilterSheet, ArtisanCard, VerifiedBadge, StatusBadge, JobTimeline, MilestoneSummary, Dialog, Toast and EmptyState. Abigail coordinates UX; Rachel checks keyboard/focus/touch behaviour. One shared token set. Feature owners reuse these components rather than making ten conflicting sets.

## Verification

Every owner supplies a successful path and at least one meaningful failure or access test. Combined checks include wrong-owner job access, forbidden admin signup/access, duplicate quote acceptance, unverified/duplicate payment notification, failed payments, review eligibility, persistence after refresh and keyboard operation. No real credentials in PRs or recordings.

## Connected marketplace payment change (migration 0008)

The journey-fix branch adds migration `0008_connected_marketplace_payments.sql`. It has been exercised in an isolated PostgreSQL test engine, not applied to production by this change. Apply it to an isolated validation database before running this branch's payment/job queries. Directory browsing leads to a scoped quote and booking before collecting money. New milestones use `paystack_verified_test` records and are confirmed by the provider on the server; historical simulated rows do not count as verified funds. Work readiness, customer sign-off, balance settlement, release eligibility and provider payout are separate persisted stages. Release remains an authorized admin action after completion, not an automatic transfer from the browser.

See [the journey QA record](JOURNEY-QA-2026-11-02.md) for tests, remaining authenticated/provider checks and migration requirements.
