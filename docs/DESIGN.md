# Design contract and complete screen inventory

## Reference synthesis

All eleven user-supplied images are references, including the initial Fixr image and the later green cleaning sample. **No single image is the primary reference.** Do not copy another product's identity, text or unsupported functionality.

| Reference group | Observation | Application to SabiWork |
|---|---|---|
| Initial Fixr | Search and location first, categories, trust cues | Make discovery immediately usable on mobile |
| Home services / Homely landing pages (first two in the nine-image set) | Strong typography, human photography, service categories, booking explanation | Build an expressive public homepage with an immediately visible skill/area search |
| Blue mobile journey (images 3-5) | Legible provider comparison, structured steps, itemised payment and progress | Use clear request/quote/milestone steps and strong status feedback |
| Pastel cleaning app (image 6) | Friendly category colour and service imagery | Use restrained category accents, not discounted-shopping mechanics |
| Homecare page (image 7) | Prominent artisan portrait and two-sided calls to action | Give customers and artisans clear separate entry paths |
| Sarwisi marketplace/dashboard (images 8-9) | Rich service discovery, sidebar navigation and work status | Use scannable job lists, timeline and restrained desktop dashboards |
| Latest green cleaning sample | Deep green, warm background and photographic service cards | Consider green/neutral balance and confident hierarchy without imposing its angular style everywhere |

## Product and style

Purpose: help Nigerian customers choose an artisan, agree a job and understand progress and milestone payments. Artisans need work/availability at a glance; admins need clear evidence and safe decisions.

Tone: warm and credible in discovery; calm and precise in payments/admin. Proposed starting tokens: forest #075E46, ivory #F7F6F2, white #FFFFFF, ink #17251F, muted #58655D, pale mint #E8F4EE, restrained amber #E5B85C. Validate contrast in rendered designs, especially text on colour. User reference synthesis is the source; this palette is a proposal, not a claimed extracted match.

Use one readable sans-serif family for body text and an expressive but legible heading weight. Desktop display headings can be stronger; operational screens keep compact titles. Spacing scale 4/8/12/16/24/32/48/64. Corners 12-16 px on content, with consistent controls. Natural artisan/work photography with Nigerian representation; licensed assets, no fabricated identity checks or borrowed logos. Avoid fake review counts, discounts and customer totals.

Primary actions: homepage Find an artisan; profile Request a quote; job Post request / Accept quote; payments Pay deposit / Pay balance; tracking Confirm completion; admin Review verification. Each screen has one clear main action.

## Responsive contract

Create an explicit frame for **every screen** at mobile 390x844, tablet 768x1024 and desktop 1440x1024: not merely stretched copies. Check actual web behaviour at 320 px minimum as well.

- Mobile: single column, accessible bottom navigation for signed-in user, full-width forms, filters in a sheet, readable cards and sticky primary actions with safe-area padding.
- Tablet: two-column discovery when space permits, compact navigation, detail/summary panels that wrap logically.
- Desktop: top navigation for public discovery, sidebar for workspaces, capped content widths, result/filter and detail/summary layouts.
- A table becomes labelled cards on narrow screens when necessary. Avoid body-level horizontal scroll. Calendar may scroll within its own labelled region with an alternative list.
- Persist form entries across recoverable errors. Focus returns correctly after dialogs, inputs have persistent labels, touch targets at least 44x44 px, focus indicators visible, meaning never conveyed through colour alone; respect reduced motion.

## Screen inventory

Each ID requires M/T/D frames. Feature owner from TEAM.md. Related dialogs and state variants belong beside the parent screen.

