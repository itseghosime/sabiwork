# Working together

1. Read root AGENTS.md and DESIGN.md, your assignment in docs/TEAM.md, docs/SCREEN-OWNERSHIP.md and docs/BEGINNER-GUIDE.md before starting.
2. Until collaborator usernames are collected, fork this public repository. Later, members may receive ordinary collaborator access. Only the owner administers the repository.
3. Create a branch: `feat/03-job-requests-abigail` or `fix/03-quote-validation`. Never work directly on main.
4. Keep one feature per pull request. Push an early draft rather than waiting until Friday.
5. Include the issue, implementation summary, migration/setup instructions, screenshots at 390 / 768 / 1440 px widths, test steps and known limitations.
6. Request review from @itseghosime and resolve review conversations. Abdulrahman alone makes the acceptance decision and merges. GitHub requires no approving-review count, so owner-authored PRs do not require a teammate’s approval. Required checks still apply.
7. Only Abdulrahman, through the owner account @itseghosime, merges into main. Approving a PR does not give a member permission to merge it.
8. After a merge, update from main before continuing. Use squash merge. Do not force-push main or delete it.

## Shared files and boundaries

Coordinate changes to package.json, lockfiles, auth, shared layouts, components, database schema and migrations with their owner before editing. Avoid sweeping formatting changes. Each feature uses its own feature directory and migration file; do not overwrite someone else's work.

## Local commands once the application exists

The foundation PR must define `npm run lint`, `npm run typecheck`, `npm test` (non-watch) and `npm run build`. After cloning: `npm ci`, copy the documented environment template, apply the documented migrations, seed fictional records, then `npm run dev`.

CI initially checks repository documentation and accidental environment-file commits. Once package.json is present, CI additionally requires the four application scripts and lockfile and runs them. A green documentation-only run does not prove application functionality.

## Help and learning

Every member owns implementation, debugging, meaningful tests and explaining their feature. AI assistance is allowed, but the member must understand the resulting code. Ask for help with the goal, what you tried, expected/actual behaviour, a minimal error excerpt and a branch or PR link. Never paste secrets in issues.
