# Natalie’s account screens — frontend handoff

Implemented with AI assistance on `feat/10-accounts-natalie`. Natalie should read, run and explain the code before presenting it. This is Friday’s frontend delivery, not completed authentication.

| ID | Route | What to demonstrate |
|---|---|---|
| S07 | `/signup/customer` | Required fields, password checks, visibility controls, preview completion and verification link |
| S09 | `/login` | Sample credentials, failed login, pending state, public-directory return and verification-required preview |
| S10 | `/verify-email` | Sample address, resend countdown, sample verification link, invalid/expired link and completion |
| S11 | `/forgot-password` | Validation, generic recovery reply and sample reset link |
| S12 | `/reset-password?token=demo-valid` | Strong matching passwords and honest completion; missing/expired links recover safely |

## Run and explore

Use the existing app: `npm ci`, then `npm run dev`. No authentication credentials or environment file are needed for these local previews. Use fictional `.test` addresses and never a real password.

- Login fixture: `ada@example.test`, password `SabiWork-demo-2026!`. “Fill sample details” fills both fields.
- `offline@example.test` shows a recoverable signup/login failure while preserving input.
- `unverified@example.test` plus the sample password previews the verification-required path.
- Any valid `.test` email gets the same recovery reply. Non-`.test` emails show a backend-pending message.
- Verification and reset accept `token=demo-valid`; `token=demo-expired` demonstrates expiry. Other tokens are invalid. These literal tokens are public fixtures, not credentials.
- Signup passes its sample email to verification in React memory only. Reloading verification restores the default sample address. No password is stored, logged or placed in a URL.

## How the code works

`validation.ts` checks fields without trimming passwords. `demo-adapter.ts` provides typed, cancellable local preview results. `account-form.tsx` renders signup/login/recovery variants and preserves input after failures. `verification-form.tsx` owns resend/verification feedback and its local countdown. The route group supplies the shared public navigation, brand and demo notice; its prefixed CSS keeps the homepage unchanged. Inputs use labels/error descriptions; invalid submission focuses the first invalid field. Buttons remain at least 44px high, password controls 44px square. Forms come first on mobile/tablet.

The five server route wrappers provide metadata; reset/verification await Next.js `searchParams` and pass only a bounded token string. There is no custom API, database, cookie, session or email send. Success text explicitly describes a preview. The artisan signup link belongs to Sophia’s S08 and remains pending that implementation.

## Saturday integration contract

Replace the demo adapter with Better Auth/Resend-backed operations. Coordinate S08 with Sophia and S13 with Chioma. Enforce account roles and customer/artisan/admin authorization on the server; never trust a URL or client role. Never permit public admin signup. Implement real token expiry/single use, email delivery, safe session cookies, generic recovery replies, server validation and server rate limits. A browser countdown is presentation only. Add and run the actual Neon migrations together; this PR does not supply a schema or security guarantees.

Coordinate the shared workspace shells before adding authenticated layouts. Their existing presentation components do not perform authorization. Do not enable live authentication by simply removing demo notices.

## Checks and evidence

`npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` are required. The suite now has 23 tests, including ten account tests covering validation, adapter boundaries/cancellation, invalid-field focus, password visibility/clearing, recoverable failure, login/signup/recovery previews, reset-token rejection, verification and resend cooldown.

Browser evidence is in `docs/validation/natalie/`: five screens at 390/768/1440px, plus interaction-state screenshots and measured layout data. No page or button horizontal overflow was found at these widths. These are responsive screenshots, not a claim that the implementation is a pixel-for-pixel Stitch export. Layout follows the shared DESIGN.md tokens; the existing Stitch tab could not be inspected during this pass.

## Short explanation for the demo

“I implemented five responsive account screens using reusable form components and a separate typed adapter. I validate the fields and show pending, error and completion states. Password visibility is local, and successful previews clear the password fields. No account or session is created yet. On Saturday we replace the preview adapter with server authentication and connect email verification and reset links.”
