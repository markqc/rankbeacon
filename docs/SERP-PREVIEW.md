# SERP Preview

## Overview

The SERP Preview is a browser-side tool at `/tools/serp-preview`. It lets users enter a page URL and **fetch live metadata** from the secure `POST /api/v1/serp-preview/fetch` endpoint, or manually edit the fields to see an estimated Google search result for desktop and mobile.

## How it works

### Inputs

| Field | Purpose |
|---|---|
| Page URL | Public http/https URL to fetch, or manual value for the preview URL line. |
| Site name | Displayed instead of the domain when Google chooses to show a site name. |
| Breadcrumb / path | Overrides the URL pathname in the preview URL line. |
| Favicon | A safe decorative icon shown before the URL line. Remote favicons are not loaded automatically. |
| Title | The page `<title>` content being previewed. |
| Meta description | The page `<meta name="description">` content. |

### Fetch Page

The `Fetch Page` button sends the URL to `POST /api/v1/serp-preview/fetch`, which:

1. Validates the URL scheme, credentials, and host.
2. Resolves the host to a public IP and pins the connection to prevent DNS rebinding.
3. Fetches the page with short timeouts and TLS verification.
4. Parses `<title>`, `<meta name="description">`, Open Graph, JSON-LD site name, canonical, favicon, robots, language, and breadcrumb.
5. Returns normalized and final URLs plus a list of warnings.

Fetched values populate the form but do **not** lock the fields. Users can edit anything after a fetch. If the user has already edited a field, clicking `Fetch Page` again shows a confirmation prompt before overwriting.

### Calculations

- **Title width** is measured in pixels with `CanvasRenderingContext2D.measureText()` using a 20px sans-serif font that matches the preview typography.
- **Description width** is measured as the total single-line pixel width with a 14px sans-serif font. It is compared against `descMaxWidth × descMaxLines` to estimate whether the text would exceed the allowed block.
- **Truncation** for the title is computed by finding the longest grapheme-cluster prefix that fits within `titleMaxWidth - ellipsisWidth` and appending `…`.
- **URL display** is sanitized and normalized: scheme and `www.` are stripped, the path is split on `/`, and segments are joined with `›`.

### Thresholds

Configured in `resources/js/features/serp-preview/constants.ts`:

| Device | titleMaxWidth | descMaxWidth | descMaxLines | previewWidth |
|---|---|---|---|---|
| Desktop | 580px | 580px | 2 | 600px |
| Mobile | 340px | 340px | 4 | 360px |

The warning ratio is 0.8 for both title and description. These numbers are based on observed Google result widths at common viewport sizes, not a guaranteed limit.

### Visual preview

- The preview card width matches the selected device (`max-w-[600px]` or `max-w-[360px]`).
- The title is rendered at 20px and visually truncated to `titleMaxWidth`.
- The description is rendered at 14px, constrained to `descMaxWidth`, and clamped to `descMaxLines` with `-webkit-line-clamp` and `overflow-wrap: anywhere` for long unbroken strings.
- Direction is set with `dir="auto"` so right-to-left titles and descriptions render naturally.

## States and warnings

The UI handles these fetch states:

- **Idle** — no fetch in progress.
- **Validating** — quick client-side URL check.
- **Loading** — the server is fetching and parsing.
- **Success** — metadata returned with no issues.
- **Partial success** — metadata returned, but warnings were reported (e.g., missing title, noindex, HTTP error).
- **Rate-limited** — the per-IP limit of 30 requests/minute was exceeded.
- **Timeout** — the server or the page did not respond in time.
- **Blocked URL** — the URL is private, malformed, unsupported, or otherwise unsafe.
- **Unsupported content** — the response was not `text/html` or `application/xhtml+xml`.
- **General error** — network or unexpected server failure.

Warnings are announced through the `role="status"` live region and displayed as a list. Plain language is used throughout; the tool never claims a page is definitely indexed or ranked.

## Security and data handling

- Only `http` and `https` URLs are accepted. Embedded credentials are rejected.
- All validation, DNS resolution, IP pinning, and parsing happen on the server.
- Remote favicons are **not** loaded into the preview. A safe local icon set is used instead.
- The request is protected by the Laravel CSRF token and rate-limited to 30 per minute per IP.
- User input is rendered as text nodes; React escapes it. The tool never injects user HTML.
- JavaScript execution on the fetched page is not supported in the MVP and is documented as a future option.

## Limitations

- Search engines may rewrite titles and snippets; the preview is an estimate only.
- Pixel measurements use the browser canvas (with a deterministic fallback for SSR/tests) and may differ slightly from Google's actual rendering because fonts, OS scaling, and browser versions vary.
- The parser does not execute JavaScript, so client-rendered metadata may be missed.
- Keyword highlighting is not implemented in this release and is documented here for a future phase.

## How to change preview rules

1. Adjust `SERP_THRESHOLDS` in `resources/js/features/serp-preview/constants.ts`.
2. If you change the preview font sizes, update `SERP_FONTS` to match the rendered CSS so measurements stay aligned.
3. Update `SAMPLE` if you want different default values.
4. Update or add tests in `resources/js/features/serp-preview/*.test.ts` when changing calculation logic.
