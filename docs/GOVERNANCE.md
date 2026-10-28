# Repository governance

Owner: @itseghosime (Abdulrahman). Public personal repository. Usernames and collaborator invitations are pending.

Two separate main-branch rulesets are intended:

1. **Owner-only merge:** restrict updates to main; only repository administrators bypass, and only through pull requests. In this personal repository the owner controls administration. Do not add apps or other roles to the bypass list.
2. **Main quality:** require a pull request, one approval, resolved review conversations and the Repository checks status; block force pushes and deletion. No bypass actors. Squash merges only.

Keeping these separate means the owner's merge permission does not bypass review or checks. Members may review PRs, but cannot merge main. Owner-authored PRs require a teammate's approval. CODEOWNERS requests the owner's review; actual merge restriction is enforced by rulesets, not by CODEOWNERS text. Never enable auto-merge or a merge bot without reviewing its permissions.

The owner can edit repository rules as administrator; no rule can prevent the repository owner from changing the rules themselves. Restriction enforcement must be checked using GitHub readback; source JSON files alone do not enforce anything.

CI is documentation-only until the foundation adds package.json. Then a committed lockfile and lint, typecheck, test and build scripts are mandatory. Do not treat an empty repository's checks as application validation.
