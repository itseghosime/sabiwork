# Delivery schedule

All times WAT (Africa/Lagos, UTC+1). Final submission Monday, 2 November 2026; instructor time to be confirmed.

| When | Required result |
|---|---|
| Before members build in parallel | Natalie supplies the shared app/types/fixtures/shell foundation; Abdulrahman reviews/merges. Members use one route/component system. |
| Thursday 29 October | Agree schema/auth/data contracts early; push draft frontend PRs and demonstrate at least one working page each. Raise blockers with evidence. |
| Friday 30 October, 2 p.m. | Each member submits all assigned working responsive frontend pages, typed mock-service integration, navigation/form interactions, screenshots/demo, checks and non-code role output. Clearly disclose backend work not yet connected. |
| Friday afternoon | Leader reviews/merges ready work; each owner fixes their own integration/layout defects. Confirm the Saturday connection plan. |
| Saturday 31 October | Whole-team backend workshop: replace mock adapters with shared database/API/auth integrations, enforce server-side roles/ownership, connect Paystack TEST flow and test the full journey. Each feature owner implements their backend responsibility. |
| Sunday 1 November | Finish backend/access/payment and responsive checks, deploy, polish README/demo and rehearse. Proposed code freeze 6 p.m. |
| Monday 2 November | Final smoke test and submission at the instructor's deadline. |

Friday is frontend readiness, not a claim that database/auth/payments work. Backend foundations must start early; completing all backend work from zero on Saturday is risky for beginners. No one should quietly replace missing integrations with fake success messages. The leader supports/reviews and contributes their own work; they do not take over everyone else's implementation.

Before final submission demonstrate: login -> artisan search/profile -> request -> quote/acceptance -> server-confirmed TEST deposit -> progress -> customer sign-off -> TEST balance -> review/dispute. Also demonstrate verification admin, availability and guide completion, with wrong-role/wrong-owner requests rejected by the server. Duplicate/unverified payment events must not mark milestones paid twice.