| ID | Screen / content | Feature |
|---|---|---|
| S01 | Public homepage with search, categories and how it works | 01 |
| S02 | Category directory | 01 |
| S03 | Artisan results with skill/area/rating filters and sort | 01 |
| S04 | Artisan profile: skills, portfolio, reviews, badge | 02 |
| S05 | Portfolio photo viewer | 02 |
| S06 | Artisan profile editor | 02 |
| S07 | Customer signup | 10 |
| S08 | Artisan signup and role-specific onboarding | 10 |
| S09 | Login | 10 |
| S10 | Email verification / resend | 10 |
| S11 | Forgot password / sent confirmation | 10 |
| S12 | Reset password / completion | 10 |
| S13 | Account settings / logout | 10 |
| S14 | New job: description, skill, area, photos, date | 03 |
| S15 | Review and submit job request | 03 |
| S16 | Customer request detail / awaiting quotes | 03 |
| S17 | Artisan open-request list and detail | 03 |
| S18 | Artisan quote and milestone editor | 03 |
| S19 | Customer quote comparison | 03 |
| S20 | Quote detail and acceptance confirmation | 03 |
| S21 | Job milestone summary / deposit checkout | 04 |
| S22 | Payment returning / verifying | 04 |
| S23 | Confirmed test payment / receipt | 04 |
| S24 | Failed/cancelled payment and retry | 04 |
| S25 | Balance due and checkout | 04 |
| S26 | Payment history / transaction detail | 04 |
| S27 | Customer jobs list and status filters | 05 |
| S28 | Shared job detail and progress timeline | 05 |
| S29 | Artisan add progress/photo | 05 |
| S30 | Customer completion sign-off | 05 |
| S31 | Write review / submission confirmation | 06 |
| S32 | Report dispute with evidence | 06 |
| S33 | Dispute detail and status | 06 |
| S34 | Admin dispute queue | 06 |
| S35 | Admin dispute detail and resolution | 06 |
| S36 | Artisan dashboard overview | 07 |
| S37 | Artisan own-jobs list / filters | 07 |
| S38 | Artisan test earnings / transactions | 07 |
| S39 | Availability calendar / editor / list alternative | 07 |
| S40 | Artisan verification submission | 08 |
| S41 | Verification pending/rejected/approved status | 08 |
| S42 | Admin verification queue | 08 |
| S43 | Admin evidence review / approve / reject | 08 |
| S44 | Training guide directory | 09 |
| S45 | Guide detail / completion | 09 |
| S46 | Course-completion certificate | 09 |
| S47 | Permission denied with safe return | 10 |
| S48 | Not found with safe return | 10 |

48 screens x 3 sizes = **144 base frames**, plus relevant state variants. This is the planned inventory, not a claim of generated frames. Prioritise connected S01/S03/S04/S07/S09/S14/S18-S25/S28/S30-S31/S36/S42-S45 for early design batches; complete the remaining frames in the same design system.

## State contract

| State | Trigger | Visible feedback and safe action |
|---|---|---|
| Loading | Search/profile/job/payment fetch pending | Stable skeleton; payment says verifying, never paid early |
| Empty | No artisans/quotes/jobs/reviews | Explain absence; reset filters, post job or return safely |
| Error | Validation/upload/network/payment failure | Specific message next to field or region; retry without losing input |
| Partial | Photo fails or some data unavailable | Keep available details, identify missing portion, retry |
| Success | Persisted request, accepted quote, verified payment, completed action | Confirm actual result with next step; payment includes test-mode label |
| Permission | Wrong role/owner/session | Explain boundary, sign in or return; do not expose private data |

Include focus, hover, selected, disabled and submitting components. Distinguish unverified, pending, verified and rejected states. Certificate must say SabiWork course completion. No production escrow, licensed/insured badges, live maps, chat, wallets, subscriptions or promotional offers unless implemented separately; reference screenshots do not expand the MVP.

## Stitch generation and Figma handoff

Stitch first, then editable Figma. Validate one screen's export/import path before committing to full transfer. Do not assume an export option exists until observed in the current UI.

Generation batches: (1) tokens/components + discovery, (2) accounts/profiles, (3) requests/quotes/payments, (4) tracking/reviews/disputes, (5) artisan workspace, (6) verification/training/global states. Use the same tokens, content, seeded job and component language in every batch. Inspect each batch before expanding.

Figma pages: 00 Cover & flows, 01 Foundations, 02 Components, 03 Public & accounts, 04 Customer journey, 05 Artisan workspace, 06 Admin, 07 Training, 08 States & handoff. Frame naming: S03 / Results / Mobile / Default. Use Auto Layout, reusable components, named variants and a linked core prototype. Annotate responsive changes, route, feature owner and state triggers. Inspect text wrapping and actual editability after import; screenshots pasted as images are not an editable handoff.

## Design acceptance evidence

Store actual M/T/D captures and review notes, not only token values. Review navigation, focus order, contrast, long names, large NGN amounts, form validation, empty results, denied access and payment verification/failure. At initial setup no rendered design or Figma file has been completed; all visual/accessibility checks remain pending.
