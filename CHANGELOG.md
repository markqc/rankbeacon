# Changelog

## 1.0.0-MVP — 2026-09-04

### Added

- Google SERP Preview tool with live URL fetching, desktop/mobile views, and manual editing.
- Secure URL Metadata API (`POST /api/v1/serp-preview/fetch`) with URL validation, DNS pinning, IP validation, redirect re-validation, and rate limiting.
- Public supporting pages: `/tools`, `/guides`, `/about`, `/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt`.
- Friendly 404 and 500 pages.
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS (production).
- Full PHPUnit and Vitest coverage for backend and frontend.
- Smoke tests for public pages and the SERP API.
- Documentation for stack, architecture, environment, setup, deployment, operations, backup, rollback, troubleshooting, security, QA, accessibility, and SEO.

### Changed

- `UrlMetadataFetcher` uses Guzzle-managed request options instead of raw `CURLOPT_*` to avoid conflicts with the cURL handler.
- `PublicDnsResolver` now falls back to `gethostbynamel` and `gethostbyname` when `dns_get_record` returns no records.

### Known limitations

- CSP allows `'unsafe-inline'` for scripts and styles. Tighten to nonces/hashes before handling sensitive data.
- No server-side rendering for Inertia meta tags; search engines that do not execute JavaScript may not see dynamic `<title>` and `<meta>`.
- Main JS bundle is ~100 kB gzipped, at the top of the defined budget.
- No automated cross-browser or Lighthouse baseline in CI.
