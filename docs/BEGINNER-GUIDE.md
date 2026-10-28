# Beginner workflow: Stitch to working SabiWork pages

## 1. Use the shared app

Get your IDs from TEAM.md and routes from SCREEN-OWNERSHIP.md. Wait for the shared foundation PR to merge; if package.json/app layout is absent, do not generate your own standalone project. Open the cloned repository folder in OpenCode. Create a branch such as feat/01-discovery-abdulrahman with your own member ID/name instead. Until usernames/access are arranged, fork the public repo and submit a fork PR.

Follow README's foundation setup commands (normally npm ci, then npm run dev). Never share secrets in chat or GitHub. Use the repository's recorded Node/package-manager version. Do not run npm install with arbitrary versions just because generated HTML references a library.

## 2. Export your assigned design

Open the shared Stitch project, choose the final frame for your screen ID, and use its available code/export command. Supply that code AND a screenshot to OpenCode. The exact menu can vary; do not assume a right-click item exists. Use mobile/tablet/desktop designs as references for ONE responsive page, not three duplicate codebases. Include relevant modal/onboarding states.

Exported code is a visual starting point. The coding agent must convert it to the existing React/TypeScript/App Router conventions, remove standalone document tags/scripts/CDN styling, reuse shared components, fix inaccessible controls, replace placeholder links and use local/shared assets. Do not dump raw HTML into dangerouslySetInnerHTML or paste a complete document into a page component.

## 3. Give the agent the contract

Use OPENCODE-PROMPT.md with your name, IDs, route, code and screenshot. Root AGENTS.md gives shared coding rules; root DESIGN.md is the exact Clear Trade Modern source. Keep one icon-only logo with normal text beside it. Do not regenerate it.

Data goes through a small typed service/adapter using shared fictional fixtures. Keep it separate from the page JSX so Saturday can replace the adapter. A helpful contract is a typed list/detail/submit interface with loading, success and error results. Mock IDs, schemas, status enums, amounts and dates must be consistent across pages. Shared changes need coordination; do not silently invent an auth/data contract.

## 4. Make the frontend actually work

Links open the agreed routes; drawers/dialogs open/close; filters update the displayed fixtures; forms validate and visibly respond; errors preserve inputs; back/continue preserves onboarding data. Preview demo states explicitly. Do not use alert() as the whole feature, empty handlers, fake payment success or disabled authentication as a substitute for integration. Client-side role views are for preview only and never establish access security.

## 5. Verify and explain

Inspect 390/768/1440px, keyboard focus, long text, icon/image loading, mobile menu and buttons. Run actual configured lint/typecheck/test/build commands. Record failures honestly. Meaningful checks cover your interactions/validation, not tests that simply repeat hardcoded markup.

Push an early draft PR; list route/IDs, screenshots, checks and limitations. Fix feedback and update from main after shared changes. Only Abdulrahman merges main. Do not commit unrelated page rewrites, a new lockfile/package manager, secrets or deployment settings.

Friday deliverable is a connected frontend with disclosed mock data. Saturday backend work belongs to the original feature owners, working with UI owners; final delivery must replace mock adapters and enforce real server-side access/payment validation.
