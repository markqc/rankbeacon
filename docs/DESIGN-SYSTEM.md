# Design System

## Principles

- **Light theme only** for this release.
- **Accessible by default**: WCAG 2.1 AA contrast, visible focus states, semantic landmarks, keyboard navigation, and reduced-motion support.
- **Responsive from 320px** to large desktop with a mobile-first layout.
- **Privacy-first assets**: system font stack and locally bundled icons; no external tracking or third-party font CDNs at runtime.
- **Original identity**: custom lighthouse mark; no Spotibo assets or wording.

## Typography

- **Font stack**: system sans-serif to avoid layout shift and external requests.
  ```css
  ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, 'Noto Sans', sans-serif, ...
  ```
- **Scale**:
  - `text-xs` — captions, footer meta
  - `text-sm` — body, navigation, buttons
  - `text-base` — large buttons
  - `text-lg` — subtitles
  - `text-3xl` — page H1 on mobile
  - `sm:text-4xl` — page H1 on tablet+

## Color tokens

| Token | Hex | Usage |
|---|---|---|
| `navy-950` | `#10233F` | Brand, headings, header/footer brand text |
| `navy-900` | `#1A2F4D` | Hover states |
| `teal-500` | `#0EA5A8` | Primary buttons, accents |
| `teal-600` | `#0B8A8C` | Primary button hover |
| `blue-600` | `#2563EB` | Links, focus rings |
| `pale-50` | `#EAF4FF` | Soft backgrounds |
| `success` | `#16A34A` | Positive states |
| `warning` | `#D97706` | Caution states |
| `danger` | `#DC2626` | Errors |
| `info` | `#2563EB` | Informational states |

## Spacing and layout

- **Container**: `max-w-7xl` (80rem / 1280px) with `px-4 sm:px-6 lg:px-8`.
- **Section padding**: `py-12` standard.
- **Grid/gap**: `gap-4`, `gap-6`, `gap-8` depending on density.
- **Border radius**: `rounded-lg` for inputs/buttons, `rounded-xl` for cards.

## Components

### Actions

- `Button` — `primary | secondary | outline | ghost` × `sm | md | lg`.
- `LinkButton` — same styles as `Button`, rendered as an Inertia `Link`.

### Content

- `Badge` — `neutral | success | warning | danger | info`.
- `Card` — white surface, rounded, shadow on hover.
- `Container` — max-width wrapper.
- `SectionHeading` — `h1 | h2 | h3` with optional subtitle.

### Forms

- `FormField` — label, hint, error text.
- `TextInput` — single-line input with error styling.
- `Textarea` — multi-line input with error styling.

### Feedback

- `Alert` — `info | success | warning | danger` with icon and title.

### Shell

- `Header` — responsive header with lighthouse mark, descriptor, desktop nav, mobile menu, active route, and `Explore Tools` CTA.
- `Footer` — links and dynamic year credit.
- `SkipLink` — focusable skip-to-content link.
- `PageHead` — Inertia `Head` wrapper for title and meta description.

## Accessibility

- Skip-to-content link is the first focusable element.
- `main` has `id="main-content"` and is programmatically focusable (`tabIndex={-1}`).
- `:focus-visible` global ring of `blue-600` with `ring-offset-2`.
- Active navigation items expose `aria-current="page"`.
- `prefers-reduced-motion` disables animations and smooth scrolling.

## Icons

- **Lighthouse mark**: original SVG in `resources/js/components/icons/Lighthouse.tsx`.
- **UI icons**: `lucide-react` (ISC license) used for `Menu`, `X`, `Info`, `CheckCircle`, `AlertTriangle`, and `AlertCircle`.

## Usage example

```tsx
import Button from '../components/Button';
import Container from '../components/Container';

<Container>
    <Button variant="primary" size="md">Open SERP Preview</Button>
</Container>
```

## Visual QA checklist

- [ ] 320px — no horizontal overflow, stacked header, readable text.
- [ ] 375px — comfortable tap targets (≥44px), single-column layout.
- [ ] 768px — desktop nav visible, two-column card grids possible.
- [ ] 1024px — container centers, consistent spacing.
- [ ] 1440px — no max-width blowout, footer stays at bottom.
- [ ] Keyboard-only — skip link, nav, CTA, and mobile toggle reachable with clear focus.
- [ ] No console errors; no layout shift on font load (system fonts).
