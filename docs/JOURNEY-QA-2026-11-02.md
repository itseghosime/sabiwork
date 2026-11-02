# Marketplace journey corrections and verification — 2 November 2026

Base: `119dee1e851cb4da96877bd3ea496fa71b20935f` (`main`, PR #26).
Status: code and isolated integration checks complete; authenticated deployment/provider walkthrough pending. This is not a claim that every production journey has passed.

## Problems corrected

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

The production tab was signed out at `/login`. No customer/artisan/admin production session or real provider checkout/payout was completed. No real service was requested, no live payment was made, and no production migration or configuration was changed. New code has not been visually approved on a deployment.

## Setup needed for the remaining walkthrough

1. Use an isolated Neon/Auth validation environment with fictional customer, artisan and administrator accounts. Keep Paystack keys in test mode.
2. Apply additive migration `0008_connected_marketplace_payments.sql` using the existing migration runner against that validation database, then deploy this branch against it. This change does not apply the migration to production. Do not point the existing backend smoke script at production.
3. Sign in privately to the validation deployment. Test actual signup/login/reset separately with a controlled mailbox. Use two different marketplace accounts for customer/artisan; an account cannot quote its own request. Admin must already be provisioned through the supported process.
4. Walk through the chain above at 390/768/1440px. Verify refresh persistence and matching request/job IDs, amounts, actual Paystack test receipts, held/release-due/released statuses, account isolation and provider failure/cancellation behavior.
5. Verify the configured webhook endpoint receives test charge/transfer events. A redirect alone does not establish payment success. Payouts may require provider OTP or test balance; do not replace those with simulated confirmation.
6. An administrator resolves/configures the test recipient and authorizes a release. Customer sign-off makes a settled hold eligible; it does not silently send a transfer. Refunds and split disbursements are not implemented. Training remains a session-only preview, outside the paid-booking chain.

Only the repository owner merges `main`. Keep this PR draft until migration/deployment and the authenticated browser/provider walkthrough are complete.
