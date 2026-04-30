# ConfidenceBuilder — UX Simplification Design

**Date:** 2026-04-30
**Owner:** todamoonbro@gmail.com (single user / personal use)
**Status:** Approved, ready for plan

## Problem

Across 15 phases of feature additions, the app has accumulated:

- A 13-item navigation split across two rows
- A `/modules` page that stacks 6 heavy "studio" components vertically
- A home page with 4 competing CTAs and no clear primary action
- Standalone scenario pages (`interview-prep`, `executive-presence`, `sales-influence`, `networking`, `difficult-conversations`) that parallel the lab modules but live as separate top-level routes
- Uniform slate-on-white visuals where every card has the same `shadow-sm` weight, so primary CTAs do not pop
- Onboarding presents 6 fields with no framing of how long it takes

The build passes (Phase 17 QA), but cognitive load makes the app hard to use day-to-day.

## Goals

1. **Cut navigation to 5 top-level items.** The user always has the same answer to "what now?": go to **Today** or **Practice**.
2. **Remove competing CTAs from the home page.** One hero, one primary action.
3. **Establish visual hierarchy** so the primary CTA on every page is unmistakably dominant.
4. **De-cram the dense pages** (`/modules`, `/session`).
5. **Verify the app still runs end-to-end** after the refactor (dev server boots, key pages load, recorder + dashboard + practice hub work).

Non-goals:

- Visual redesign of pages that are individually fine (Dashboard, Coach internals, Settings).
- Removing functionality. Every existing page stays reachable; only the *navigation surface* shrinks.
- Backend changes.

## Information architecture

**New top-level nav (5 items):**

| # | Item       | Route         | Contents |
|---|------------|---------------|----------|
| 1 | Today      | `/`           | Single hero "Start today's session" + streak/level glance |
| 2 | Practice   | `/practice`   | Tabs: Skills / Scenarios / Quests |
| 3 | Progress   | `/dashboard`  | Existing dashboard (trends, streak, weakest area, weekly review) |
| 4 | Coach      | `/coach`      | Live AI coach + personalization profile |
| 5 | More ▾     | dropdown      | Settings, History, Admin |

**Pages dropped from nav (URLs preserved):**

- `/modules` → linked from Practice ▸ Skills tab
- `/interview-prep`, `/executive-presence`, `/sales-influence`, `/networking`, `/difficult-conversations` → linked from Practice ▸ Scenarios tab
- `/quests` → Practice ▸ Quests tab
- `/history`, `/settings`, `/admin` → More menu

**New page:** `/practice` is a hub. Three tabs:

- **Skills tab** — 6 compact cards (Articulation, Reading, Impromptu, Listening, Executive Sims, Media). Each card opens the existing `/modules` page anchored to that lab section, OR a new dedicated route if simpler.
- **Scenarios tab** — 5 compact cards (Interview Prep, Executive Presence, Sales, Difficult Convos, Networking) linking to existing routes.
- **Quests tab** — embeds the existing quests UI.

The simplest implementation: `/practice` is its own page with a tab strip and card grids. The cards link to existing pages — we don't try to inline the heavy studios.

## Visual treatment

**Accent color:** indigo-600 (`#4f46e5`). Used for primary CTAs, active nav, progress fills, the "Today" hero panel.

**Hierarchy rules:**

- Primary action — solid indigo, `min-h-11`, `text-base font-semibold`. One per screen.
- Secondary action — outline (slate-300 border, slate-700 text).
- Tertiary — text-only links.

**Card style:** subtle 1px border (`border-slate-200`), no shadow, `p-6` padding. Removing `shadow-sm` from every card is the highest-leverage visual change.

**Typography:** body `text-[15px]`, page titles `text-2xl font-semibold`, section headings `text-lg font-semibold`.

**Today hero (home page):**

```
┌──────────────────────────────────────────────────────┐
│  Day 7 streak · Level 3 Confident Speaker            │
│                                                       │
│  Today's focus                                        │
│  Executive presence — 60-second board update          │
│                                                       │
│  [ Start session → ]      ~12 min                     │
└──────────────────────────────────────────────────────┘
```

Indigo gradient background or solid indigo-50 with indigo-600 CTA. Below the hero: a single thin row of three secondary tiles ("Practice / Progress / Coach") for quick jumps.

## Per-page plan

### Home (`/`)

