# Marketplace journey corrections and verification — 2 November 2026

Base: `119dee1e851cb4da96877bd3ea496fa71b20935f` (`main`, PR #26).
Status: code and isolated integration checks complete; actual customer/artisan browser journey and Paystack test charges passed. Admin/provider payout walkthrough remains unverified. This is not a claim that every production journey has passed.

## Problems corrected

- The homepage illustration cards linked to fictional profile IDs that do not exist in the production directory. They now link to the corresponding real trade listings, with trade labels instead of invented popularity/verification claims.

- Saved drafts had no publish action on their detail page.
- Artisans could see opportunities but received a forbidden response when opening a first quote. Requests also disappeared from opportunities after their first quote, before a booking existed.
- Quote acceptance was not transactional, and the UI read the wrong response field instead of opening the created booking. Booked requests could still receive quote changes/cancellation attempts.
- The directory collected a standalone 10% deposit without creating a job or connecting to the customer/worker/escrow ledgers. Directory entry now requires agreement on a quote before payment; the actual booking collects two 50% milestones.
- Booking checkout, verification and receipt routes were placeholder notices. They now use persisted, owner-scoped provider test transactions.
- `/api/payments` accepted a browser-selected success scenario. It now rejects that write path; only server verification or a signature-checked webhook confirms payment.
- Customer payment history and paid amounts were inferred from job status. They now use saved verified transactions. Legacy simulation rows are excluded from verified totals.
- Work could start without payment and complete without customer inspection or balance payment. Verified deposit activates work; the assigned artisan requests inspection; explicit customer sign-off opens the balance; verified balance completes the job.
- Payments did not create escrow-ledger holds. Each verified payment now creates one hold, keyed by its payment ID. Holds become release-due after sign-off and final settlement.
- Artisan cleared earnings used incoming customer payments rather than successful payouts. Cleared earnings now use successful release records; unreleased holds remain pending.
- Payout requests lacked a durable reservation. A row lock reserves one transfer reference; a timeout stays pending and retries reconcile that reference. Matching amounts/references, signed callbacks and reversal handling prevent premature or duplicate release. Admin can check an in-flight payout from the UI.
- Customer issue screens fabricated a case without persisting it. The connected path now saves the report/events, scopes case visibility to participants/admin, and freezes unreleased holds. Admin release/no-action determinations restore eligibility; refund/split decisions do not execute refunds and keep funds frozen.

## Verified automatically

`npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` passed. `npm test -- --reporter=dot` passed: 32 test files, 171 tests. The full isolated journey suite was also rerun successfully after adding persisted artisan details to the booking API.

The journey suite runs all SQL migrations against an isolated PGlite PostgreSQL engine and executes real application route handlers/Drizzle queries. Authentication and Paystack are stubbed boundaries; it does not exercise real Neon login, email delivery, Paystack checkout, bank resolution or provider callbacks over the network.

Covered: draft → publish → competing artisan quotes → acceptance → booking on both sides → pending/failed/verified deposit → progress → artisan readiness → customer sign-off → failed/retried/verified balance → issue freeze/admin resolution → payout recipient → release → review. Also covers wrong-owner/admin restrictions, forged amounts/currency/references, invalid webhook signatures, signed webhook replays, simultaneous acceptance/checkout, duplicate milestones/reviews, premature payout, timeout reconciliation and payout reversal. Separate UI tests cover locked balance checkout, no duplicate pay button after settlement, pending-vs-confirmed receipts, and initially unchecked inspection controls. Provider configuration tests reject live/mixed keys before sending a request.

## Browser evidence and limits

In the existing signed-in local customer session, a clearly fictional QA request was saved as a draft and remained after refresh. Its detail view had no publish action before these fixes. That baseline screen had no document overflow at 390, 768 or 1440px; this is not responsive proof for the newly changed screens.

## Authenticated preview/provider results

The latest preview was redeployed at commit `7f6abf2` against a separate Neon branch, `sabiwork-journey-qa-20261102`. Migration 0008 was applied only to that QA branch. Six sensitive, branch-specific preview variables connect its database, Auth and Realtime. Production database/schema and production Vercel variables were not changed. Exact no-trailing-slash Auth trusted origins were added for the existing production and PR app origins to correct signup's Invalid origin error.

Actual browser checks passed:

- Customer signup/login/sign-out; publish request; a separate artisan signup, work-profile save, request discovery and quote submission.
- Quote acceptance creates a matching booking in customer and artisan boards and opens its deposit checkout.
- Paystack hosted TEST checkout and server-confirmed receipt for a ₦15,000 deposit. SQL confirmed one matching held escrow record and an in-progress booking.
- Artisan progress note appears in the customer's shared timeline. Premature customer sign-off is rejected until artisan readiness. Artisan readiness, then four explicit customer inspection checks, opens balance checkout.
- Paystack hosted TEST checkout and server-confirmed receipt for the ₦15,000 balance. SQL confirmed a completed booking, artisan readiness and customer sign-off, two confirmed payments totalling 3,000,000 kobo, and two release-due holds.
- Customer review saved; booking showed the submitted four-star rating and correct ₦30,000 recorded total.
- Customer issue persisted with its event history and froze both unreleased holds. Final SQL confirmed both remain disputed; no payout was sent.

The verified provider journey uses request `2210fa2b-27c2-488f-90e9-2378716f0a72`, quote `bd856076-b11d-40eb-b4bb-c78945aeb2ac`, and booking `84e828e0-416f-4295-843b-cdec0060b387`. All descriptions explicitly identify fictional QA work. An earlier QA customer used a reserved `.test` email rejected by Paystack; repeating with an `example.com` QA address reached checkout without weakening provider validation. Its earlier unpaid booking is intentionally retained as evidence.

## Remaining limits

- The connected browser reported no open tabs at the final five-minute wrap-up, preventing further interactive checks. A dedicated QA admin was not created and actual admin resolution, recipient setup and provider payout were not completed. The final QA holds intentionally remain disputed/frozen.
- Admin authorization, dispute decisions, recipient creation, release, duplicate prevention, timeout reconciliation and reversal pass isolated integration tests with a stubbed provider. Those tests do not prove real Paystack transfer success or network webhook delivery.
- Real callback redirects and server verification succeeded for charges. External signed webhook delivery was not separately confirmed.
- Artisan identity/work-sample document submission is explicitly unavailable in this build; verification depends on out-of-band evidence and administrator review. Training remains a session-only preview. Refunds and split disbursements are not implemented; such decisions retain the freeze.
- Password recovery/email delivery, every settings/support path, and responsive checks of all changed authenticated screens have not been completed. Do not interpret this report as every profile journey being production-ready.
- No live money was charged or transferred. The new code/migration has not been promoted to production. Only the repository owner merges main; this PR remains draft until the remaining validation and product gaps are addressed.
