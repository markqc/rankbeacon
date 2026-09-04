# Accessibility Implementation

## Targets

The interface is designed to meet **WCAG 2.2 AA** where practical. This document records what is implemented, what is tested, and what still needs work.

## Implemented

- **Skip link** `SkipLink` moves focus to `<main id="main-content" tabindex="-1">`.
- **Landmarks** — `header`, `main`, `footer`, `nav` with `aria-label` attributes.
- **Headings** — one logical `<h1>` per page, ordered hierarchy.
- **Labels** — all form inputs use `FormField` with associated `<label>` and `htmlFor`.
- **Focus** — `:focus-visible` ring uses `ring-2 ring-blue-600 ring-offset-2`.
- **Keyboard** — all interactive elements are reachable; the SERP Preview device switcher uses `aria-pressed`.
- **Status announcements** — the SERP Preview fetch status lives in a `role="status" aria-live="polite"` region.
- **Error identification** — invalid URLs and fetch errors display a visible `Alert` with `role="alert"`.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables animations and smooth scrolling in `app.css`.
- **Contrast** — text on the base `slate-900`/white pairing and `navy-950`/`white` pairing meets 4.5:1.
- **Target size** — buttons and nav links use `px-4 py-2` or larger.

## Known limitations

- No automated accessibility checker (e.g., Axe) is part of the CI suite yet.
- Mobile menu hamburger uses a single icon swap; the expanded state is conveyed through `aria-expanded`.
- Some decorative cards rely on `bg-pale-50`; review with an actual color-contrast tool before launch.
- The SERP preview output uses `dir="auto"` for mixed-language content; this is a best-effort heuristic.

## Recommended manual checks

1. Tab through the SERP Preview with only the keyboard.
2. Activate the Fetch Page button and confirm the status is announced by a screen reader.
3. Resize to 320px width and confirm no horizontal overflow or overlapping controls.
4. Run an Axe or Lighthouse accessibility audit on `/`, `/tools/serp-preview`, and `/guides`.
