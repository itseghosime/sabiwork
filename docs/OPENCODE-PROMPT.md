# Copy/paste implementation prompt

Replace bracketed fields and paste the exported Stitch code plus screenshot after the prompt.

```text
I am [NAME], member [ID], implementing ONLY screens [SCREEN IDS] at routes [ROUTES] for SabiWork.

Read root AGENTS.md, root DESIGN.md, docs/TEAM.md, docs/SCREEN-OWNERSHIP.md, docs/BEGINNER-GUIDE.md and the relevant implementation contract. Inspect the existing package.json, app layouts, shared components and types before changing code. If the shared app foundation is missing, stop and report that dependency; do not create another app.

Use the attached/pasted Stitch code and mobile/tablet/desktop screenshots as visual references. Adapt the export to our existing Next.js App Router/React/TypeScript conventions. Reuse the shared theme, icon-only logo plus separate SabiWork text, nav, fields, cards and buttons. Do not redesign, add another navbar/design system, import standalone html/head/body scripts, use CDN Tailwind or dangerouslySetInnerHTML, or copy insecure exported JavaScript.

Implement one responsive page/component per screen ID with relevant steps/dialog/state variants. Make navigation, filters, forms, uploads previews and state changes actually work with agreed typed mock services for Friday. Separate data access from presentation so the backend owner can replace mock adapters Saturday. Use shared Ada/Osaze job records and existing types. Do not invent APIs, new role/status values, fake auth, payment success or persistence claims. Clearly identify backend-pending work. Server-side auth/ownership/payment enforcement will be integrated against the shared foundation.

Match DESIGN.md precisely; no shrinking buttons, clipped labels or broken words. Check 390/768/1440px, 44px touch targets, visible focus, long content and applicable loading/empty/error/success states. Preserve form values after recoverable errors. Use licensed/local/shared assets and no live payment keys or real identity documents.

Edit only my scope. Coordinate shared layout/dependency/type/schema changes rather than rewriting other people's files. Stay on my feature branch; never push/merge main or disable rules/checks. Avoid unrelated dependencies and broad refactors.

Run the repository's actual lint/typecheck/test/build commands where available; fix relevant failures without weakening them. Report commands/results honestly, changed files, screen routes, working interactions, remaining backend dependencies and limitations. Explain the code simply so I can demonstrate and maintain it. Do not claim a page is complete just because it looks correct in one screenshot.

Stitch source code:
[PASTE CODE]

Visual references:
[ATTACH SCREENSHOTS]
```
