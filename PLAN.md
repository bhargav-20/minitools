# Awesome Mini-Tools — UI/UX Distinction Plan

## The thesis
Mini-tools are commodities. A counter is a counter. The distinction is not *what* the
tools do — it's *how they feel*. The bundle wins on craft: motion, weight, sound, tactile
feedback, and one cohesive design language that makes 15 tools feel like a single
handmade product. We are competing on feel, not features.

Reference bar: Family, Linear, Arc, iA Writer, Rauno Freiberg / Emil Kowalski web craft.

---

## Design principles (the north stars)
1. **Physicality over flatness.** Things have weight, spring, and momentum. Nothing
   teleports; everything moves. Buttons depress, dice tumble, reels spin down.
2. **Feedback on every interaction.** Every tap answers with motion + optional sound +
   haptic (mobile). Nothing feels dead.
3. **One language, many tools.** Shared tokens, spacing, motion curves, and a home shell
   so switching tools feels like flipping cards in the same deck.
4. **Keyboard-first, thumb-friendly.** Full keyboard control on desktop; big, reachable
   targets on mobile. Both are first-class.
5. **Instant + offline.** Zero loading spinners. State persists locally. Feels native,
   installable (PWA).
6. **Calm by default, delightful on interaction.** Restrained resting state; the joy
   comes out when you touch it.

---

## Foundation / design system (build this FIRST)
The moat is the shared layer. Ship this before any individual tool.

- **Tokens:** color (semantic, light/dark/system), spacing scale, radii, elevation,
  typography scale. One accent color the user can change; whole app re-themes live.
- **Motion system:** a small set of named spring/easing presets (`snappy`, `soft`,
  `bouncy`). Every animation pulls from these — never ad-hoc durations. Respect
  `prefers-reduced-motion`.
- **Sound system:** subtle, optional, toggleable UI sounds (tick, roll, complete, error).
  Muted by default with an obvious toggle; preloaded, <30ms latency.
- **Haptics:** `navigator.vibrate` patterns on supported devices, mapped to sound events.
- **Primitives:** Button (with press physics), Toggle, Slider, NumberFlow (animated
  rolling digits), Card, Sheet/Modal, Toast. Reused everywhere for consistency.
- **Shell:** home grid of tool cards + command palette (Cmd/Ctrl-K) to jump between tools.
  Shared header, theme switcher, sound toggle.

---

## Tool roster (curated for where UI/UX can shine)
Picked for delight potential, not utility. Grouped so the design language has range.

### Tactile / satisfying
- **Counter** — tally with weight
- **Dice roller** — physics tumble
- **Coin flip** — 3D flip
- **Random number generator** — slot-machine reel
- **Metronome** — visual + audio pendulum

### Productivity
- **Todo list** — the flagship polish piece
- **Pomodoro / focus timer** — radial
- **Stopwatch** — lap tracking
- **Scratchpad** — instant local notes

### Generators / converters
- **Color palette generator** — with copy-to-clipboard flourish
- **Password generator** — strength as living feedback
- **Unit / currency converter** — live rolling digits
- **QR code generator** — draws itself on

### Calm
- **Breathing exercise** — expanding orb, paced
- **Tip / split calculator** — friendly, fast

Start with ~5, prove the design language, then expand.

---

## Per-tool signature moves (the "wow" details)
One or two crafted details per tool. This is where the distinction lives.

- **Counter:** number rolls (odometer) on change; button springs down; long-press to
  fast-increment with accelerating haptic; swipe down to decrement; shake/reset with
  confirm. Support multiple named counters as cards.
- **Dice roller:** real 3D dice that tumble and settle with physics + sound; shake gesture
  (mobile) or spacebar (desktop) to roll; d4–d100 selection; result pulses.
- **Coin flip:** 3D coin spins on Z with motion-blur; lands with a bounce and a *clink*.
- **RNG:** slot-machine reels spin and decelerate to the number; configurable range;
  satisfying lock-in tick per digit.
- **Metronome:** swinging pendulum synced to audio; tap-tempo; downbeat accent; visual
  flash you can feel the beat from.
- **Todo (flagship):** drag-to-reorder with spring; swipe-to-complete with a strikethrough
  that draws itself; completed items sink with a satisfying settle; add-item field that
  stays focused; undo toast; confetti-free but genuinely satisfying check animation.
- **Pomodoro:** radial ring drains smoothly (not ticking per-second); breathing color
  shift work→break; gentle chime.
- **Stopwatch:** buttery 60fps digits; laps slide in and stack; fastest/slowest lap
  color-coded.
- **Scratchpad:** cursor lands instantly, autosaves invisibly, char/word count that
  animates.
- **Color palette:** generate on spacebar; each swatch copies its hex with a checkmark
  morph on click; lock swatches you like; drag to reorder.
- **Password generator:** strength meter that reacts live as you toggle rules; reveal with
  a blur-off transition; copy with feedback.
