# API Documentation

## Versioning

The SERP Preview API is versioned in the URL path. The current version is `v1`.

## Endpoint

### `POST /api/v1/serp-preview/fetch`

Fetches and parses public page metadata for the SERP preview tool. This endpoint is rate-limited and protected by the same CSRF controls as the rest of the Inertia application.

#### Request

| Field | Type | Required | Notes |
|---|---|---|---|
| `url` | string | yes | Must be `http` or `https`, no embedded credentials, max 2048 characters. |

#### Example response (200 OK)

```json
{
    "data": {
        "normalized_url": "https://example.com/",
        "final_url": "https://example.com/",
        "site_name": "Example",
        "title": "Example Domain",
        "description": "Illustrative example page.",
        "canonical_url": "https://example.com/",
        "favicon_url": "https://example.com/favicon.ico",
        "robots": "index, follow",
        "language": "en",
        "og_title": null,
        "og_description": null,
        "og_site_name": null,
        "breadcrumb_path": null,
        "status": 200,
        "warnings": [],
        "fetched_at": "2026-01-12T10:00:00+00:00"
    },
    "meta": {
        "version": "v1",
        "fetched_at": "2026-01-12T10:00:00+00:00"
    }
}
```

#### Error response shape

```json
{
    "error": {
        "code": "PRIVATE_IP",
        "message": "URL resolves to a private or restricted network."
    }
}
```

| HTTP Status | Error Code | Meaning |
|---|---|---|
| 400 | `MISSING_URL` | No URL was supplied. |
| 400 | `URL_TOO_LONG` | URL exceeds 2048 characters. |
| 400 | `MALFORMED_URL` | URL cannot be parsed. |
| 400 | `UNSUPPORTED_SCHEME` | Scheme is not `http` or `https`. |
| 400 | `CREDENTIALS_IN_URL` | URL contains `user:pass@`. |
| 400 | `INVALID_HOST` | Host is not a valid IP or hostname. |
| 400 | `AMBIGUOUS_HOST` | Host looks like a decimal, hex, or octal IP bypass attempt. |
| 400 | `DNS_FAILED` | Host could not be resolved. |
| 400 | `PRIVATE_IP` | Target is a private/reserved IP or resolves to one. |
| 400 | `IDN_FAILED` / `IDN_NOT_SUPPORTED` | Internationalized domain conversion failed. |
| 422 | `INVALID_URL` | Validation failed (the `url` field is missing or not a string). |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded. |
| 502 | `FETCH_FAILED` | Network or transport error. |
| 502 | `TOO_MANY_REDIRECTS` | Redirect limit exceeded. |
| 502 | `INVALID_REDIRECT` | A redirect location could not be resolved. |
| 502 | `UNSUPPORTED_CONTENT_TYPE` | Response is not `text/html` or `application/xhtml+xml`. |
| 502 | `RESPONSE_TOO_LARGE` | Body exceeds the configured maximum. |

#### Metadata fallback order

The parser uses this explicit fallback order for key fields:

- **Title:** `<title>` tag.
- **Description:** `<meta name="description">` content.
- **Site name:** `og:site_name` → JSON-LD `WebSite`/`Organization`/`Brand` `name` → final URL host.
- **Canonical URL:** `<link rel="canonical">` href (resolved against the final URL).
- **Favicon:** First `<link>` with `rel` containing `icon` or `shortcut` (resolved against the final URL) → `/favicon.ico` resolved against the final URL.
- **Language:** `<html lang>` attribute.
- **Breadcrumb / path:** Path component of the canonical URL, or the final URL if no canonical is found.

#### Rate limiting

The endpoint uses the `serp-fetch` rate limiter, currently configured at 30 requests per minute per IP in `app/Providers/AppServiceProvider.php`.

#### Caching

Successful normalized URLs are cached for 5 minutes using the default cache store. Unsafe and error responses are not cached.

#### CSRF

Because this route lives in the `web.php` middleware group, requests must include a valid `X-CSRF-TOKEN` header or `_token` form value.

## Frontend integration

The React component at `resources/js/features/serp-preview/api.ts` calls this endpoint with the CSRF token from the `meta[name="csrf-token"]` tag. It supports an `AbortController` for cancellation and applies a 20-second client timeout. The UI maps response codes and `error.code` values to user-facing states and warnings.

## Operational logging

Failed and unsafe fetch attempts are logged with sanitized identifiers. Query strings are not included in logs. Production deployments should route these to a central log aggregator and configure alerting on repeated `PRIVATE_IP`, `AMBIGUOUS_HOST`, or `TOO_MANY_REDIRECTS` attempts.
