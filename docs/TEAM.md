# Group Four: assignments

GitHub usernames are pending; no invitations or issue assignees are configured. These are initial allocations, using the supplied roster while moving Abdulrahman to the guide's project-lead pairing. Swaps keep one feature and one non-code role per person.

| ID | Member | Feature | Non-code role | Working-code acceptance by Friday 2 p.m. WAT |
|---|---|---|---|---|
| 01 | Abdulrahman Itseghosime Bello | Search and categories | Project lead | Search persisted artisan records by skill, area and minimum rating; combine and reset filters; result and no-result states; links to profiles. Own integration decisions and review, not teammates' implementation. |
| 02 | Uduehi Emmanuel | Artisan profiles | Client and research lead | Read persisted skills, portfolio photos, reviews and verification state; artisan can edit only their own profile; no self-issued verified badge. Submit concise customer/artisan research findings. |
| 03 | Abigail Oghogho Igbinomwanhia | Job requests and quotes | UX and wireframes | Customer creates a persisted request; artisan submits quote with price and milestones; customer compares and accepts one quote; reject acceptance by another customer and prevent double acceptance. Submit connected core flow/wireframes. |
| 04 | George Elueze | Milestone payments | Content writer | Initialize Paystack test payment server-side for an agreed milestone; verify amount, NGN currency, reference and provider result before recording success; failed/cancelled/retry states and duplicate-event handling; payment history. Coordinate webhook receiver with Natalie. Submit final UI/error copy. |
| 05 | Godswill Silvanus | Job tracking | SEO and marketing | Persist job status and progress photo references; only assigned artisan updates progress; only owning customer signs completion off; invalid transitions rejected. Submit metadata and short project introduction. |
| 06 | Mohammed Usman | Reviews and disputes | QA test lead | Customer reviews their completed job once; persists rating and text; disputes can be submitted and tracked; only authorised admins resolve disputes. Submit shared smoke-test report and actionable bug list. |
| 07 | Chukwu Chikodili Rachel | Artisan dashboard | Accessibility and mobile reviewer | Own-job list, detail links, persisted availability calendar; earnings derived from verified test payment records; no cross-artisan records. Submit keyboard/mobile/accessibility findings. |
| 08 | Amuele Sophia Ifeanyi | Verification admin | Security and access tester | Admin sees pending fictional verification submissions, approves/rejects with reason, records actor/time; artisan submits own request and sees status; prevent unauthorised access server-side. Submit role/ownership access-test results. |
| 09 | Obiekwe Chioma Benedicta | Training corner | Docs and README | List guides, open guide, persist completion; show a clearly labelled SabiWork course-completion certificate, not an external qualification. Submit setup/environment/migration/seed instructions. |
| 10 | Natalie Ekun Omokhafue | Accounts, roles and security | Pitch and demo lead | Better Auth signup/login/logout and email flow; server-side customer/artisan/admin access; no public admin signup; shared Paystack webhook receiver verifies signature on raw body and dispatches to George's idempotent payment handler. Submit pitch/demo runbook. |

## Every member submits

- A review-ready pull request linked to their feature issue, not a ZIP file or screenshots alone.
- Working code connected to the shared app and database, migrations/seed updates, and relevant positive and negative checks.
- Mobile, tablet and desktop screenshots plus a short recording or live walkthrough.
- Exact setup/test instructions, dependencies, remaining defects and honest mock/test-mode disclosures.
- Their non-code-role output and an explanation of the code they wrote.

One common fixture must be shared: customer Ada, artisan Osaze (plumbing, Benin City), one repair request, quote, deposit and balance. All identities and work photos used for testing must be fictional or licensed.

## Early dependencies

Natalie opens the application/auth/database foundation PR immediately; Abdulrahman reviews it and coordinates shared layouts. This is foundation work for Natalie's existing feature, not a transfer of other people's implementation. Abigail and George agree the quote/milestone data with Natalie before building. Sophia and Emmanuel agree verification state. Godswill, Mohammed and Rachel use the same job identifiers/statuses. Each owner supplies typed fixtures early, then replaces fixtures with real shared data before Friday.
