# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # local dev server (HMR)
npm run build     # production build → dist/
npm run preview   # serve dist/ locally
npm run lint      # ESLint
npm test          # run Vitest suite once
npm run test:watch # Vitest in watch mode
```

Tests use Vitest + `@testing-library/react` (jsdom environment, configured in `vite.config.js`). Coverage is concentrated in `src/game-logic/balloonGame.js` (pure logic, highest value) with a couple of component tests for `Balloon.jsx`/`EndScreen.jsx`. `BalloonGame.jsx` itself is stateful/timer-driven and intentionally untested — that's why the logic lives in the plain module in the first place.

## Architecture

React 18 + Vite SPA with React Router v6. Three routes:

| Path | Component | Status |
|---|---|---|
| `/` | `Home` | Live |
| `/games` | `GamesPortal` | Live |
| `/balloon` | `BalloonGame` | Live |
| `/` sections: Alphabet, Stories, Test | — | `path: null` (cards visible, unclickable) |

**All styles live in one file: `src/index.css`.** There are no CSS modules or component-scoped styles.

**`UserContext`** (`src/context/UserContext.jsx`) is a stub — `user` is always `null`. It exists as the wiring point for future Supabase auth (`signIn`/`signOut` TODOs are there).

### Balloon-only deployment variant

`src/App.jsx` reads `import.meta.env.VITE_BALLOON_ONLY`. When it's `'true'`, `/` renders `BalloonGame` directly and `/games` is dropped, so the site is just the balloon game with no homepage/portal — useful for shipping the game before the rest of the site is ready. `/balloon` always works regardless of the flag. Set `VITE_BALLOON_ONLY=true` as a build-time env var on whichever Vercel/Netlify deployment target should be balloon-only; leave it unset elsewhere for full routing. No route code needs to change to switch between the two.

## Balloon Game Mechanics

The core logic lives in `src/game-logic/balloonGame.js`; `BalloonGame.jsx` is purely the React layer.

**Key invariants:**
- All balloons share a fixed 12s animation duration (`FIXED_DURATION = 12`)
- Progress into the cycle is seeded via negative CSS `animation-delay` (e.g. `-6s` = 50% through)
- On init, evenly-spaced progress values are shuffled so balloons start at random heights, not in a diagonal staircase
- 8 balloons in 8 fixed lanes; on correct pop the slot is replaced in-place (`replaceBalloon`) — no balloon is ever removed or re-added
- `pickVisibleTarget` always picks the balloon closest to 50% screen height (progress ~0.45) within the 30–65% window, so the target is always reachable

**Letter cycling:** a `usedLetterIds` Set tracks which of the 50 letters have been seen. Only when all 50 are cycled does the game fully reset the balloon set (score and timer continue).

**Audio:** loaded via `import.meta.glob('../assets/balloonAudio/*.m4a')` — all 50 `.m4a` files are bundled at build time. Files are named with the Malayalam Unicode character directly (e.g. `അ.m4a`).

**`.balloon-letter` must stay on system font.** Elms Sans and Cause are Latin-only. Applying them to this class breaks Malayalam rendering.

## CSS Custom Properties Used in Balloon Game

| Property | Set by | Used by |
|---|---|---|
| `--rise-dur` | `Balloon.jsx` inline style | `.balloon-wrapper` animation duration |
| `--rise-delay` | `Balloon.jsx` inline style | `.balloon-wrapper` animation delay |
| `--balloon-color` | `Balloon.jsx` inline style | `.balloon` background |
| `--balloon-w` | `BalloonGame.jsx` on `.balloon-field` | lane width calculations |
| `--timer-color` | `BalloonGame.jsx` on `.timer-badge` | badge background |

## Font Hierarchy

Loaded via Google Fonts in `index.html`:

| Font | Used on |
|---|---|
| Mansalva | Big page titles (`.students-title`, `.portal-title`) |
| Elms Sans | Headings, badges, score/timer in balloon game |
| Coming Soon | Subtitles, section card titles (bold simulated with `text-shadow` — single-weight font) |
| Cause | Body text, instructions, buttons throughout |

## Homepage Section Cards

Each of the 4 section cards has a per-image CSS class (`.section-icon--alphabet`, `--games`, `--stories`, `--test`) to control individual icon sizing, because the source PNGs have different internal proportions.

## Planned (Not Yet Built)

- Auth: Supabase Google OAuth, wired into `UserContext`
- Score persistence per student
- Malayalam Alphabet, Stories, and Test sections
