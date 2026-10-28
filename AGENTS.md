# SabiWork project instructions

Read root DESIGN.md, docs/TEAM.md, docs/SCREEN-OWNERSHIP.md, docs/BEGINNER-GUIDE.md and the relevant docs/IMPLEMENTATION.md sections before implementation. Root DESIGN.md is the canonical user-supplied Clear Trade Modern specification. SCREEN-OWNERSHIP.md is the canonical route/page-owner map.

Work only on the named member's assigned screens/features. Do not overwrite unrelated work. Coordinate shared shell/component/type/schema/dependency changes. Use the existing single Next.js App Router/React/TypeScript app and npm lockfile. If the app foundation is absent, report that prerequisite; do not create a parallel app.

Adapt Stitch export as reference into native components; do not paste full document scripts/CDNs or use dangerouslySetInnerHTML. Reuse shared components, logo, navigation and tokens. One responsive implementation covers mobile/tablet/desktop; use separate state/step variants only as needed.

Friday 30 October 2026 at 2 p.m. WAT: working frontend with typed mock-service adapters and honest backend-pending disclosures. Saturday: original feature owners integrate server-side implementations collaboratively. Start shared schema/auth/contracts early. Never implement fake security, mark payments confirmed from a redirect, claim fake persistence or invent escrow guarantees. Keep fixtures fictional; no secrets, real IDs or live payment keys.

Data access must be separate from presentation. Use shared types/IDs/status enums, UTC storage/WAT display, integer-kobo amounts and NGN currency. UI ownership does not transfer the original backend feature responsibility; see TEAM.md cross-feature handoffs.

Buttons never shrink, clip labels or break words. Maintain touch targets, icon spacing, focus, labels and responsive layouts. Verify 390/768/1440px and relevant interaction/error states. Run the configured npm scripts (lint, typecheck, test, build) and report actual outcomes. Do not invent scripts/results or weaken checks to pass.

Work on a feature branch/fork and submit a PR. Only @itseghosime merges main. Do not bypass protections, alter CI/rules without an authorised repository-governance task, or deploy/change service credentials as part of a page task. Explain implementation and limitations so the member can learn and present their code.