- Replace current 4-panel layout with: Today hero + 3-tile "Or jump to…" row.
- Pull "today's focus" content from the dashboard endpoint (next recommended drill + skill focus). Falls back to "Start a baseline rep" when the dashboard returns no data.

### Practice hub (`/practice`)

- New page. Three tabs: Skills, Scenarios, Quests.
- Tab implementation: client component with `useState` (or URL hash `?tab=skills`). Pick whichever is simpler — likely URL hash for shareability and SSR.
- Skills cards link to existing `/modules#articulation`, etc., or open the corresponding lab in-place. Decision deferred to plan: easiest path is to anchor-link.
- Scenario cards link to existing scenario routes.
- Quests tab can either embed the existing `/quests` page content or link out — embed is preferred so the user stays in Practice.

### Session (`/session`)

- Replace the 4-step guide block with a thin top progress strip: `● Warm up · ○ Record · ○ Feedback · ○ Retry`.
- Wrap `<RealtimeVoiceCoach />` in a `<details>`-style collapsible (closed by default), labeled "Warm up with live coach ▾".
- Make `<VoiceRecorder />` full-width with larger prompt typography.

### Onboarding (`/onboarding`)

- Add a single helper line above the form: "Takes 30 seconds — you can change anything later in Settings."
- No structural changes.

### App shell (`components/ui/app-shell.tsx`)

- Replace two-row nav with single-row 5-item nav.
- Add a "More ▾" dropdown (HTML `<details>` works fine — no extra deps).
- Keep the "Start session" CTA in the header but restyle to indigo-600.
- Keep skip-to-content link.

### Pages that don't change (visually inherit from app-shell + global classes)

- `/dashboard`, `/coach`, `/coach/overview`, `/coach/personalization`, `/quests`, `/history`, `/settings`, all scenario sub-routes (`*/library`, `*/progress`, `*/session`).

## Testing plan

After the refactor:

1. **Build & typecheck:** `npm run build` and `npm run typecheck` from repo root must pass.
2. **Backend tests:** `npm test -w @confidencebuilder/api` — all 20 existing tests still green.
3. **Smoke test the dev server:**
   - `npm run dev` boots without errors.
   - `/` loads with the new Today hero.
   - `/practice` loads with all 3 tabs functional.
   - `/practice` ▸ Skills cards navigate correctly.
   - `/practice` ▸ Scenarios cards navigate correctly.
   - `/dashboard` loads (gracefully shows empty state if API unreachable).
   - `/session` loads, the live-coach collapsible toggles, the recorder is interactive.
   - `/onboarding` loads with the new helper line.
   - The "More ▾" dropdown opens and links work.
4. **Visual sanity:** the indigo CTAs are visually dominant on every page; no card has `shadow-sm`.
5. **Document any failures** the user must fix manually (e.g., missing `OPENAI_API_KEY` will degrade transcription — that's expected and not a regression).

## Out of scope (explicitly)

- Mobile-first redesign beyond what Tailwind responsive classes already give us.
- Animations beyond a single hover-lift on primary CTAs.
- Replacing the React shim or strengthening typing (per QA report recommendations — separate cleanup).
- Backend / API changes.
- Adding new features.

## Files expected to change

- `apps/web/components/ui/app-shell.tsx` — collapse nav to 5 items + More dropdown.
- `apps/web/components/ui/page-header.tsx` — type scale bump.
- `apps/web/components/ui/nav-link.tsx` — indigo active state.
- `apps/web/app/page.tsx` — Today hero rewrite.
- `apps/web/app/practice/page.tsx` — **new** practice hub page.
- `apps/web/app/practice/practice-tabs.tsx` — **new** client component for tab switching (if using URL hash).
- `apps/web/app/session/page.tsx` — collapse 4-step guide to strip; collapse live coach.
- `apps/web/app/onboarding/page.tsx` — helper line.
- `apps/web/app/globals.css` — indigo accent CSS vars if needed; remove default shadow class usage.
- Possibly: small adjustments to `apps/web/app/modules/page.tsx` to support anchor links from Practice ▸ Skills (e.g., add `id` attributes to each lab section).

## Definition of done

- All 5 issues listed in Problem are visibly addressed.
- Build, typecheck, and backend tests pass.
- Dev server smoke-test checklist above is complete.
- A short summary of what changed (and any caveats) is reported back to the user.
