# Delivery schedule

All times are WAT (Africa/Lagos, UTC+1). Final submission is Monday, 2 November 2026; the instructor's exact submission time remains to be confirmed.

| When | Checkpoint |
|---|---|
| Wednesday 28 October, tonight | Confirm assignments; collect GitHub usernames; agree shared types, routes and database contract; start foundation PR; establish design direction from all supplied samples. |
| Thursday 29 October, 10 a.m. | Foundation/auth/database skeleton and fictional seed ready; each member has a pushed draft PR and agreed dependencies. |
| Thursday 29 October, 6 p.m. | Every core flow demonstrated; connect features and external test services; raise blockers with reproducible evidence. |
| Friday 30 October, 2 p.m. | Hard internal deadline: every member submits working code and their complete evidence package. |
| Friday afternoon | Abdulrahman reviews and merges passing PRs; owners fix integration defects. |
| Saturday 31 October | Full customer/artisan/admin journey, negative access/payment tests and responsive fixes; feature owners fix their own defects. |
| Sunday 1 November, 6 p.m. | Proposed code freeze; deployment smoke test, README, fictional demo accounts, pitch rehearsal and backup recording. |
| Monday 2 November | Final rehearsal and submission at the instructor's required time. |

The Friday deadline is for working code. Design work must not consume the implementation window. The full screen inventory remains the design target; first complete the connected core journey and shared components, then expand the remaining screens in batches.

## Demo acceptance

1. Customer signs in, finds a verified artisan and views their profile.
2. Customer posts a job; artisan submits a quote; customer accepts.
3. Customer pays a deposit in Paystack test mode; server confirms the payment.
4. Assigned artisan records progress; customer signs off completion and pays the balance.
5. Customer leaves a review or reports a dispute; admin reviews a verification request/dispute.
6. Artisan sees own jobs, verified payment totals and availability; completes a training guide.
7. Unauthenticated, wrong-role and wrong-owner requests are rejected by the server.

No live money, real identity documents or fabricated claims of production escrow. Tests must cover failed and repeated payment notifications. Keep a backup demo recording and disclose unavailable test integrations.
