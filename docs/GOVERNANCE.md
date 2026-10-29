# Repository governance

Owner: @itseghosime (Abdulrahman). Public personal repository. Usernames and collaborator invitations are pending.

Two separate main-branch rulesets are active:

1. **Owner-only merge:** restrict updates to main; only repository administrators bypass, and only through pull requests. In this personal repository the owner controls administration. Do not add apps or other roles to the bypass list.
2. **Main quality:** require a pull request, resolved review conversations and the Repository checks status; the approving-review count is zero; block force pushes and deletion. No bypass actors. Squash merges only.

Abdulrahman is the sole decision maker for review, acceptance and merging. GitHub's approving-review count is zero because an author cannot approve their own PR; this does not grant anyone else merge permission. Contributors may leave comments, but their approval is neither required nor sufficient to merge main. CODEOWNERS routes review requests to the owner; the owner-only update ruleset enforces merge authority. Required checks and conversation resolution remain active. Never enable auto-merge or a merge bot without reviewing its permissions.

The owner can edit repository rules as administrator; no rule can prevent the repository owner from changing the rules themselves. Restriction enforcement must be checked using GitHub readback; source JSON files alone do not enforce anything.

CI is documentation-only until the foundation adds package.json. Then a committed lockfile and lint, typecheck, test and build scripts are mandatory. Do not treat an empty repository's checks as application validation.
