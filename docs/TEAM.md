# Group Four: page ownership and delivery

Working responsive FRONTEND code is due **Friday, 30 October 2026, 2:00 p.m. WAT**. Backend foundations start before Friday; feature integration is a whole-team workshop on **Saturday, 31 October**. Final submission is Monday, 2 November (instructor time pending).

Eight members have five screen IDs; two have four. All S01-S48 are assigned exactly once. This balances page count, not exact effort: onboarding, calendars and payment flows contain extra states. A screen's mobile/tablet/desktop designs are implemented as ONE responsive page/component, not three separate applications. Extra steps/variants belong to that screen owner.

| Member ID | Member | Frontend screen IDs | Count | Backend feature ownership | Non-code role |
|---|---|---|---|---|---|
| 01 | Abdulrahman Itseghosime Bello | S01, S02, S03, S47, S48 | 5 | Search and categories | Project lead |
| 02 | Uduehi Emmanuel | S04, S05, S06, S40, S41 | 5 | Artisan profiles | Client and research lead |
| 03 | Abigail Oghogho Igbinomwanhia | S14, S15, S16, S17, S18 | 5 | Job requests and quotes | UX and wireframes |
| 04 | George Elueze | S19, S20, S21, S24, S25 | 5 | Milestone payments | Content writer |
| 05 | Godswill Silvanus | S26, S27, S28, S29, S30 | 5 | Job tracking | SEO and marketing |
| 06 | Mohammed Usman | S31, S32, S33, S34, S35 | 5 | Reviews and disputes | QA test lead |
| 07 | Chukwu Chikodili Rachel | S36, S37, S38, S39 | 4 | Artisan dashboard | Accessibility and mobile reviewer |
| 08 | Amuele Sophia Ifeanyi | S08, S22, S23, S42, S43 | 5 | Verification admin | Security and access tester |
| 09 | Obiekwe Chioma Benedicta | S13, S44, S45, S46 | 4 | Training corner | Docs and README |
| 10 | Natalie Ekun Omokhafue | S07, S09, S10, S11, S12 | 5 | Accounts, roles and security | Pitch and demo lead |

## Friday acceptance

Each person personally implements ALL assigned screen IDs, not merely one. Use the existing shared Next.js app, root DESIGN.md and shared components. Every page must be responsive at 390/768/1440px, have working navigation, meaningful local form validation and interactions, and relevant loading/empty/error/success states driven by typed mock services.

Submit a PR linked to the member's existing issue, page routes/screen IDs, screenshots at all three widths, a short walkthrough, setup/test steps, mock/backend-pending disclosures and the non-code deliverable. Source ZIPs, exported HTML or screenshots alone do not count as working code. Run the existing lint/typecheck/test/build scripts; do not invent passing results or weaken checks. Every person must explain their own code.

## Foundation before parallel work

Natalie opens a small foundation PR first: one Next.js App Router/TypeScript app, npm lockfile, scripts required by CI, shared types/fictional fixtures, initial route map, and public/customer/artisan/admin shells. Abigail coordinates shared UI components; Rachel checks responsive behaviour; Abdulrahman reviews and merges. Do not create ten separate apps. Members branch from the merged foundation and immediately open draft PRs. The repository currently contains coordination files, not a completed app scaffold.

Start the shared Neon schema, Better Auth and API/data contracts before Saturday. Friday pages may use typed mock services while those foundations progress. Saturday is for replacing adapters and connecting feature flows, not discovering ten incompatible data models.

## Screen ownership versus backend ownership

The table allocates FRONTEND work evenly; the brief's feature/non-code pairs remain intact. Some pages cross a feature boundary. Their frontend owner coordinates with the backend feature owner:

- Sophia implements S08/S22/S23 UI; Natalie owns signup/auth and George owns payment verification logic.
- Emmanuel implements verification submission/status UI S40/S41; Sophia owns verification backend decisions/access.
- George implements quote comparison/acceptance UI S19/S20; Abigail owns request/quote backend logic.
- Godswill implements payment history UI S26; George owns payment records/verification.
- Chioma implements account settings UI S13; Natalie owns account/security mutations.
- Abdulrahman's S47/S48 reuse Natalie's access/error contract.

Saturday backend owners: Abdulrahman search; Emmanuel profiles; Abigail requests/quotes; George test payments; Godswill tracking; Mohammed reviews/disputes; Rachel dashboard/availability; Sophia verification admin; Chioma training; Natalie accounts/roles/emails and shared webhook entry point with George. Everyone contributes and fixes their own work; the leader does not become the sole backend developer.

## Shared implementation rules

Read [BEGINNER-GUIDE.md](BEGINNER-GUIDE.md), [SCREEN-OWNERSHIP.md](SCREEN-OWNERSHIP.md), [IMPLEMENTATION.md](IMPLEMENTATION.md), root AGENTS.md and root DESIGN.md. Use the prompt in [OPENCODE-PROMPT.md](OPENCODE-PROMPT.md).

Use fictional Ada/Osaze sink-repair data consistently: NGN30,000 total, NGN10,000 deposit, NGN20,000 balance; store money as integer kobo. Frontend mocks must be labelled development/demo only. They do not implement authentication, authorisation, payment verification, escrow or real persistence. No real identity documents or live payment keys.

GitHub usernames/invitations remain pending. Work on a feature branch (or fork until access is available). Only Abdulrahman through @itseghosime merges main. Do not push directly to main or weaken repository rules.
