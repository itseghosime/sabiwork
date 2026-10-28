---
name: Clear Trade Modern
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#3f4850'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#6f7881'
  outline-variant: '#bec8d1'
  surface-tint: '#006491'
  primary: '#006491'
  on-primary: '#ffffff'
  primary-container: '#38a8e8'
  on-primary-container: '#003a56'
  inverse-primary: '#8aceff'
  secondary: '#485f84'
  on-secondary: '#ffffff'
  secondary-container: '#bbd3fe'
  on-secondary-container: '#435a7f'
  tertiary: '#576065'
  on-tertiary: '#ffffff'
  tertiary-container: '#97a0a7'
  on-tertiary-container: '#2e373d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#8aceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004b6f'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b0c8f2'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#30476b'
  tertiary-fixed: '#dbe4eb'
  tertiary-fixed-dim: '#bfc8ce'
  on-tertiary-fixed: '#141d22'
  on-tertiary-fixed-variant: '#3f484e'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.625rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

The design system projects clarity, directness, and pragmatic reliability for an on-demand service and trade exchange. The target audience comprises daily mobile and desktop users seeking qualified service trades, alongside service providers managing active gigs. The interface avoids institutional grandeur, regulatory exaggerations, and heavy corporate posturing. Instead, it prioritizes immediate visual legibility, responsive feedback, and unvarnished operational transparency.

### Design Movement: Modern Corporate Utility
The aesthetic balances clean, structural modernity with accessible consumer-grade warmth:
- High typographic contrast and functional breathing room over ornamental clutter.
- Tactile affordance on all action points with minimum 44px tap targets for seamless on-the-go utility.
- Grounded structural rhythm using crisp pale surfaces, restrained deep-navy accents, and vivid sky-blue primary focal points.
- Logo lockup standard: The standalone slim ribbon-S mark is strictly decoupled from the logotype, paired alongside bold, editable typographic branding featuring a sky-blue accent.
- Honest platform status: Demonstrations explicitly mark sandbox environments with standard test mode signifiers (e.g., Paystack TEST Mode badges), completely omitting claims of official registries, guild seals, escrow underwritings, or physical dispatch infrastructure.

## Colors

The palette establishes high chromatic discipline, prioritizing readability and explicit actionable states over complex tonal gradients.

### Core Swatches
- **Primary Sky Blue (`#38A8E8`):** Applied to primary calls-to-action, key navigational highlights, active tabs, progress bars, and high-priority brand indicators.
- **Secondary Dark Navy (`#0E294B`):** Structural foundation for sidebars, dark badge backgrounds, high-contrast headings, and grounding elements.
- **Surface Pale Blue (`#EFF8FF`):** Canvas tint, nested card highlights, passive alert backdrops, and active row selections.
- **Pure White (`#FFFFFF`):** Base canvas, modal containers, cards, and input backgrounds.
- **Text & Structure:**
  - High-Contrast Text: `#111827` (Body text, data points, active states).
  - High-Contrast Muted Text: `#1F2937` (Subheadings, key-value headers).
  - Secondary / Supporting Text: `#64748B` (Metadata, timestamps, placeholder copy).
  - Neutral Structural Borders: `#E2E8F0` (Default panel dividers, inputs, structural card borders).
  - Highlight Accent Borders: `#BAE6FD` (Primary focus states, active card borders, sky blue container strokes).

### Semantic Indicators
- **Success:** Emerald `#10B981` (Surface: `#ECFDF5`, Border: `#A7F3D0`)
- **Warning / Sandbox:** Amber `#F59E0B` (Surface: `#FFFBEB`, Border: `#FDE68A`)
- **Destructive:** Crimson `#EF4444` (Surface: `#FEF2F2`, Border: `#FECACA`)
- **Test Mode Banner / Pill:** Paystack TEST badge uses a `#0E294B` background with `#38A8E8` or `#EFF8FF` contrast lettering.

## Typography

The type system pairs the geometric, confident proportions of **Plus Jakarta Sans** for prominent headers with the neutral, hyper-legible utilitarian performance of **Inter** for all functional interface copy, inputs, forms, and data grids.

### Font Hierarchy & Roles
- **Headlines (Plus Jakarta Sans):** Applied to view titles, card headings, and marketing sections. Features tight tracking (`-0.01em` to `-0.02em`) to maintain density.
- **Body & Data (Inter):** High x-height ensures readability across varied mobile screens, outdoor lighting, and dense list rows.
- **Labels & Interactive Targets (Inter Semi-Bold / Medium):** Strict baseline alignment for buttons, table headers, validation cues, and test environment chips.

## Layout & Spacing

Layouts follow a fluid, responsive 12-column grid on desktop/tablet views and a single-to-two-column flow on mobile viewports.

### Breakpoints & Canvas Bounds
- **Mobile (`< 640px`):** Single column, `margin: 1rem`, `gutter: 0.75rem`. Full-width interactive components and bottom sheet patterns.
- **Tablet (`640px - 1024px`):** 8-column layout, `margin: 1.5rem`, `gutter: 1rem`.
- **Desktop (`> 1024px`):** 12-column system, max content container width of `1280px`, `margin: 2rem`, `gutter: 1.25rem`.

