# Security Policy

## Supported versions

Only the latest commit on the active development branch is supported. Pre-release and MVP versions are not covered by a long-term support policy.

## Reporting a vulnerability

If you discover a security issue, please contact the operator directly instead of opening a public issue. Include enough detail to reproduce the problem and any suggested remediation.

## Security controls

The application implements the following defensive measures:

- **SSRF prevention**: URL validation, IP validation, DNS resolution, and `CURLOPT_RESOLVE` pinning for outbound fetches.
- **CSRF protection**: Laravel CSRF tokens for all state-changing web routes.
- **Rate limiting**: `30 requests/minute` per IP for the SERP fetch endpoint.
- **Input validation**: Strict URL parsing, rejection of private/reserved IPs, embedded credentials, and non-HTTP schemes.
- **Output escaping**: React escapes user content; no raw HTML is injected from user input.
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS in production.
- **Safe logging**: Logs contain only scheme, host, and path. Query strings and stack traces are not exposed to clients.

For full details, see `docs/SECURITY.md`.

## Dependency and secret hygiene

- Run `composer audit` and `npm audit` before each release.
- Never commit `.env`, API keys, or certificates.
- Deploy with `APP_DEBUG=false` and `APP_ENV=production`.

## Known limitations

- The CSP currently allows `'unsafe-inline'` for scripts and styles. This is a deliberate MVP trade-off to support Inertia/Vite without nonces. Tighten this before handling sensitive data or user accounts.
- `CURLOPT_RESOLVE` is cURL-specific. Verify DNS pinning if you deploy with a non-cURL HTTP handler.
- The parser does not execute JavaScript, so client-rendered metadata may be missed.
