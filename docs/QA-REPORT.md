# QA Report — Phase 8

**Project**: RankBeacon MVP
**Date**: 2026-09-04
**Branch/commit**: local working tree

## Commands run

### Backend

| Command | Result |
|---|---|
| `vendor/bin/pint` | PASS (47 files) |
| `php artisan test` | **61 passed** (127 assertions) |
| `composer audit` | No security vulnerability advisories found |

### Frontend

| Command | Result |
|---|---|
| `npm run format:check` | All matched files use Prettier code style |
| `npm run lint` | PASS |
| `npm run typecheck` | `tsc --noEmit` PASS |
| `npm run test` | **52 passed** |
| `npm run build` | ✓ built in 271ms |

### Smoke coverage

`tests/Feature/SmokeTest.php` covers:

- `GET /` homepage
- `GET /tools` tools directory
- `GET /tools/serp-preview` SERP preview
- `GET /guides`, `/about`, `/privacy`, `/terms`
- `GET /sitemap.xml`
- `GET /robots.txt` (non-production restriction)
- `GET /page-that-does-not-exist` (404)
- `POST /api/v1/serp-preview/fetch` success with faked HTML
- `POST /api/v1/serp-preview/fetch` rejection for `192.168.1.1`

## Build output and budgets

```
public/build/assets/app-CSkQkXDM.js             316.46 kB │ gzip:  99.85 kB
public/build/assets/app-D6Tfh1Vi.css             54.29 kB │ gzip:  11.64 kB
public/build/assets/SerpPreview-BrAL4Kqq.js      16.37 kB │ gzip:   5.84 kB
public/build/assets/Home-MUTezXkp.js              8.19 kB │ gzip:   2.68 kB
```

| Asset type | Size (gzip) | Budget | Status |
|---|---|---|---|
| Main JS entry | 99.85 kB | 100 kB | ✅ at limit |
| CSS | 11.64 kB | 20 kB | ✅ under |
| SERP tool | 5.84 kB | 20 kB | ✅ under |

The main entry chunk is at the top of the budget because the Inertia core, React, and `lucide-react` are bundled together. Code-splitting already produces per-page chunks; the main bundle is within the 100 kB gzip target.

## Security headers

A `curl -I http://127.0.0.1:8000/` confirmed the following headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `X-XSS-Protection: 0`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; ...`

`Strict-Transport-Security` is only emitted in `production`.

## Static analysis

- PHP: Laravel Pint is the only static-analysis gate installed. PHPStan/Psalm were not added to the MVP toolchain.
- TypeScript: `tsc --noEmit` with the current `tsconfig` settings passes. Strict mode is not explicitly enabled; the project relies on `noEmit` and ESLint.

## Cross-browser / visual

No automated cross-browser or visual-regression suite is configured. Manual checks should be performed on:

| Engine | Target |
|---|---|
| Chromium | Chrome/Edge current |
| Gecko | Firefox current |
| WebKit | Safari current or Epiphany |
| Mobile | 320px–428px viewport |

## Known issues and limitations

1. **CSP uses `'unsafe-inline'`**. The policy works for the Inertia/Vite MVP, but it reduces XSS protection. Mark as high for a post-MVP hardening pass.
2. **No automated browser or visual regression tests**. Smoke tests are HTTP-level only.
3. **No Lighthouse baseline recorded**. The dev server and local build do not allow a clean Lighthouse run. Run a production deployment Lighthouse audit before release.
4. **No PHPStan/Psalm**. Static analysis beyond Pint is not enforced.
5. **`npm audit` was not completed** in this run because the command was slow and was killed. Re-run before release.
6. **Main JS chunk is at budget limit**. Monitor bundle growth; consider further code-splitting `lucide-react` or Inertia if the budget is exceeded.

## Release blockers

| # | Item | Severity | Status |
|---|---|---|---|
| 1 | Re-run `npm audit` and resolve any high/critical findings | High | Not done |
| 2 | Confirm `APP_DEBUG=false` and `APP_ENV=production` in production `.env` | High | Not done |
| 3 | Manual cross-browser check on Chrome, Firefox, Safari | Medium | Not done |
| 4 | Production Lighthouse run for `/` and `/tools/serp-preview` | Medium | Not done |
| 5 | Tighten CSP to nonces/hashes before handling PII or accounts | Low | Deferred |

## Recommendation

The MVP is technically complete and all automated gates pass. Resolve the `npm audit` and production-environment checks before any public release. The remaining items are documented as deferred or manual tasks.
