# Changelog

## 1.1.0 — 2026-09-06

### Added

- Private admin area with authentication, dashboard, analytics, settings, user management, and activity logs.
- Database-backed settings with encrypted secrets, runtime mail configuration, and SMTP2GO support.
- Privacy-conscious analytics with bot/admin exclusion, DNT/GPC opt-outs, and retention pruning.
- Security hardening, accessibility improvements, and cross-module integration tests.

### Changed

- Admin branding, site name, and favicon are now configured through settings instead of static config.
- `/privacy` and `/terms` now render the approved Privacy Policy and Terms of Use (effective September 5, 2026), replacing the pre-launch drafts; both pages emit `robots: index,follow` via a new `robots` prop on `PageHead`/`MainLayout`.

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
