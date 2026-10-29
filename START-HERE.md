# Group Four: start here

**Working frontend code due Friday, 30 October 2026, 2 p.m. WAT.** Work today and tomorrow; backend integration is a whole-team session on Saturday, 31 October.

## Your links

| What you need | Link |
|---|---|
| Repository | [SabiWork on GitHub](https://github.com/itseghosime/sabiwork) |
| Your assigned pages | [Team allocation](docs/TEAM.md) and [task issues](https://github.com/itseghosime/sabiwork/issues) |
| Completed design reference | [Shared Stitch project](https://stitch.withgoogle.com/projects/6038732663245800013) |
| Design rules | [DESIGN.md](DESIGN.md) |
| Coding-agent rules | [AGENTS.md](AGENTS.md) |
| Exact screen routes | [Screen ownership](docs/SCREEN-OWNERSHIP.md) |
| Beginner instructions | [Beginner guide](docs/BEGINNER-GUIDE.md) |
| Prompt to paste into OpenCode | [Implementation prompt](docs/OPENCODE-PROMPT.md) |
| Branches and pull requests | [Contribution guide](CONTRIBUTING.md) |

## 1. Get access

Send Abdulrahman your GitHub username. Accept the repository invitation when it arrives. You can read this public repository before accepting, but pushing your branch requires collaborator access. Do not share passwords or access tokens.

## 2. Clone the shared repository

With Git installed, open a terminal in a suitable projects folder and run:

```sh
git clone https://github.com/itseghosime/sabiwork.git
cd sabiwork
git switch -c feat/your-name-pages
```

Replace `your-name` with your own name, for example `feat/emmanuel-profiles`. If the repository is already cloned, do not clone it again. Save/commit your work before switching branches, then update from main using the contribution guide. Never push directly to main.

## 3. Check the app foundation before coding

At this documentation update, main has no application package.json. **Do not create your own separate app.** Tell Abdulrahman the foundation is missing, then use the time to read your assignment and prepare your Stitch code/screenshots. The shared foundation is coordinated through Natalie’s accounts/foundation task and must be reviewed/merged first.

Once merged, follow its README for Node version, environment placeholders and setup (normally npm ci followed by npm run dev). Do not copy credentials into GitHub or AI prompts. Everyone builds in the same app using shared types, layouts and components.

## 4. Implement your assigned screens

Open the cloned repository folder in OpenCode. Find your screen IDs in TEAM.md and the corresponding final frames in Stitch. Use Stitch’s available code/export option and include screenshots for mobile/tablet/desktop. Copy OPENCODE-PROMPT.md, fill in your name/IDs/routes and supply that code and those references.

Tell OpenCode to adapt the export into the existing Next.js/React/TypeScript app using AGENTS.md and DESIGN.md. One responsive implementation covers all three sizes. Reuse shared navigation/logo/components; do not create a new design system or paste a standalone HTML document into the app.

Use agreed typed mock services for Friday. Navigation, filters, form validation and page states should work. Clearly disclose backend-pending functionality; do not fake authentication, verified payment success or real persistence. Saturday integration belongs to the original feature owners working together.

## 5. Check and submit

Check phone (390px), tablet (768px), desktop (1440px), keyboard access, images, long text and buttons. Run the repository’s configured checks and record actual results.

Push your branch after accepting the invitation:

```sh
git push -u origin feat/your-name-pages
```

Use your actual branch name. On GitHub choose Compare & pull request; base branch main, compare your branch. Include your screen IDs/routes, related issue number, PR summary, short code explanation, checks and remaining mock/backend dependencies. Screenshots and a short walkthrough help review. Never include secrets. Only Abdulrahman merges.

AI may help write the explanation, but you must understand it and be able to explain your implementation. Do not submit code you cannot demonstrate.

## Help and learning

Abdulrahman coordinates, reviews, merges and contributes his assigned work; he will not do your assigned work for you. Ask for help with your branch/PR, what you tried, expected/actual behaviour and the precise issue. Raise blockers immediately rather than waiting for Friday.