- **Converter:** rolling digits on the result as you type; unit switcher with a flip.
- **QR generator:** the QR draws itself module-by-module as you type (debounced).
- **Breathing:** an orb that expands/contracts on a 4-7-8 cadence with soft glow; screen
  dims around it.
- **Tip calculator:** big friendly steppers, live split, rounding toggle with a snap.

---

## Cross-cutting UX
- **Command palette (Cmd/Ctrl-K):** jump to any tool, run actions, switch theme.
- **Deep links + shareable state:** every tool has a URL; state encoded so a configured
  tool is shareable.
- **Theming:** light/dark/system + user accent color, applied live everywhere.
- **Persistence:** per-tool state in localStorage; nothing lost on refresh.
- **PWA:** installable, offline, app icon, splash. Feels native on mobile.
- **Onboarding:** none needed — tools are self-evident. First-touch micro-hints only.
- **Accessibility:** keyboard nav, focus rings, ARIA, reduced-motion, contrast — non-negotiable.

---

## Recommended tech stack
- **Framework:** React + Vite (fast, simple) or Next.js if we want per-tool routes + SEO.
  Recommend **Next.js (App Router)** for URL-per-tool + shareable state + good defaults.
- **Language:** TypeScript.
- **Styling:** Tailwind + CSS variables for tokens (live theming).
- **Motion:** Framer Motion (springs, gestures, layout animations) — the workhorse.
- **Rolling digits:** `number-flow` or hand-rolled.
- **3D dice/coin:** react-three-fiber + a light physics lib, OR CSS 3D transforms if we
  want zero deps (recommend CSS 3D first, upgrade to r3f only if it isn't convincing).
- **Sound:** Howler.js or the Web Audio API directly for low latency.
- **State/persistence:** Zustand + a localStorage sync helper.
- **PWA:** next-pwa / vite-plugin-pwa.

---

## Phased build plan
1. **Foundation** — tokens, motion presets, sound/haptic system, core primitives, shell +
   home grid + command palette + theming. (No tools yet — prove the language.)
2. **Tactile trio** — Counter, Dice, Coin flip. These validate the physicality thesis fast
   and are the most shareable/demo-able.
3. **Flagship** — Todo list. The productivity polish showpiece.
4. **Expand** — Pomodoro, Stopwatch, RNG, Metronome, Breathing.
5. **Generators** — Color palette, Password, Converter, QR, Tip.
6. **Polish pass** — PWA, deep links, accessibility audit, motion tuning, sound design.

Ship each phase as a working, deployed slice.

---

## Decisions (locked)
- **Stack:** Next.js (App Router) + TypeScript. URL-per-tool, shareable state, cohesive shell.
- **3D:** CSS 3D transforms everywhere — no three.js. Dice tumble via spring transitions;
  lands flat and crisp. Keeps every page light.
- **v1 scope:** go big — build 10+ tools before first "launch," shipping in phases.
- **Styling:** Tailwind + CSS variables for live theming.
- **Motion:** Framer Motion. **State:** Zustand + localStorage sync. **PWA:** next-pwa.

## Concrete build plan
### Phase 0 — Scaffold
- `create-next-app` (App Router, TS, Tailwind, ESLint, `src/`, `@/*` alias).
- Add Framer Motion, Zustand. Set up folder structure:
  `src/app/(tools)/<tool>/page.tsx`, `src/lib/` (tokens, motion, sound, haptics, storage),
  `src/components/` (primitives + shell).
- Prettier + strict TS config.

### Phase 1 — Foundation (no tools yet — prove the language)
- Design tokens: CSS variables for color (light/dark/system), spacing, radii, type scale;
  one swappable accent.
- Motion presets (`snappy`/`soft`/`bouncy`) as shared spring configs; reduced-motion guard.
- Sound system: preloaded WebAudio clips, global mute toggle (off by default).
- Haptics helper (`navigator.vibrate`), mapped to sound events.
- Primitives: Button (press physics), Toggle, Slider, NumberFlow (rolling digits), Card,
  Sheet, Toast.
- Shell: home grid of tool cards, shared header (theme + sound toggle), Cmd/Ctrl-K palette.
- `useToolState` hook: typed localStorage persistence.

### Phase 2 — Tactile trio (validate the feel)
Counter · Dice (CSS-3D tumble) · Coin flip (CSS-3D).

### Phase 3 — Flagship
Todo list (drag reorder, swipe complete, draw-on strikethrough, undo toast).

### Phase 4 — Timers & tactile
Pomodoro (radial) · Stopwatch (laps) · RNG (slot reels) · Metronome · Breathing orb.

### Phase 5 — Generators & utilities
Color palette · Password generator · Unit converter · QR generator · Tip/split calculator.

### Phase 6 — Polish
PWA (installable/offline), deep links + shareable state, accessibility audit,
motion + sound tuning, deploy.