### Spatial Rhythm
Inner layout gaps leverage the standard 4px/8px scale. Spacing within atomic elements (e.g. icon-to-label gaps) is locked at `8px` (`space-xs`) to prevent collapsing across varied platform renderings.

## Elevation & Depth

Visual hierarchy uses crisp, low-contrast structural outlines paired with light, tinted ambient shadows. Surface elevation reflects clear functional stacking without muddiness or heavy skeletal borders.

### Elevation Hierarchy
- **Level 0 (Flat Canvas):** `#FFFFFF` or `#EFF8FF`. Zero shadow. Demarcated solely by `#E2E8F0` or `#BAE6FD` 1px borders.
- **Level 1 (Cards, List Items, Standard Panels):**
  - Background: `#FFFFFF`
  - Border: `1px solid #E2E8F0`
  - Shadow: `0 1px 3px 0 rgba(14, 41, 75, 0.05), 0 1px 2px -1px rgba(14, 41, 75, 0.05)`
- **Level 2 (Dropdowns, Popovers, Active Cards on Hover):**
  - Background: `#FFFFFF`
  - Border: `1px solid #BAE6FD`
  - Shadow: `0 4px 6px -1px rgba(14, 41, 75, 0.08), 0 2px 4px -2px rgba(14, 41, 75, 0.06)`
- **Level 3 (Modals, Overlays, Floating Action Shelves):**
  - Background: `#FFFFFF`
  - Border: `1px solid #BAE6FD`
  - Shadow: `0 10px 15px -3px rgba(14, 41, 75, 0.1), 0 4px 6px -4px rgba(14, 41, 75, 0.08)`

## Shapes

The interface employs a balanced `roundedness: 2` (base 8px radius) scale, lending an approachable yet clean and organized feel. 

### Corner Radii Guidelines
- **Buttons, Inputs, Selects:** `8px` to `12px` (standard `rounded-md` to `rounded-lg`).
- **Cards & Data Modules:** `12px` to `16px`.
- **Badges, Status Chips, Avatar Fallbacks:** Full pill radius (`9999px`) or `6px` depending on data density.
- **Modals & Bottom Drawers:** `16px` on desktop, `20px` top radius on mobile drawer sheets.

## Components

### Buttons
All button controls must strictly adhere to the following baseline:
- **Geometry:** `min-height: 44px`, `border-radius: 8px` to `12px`, padding `px-5 py-2.5` (`20px` horizontal, `10px` vertical).
- **Flex Behavior:** `flex-shrink: 0`, `white-space: nowrap`, `word-break: normal`.
- **Icon Alignment:** Supporting icons must have `flex-shrink: 0` and maintain a fixed `8px` gap (`gap-2`) from text.
- **Variants:**
  - *Primary:* Background `#38A8E8`, text `#FFFFFF`, hover `#2597D7`, active `#1D85C0`.
  - *Secondary / Dark:* Background `#0E294B`, text `#FFFFFF`, hover `#183D6D`.
  - *Subtle:* Background `#EFF8FF`, border `1px solid #BAE6FD`, text `#0E294B`, hover background `#E0F2FE`.
  - *Outline:* Background transparent, border `1px solid #E2E8F0`, text `#111827`, hover border `#BAE6FD`, hover background `#EFF8FF`.

### Input Fields & Controls
- **Fields:** Minimum height `44px`, background `#FFFFFF`, border `1px solid #E2E8F0`, corner radius `8px`, text color `#111827`, placeholder text `#64748B`. Focused state: border `#38A8E8`, box-shadow `0 0 0 3px rgba(56, 168, 232, 0.2)`.
- **Checkboxes & Radio Buttons:** Size `20px × 20px` with a minimum touch zone of `44px × 44px`. Unchecked border `#E2E8F0`, checked background `#38A8E8`, checked glyph `#FFFFFF`.

### Cards & Surfaces
- Structured with a `1px` border (`#E2E8F0`), Level 1 elevation, and white background.
- Highlighted cards or active bookings leverage a `#EFF8FF` background and `#BAE6FD` border.

### Status Indicators & Demo Mode Banners
- **Demo / Sandbox Payment Indicators:** Marked with `Paystack TEST Mode`. Neutral slate or navy container (`#0E294B`), light text (`#EFF8FF`), and an accent border (`#38A8E8`).
- **Forbidden Content:** Zero presentation of guild seals, government accreditation icons, regulatory stamps, escrow warranty tags, or fake support lines. All demo booking and worker profiles must display clean, fictitious sample states.

### Chips & Badges
- Height `28px` to `32px`, corner radius `9999px` (pill), horizontal padding `10px`.
- Standard trade chips use `#EFF8FF` background, `#BAE6FD` stroke, and `#0E294B` font-weight 500 text.