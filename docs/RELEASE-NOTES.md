# Release Notes

## MVP — SERP Preview

### New features

- **SERP Preview tool** at `/tools/serp-preview` with desktop and mobile preview cards.
- **Fetch Page** integration with the secure `POST /api/v1/serp-preview/fetch` API.
- Server-side URL validation, DNS resolution, IP pinning, TLS, timeouts, and content-type checks.
- Metadata extraction for title, description, site name, canonical, favicon, robots, language, Open Graph, JSON-LD, and breadcrumb.
- Full fetch-state UI: idle, validating, loading, success, partial-success, rate-limited, timeout, blocked-url, unsupported-content, and general-error.
- Warning panel for missing metadata, noindex directives, canonical mismatches, non-200 HTTP status, and unsafe favicons.
- Safe favicon handling: the preview uses local icon choices, not remote favicons, to avoid mixed content and tracking.
- Editable fields after fetch; confirmation prompt before overwriting local edits.
- `AbortController` cancellation with a 20-second client timeout.

### Architecture

- `resources/js/features/serp-preview/api.ts` — typed API client, CSRF handling, and warning builders.
- `resources/js/features/serp-preview/types.ts` — `SerpState`, `ApiData`, `ApiResponse`, and `FetchStatus`.
- `resources/js/features/serp-preview/useSerpPreview.ts` — state, dirty tracking, and `setFromApi`.
- `resources/js/features/serp-preview/SerpPreviewTool.tsx` — integrated UI with status announcements and warnings.
- `app/Domain/SeoTools/Services/UrlMetadataFetcher.php` — secure fetcher with `CURLOPT_RESOLVE` and redirect re-validation.
- `app/Domain/SeoTools/Services/UrlSecurityValidator.php` — URL normalization and SSRF prevention.

### Test coverage

- 49 PHP tests (unit and feature) covering IP validation, URL security, metadata parsing, and the controller.
- 52 frontend Vitest tests covering input updates, preview switching, reset, fetch flows, and all major error states.

### Known limitations

- JavaScript-rendered metadata is not parsed; full page rendering is a documented future option.
- Chunk splitting is now active; the main entry chunk is ~316 kB but the total JS bundle still includes `lucide-react` and Inertia.
- IPv6 literal `CURLOPT_RESOLVE` should be verified on the deployment platform if IPv6 targets are expected.
