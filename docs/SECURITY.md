# Security Documentation

## Threat model

The URL Metadata API fetches arbitrary user-supplied URLs. The primary risks are:

1. **Server-Side Request Forgery (SSRF)** — an attacker tries to make the server connect to internal services, cloud metadata endpoints, or the loopback interface.
2. **DNS rebinding** — an attacker controls a hostname whose DNS record flips from public to private between validation and the actual HTTP request.
3. **Denial of service** — an attacker supplies huge pages, compression bombs, slow servers, or redirect chains that exhaust resources.
4. **Information disclosure** — internal IP addresses, stack traces, or user cookies leak through errors or logs.

## Controls

### URL validation

- Only `http` and `https` schemes are accepted.
- Embedded credentials (`user:pass@host`) are rejected.
- Hosts are validated as either valid IP addresses or valid hostnames.
- Internationalized domains are converted to ASCII Punycode with `idn_to_ascii` when the `intl` extension is available.
- Decimal, hex, dotted-hex, octal, and otherwise ambiguous IP representations are rejected before DNS lookup.

### IP validation

- IPv4 and IPv6 literals are checked against private, loopback, link-local, multicast, reserved, unspecified, CGNAT, 6to4 anycast relay, documentation, and cloud metadata ranges.
- IPv4-mapped IPv6 addresses and well-known NAT64 prefixes are treated as private.
- IP validation uses `filter_var` plus explicit CIDR checks via Symfony `IpUtils`.

### DNS and connection pinning

- Domain names are resolved to A/AAAA records and at least one public IP is required.
- For each HTTP request, the resolved IP is pinned with `CURLOPT_RESOLVE` so the connection target cannot change after DNS validation.
- Redirects are followed manually: each destination is re-validated and re-pinned before a new request is made.
- IP literals skip DNS entirely, so they cannot be used for DNS rebinding.

### Request limits

- Maximum 5 redirects per fetch.
- 5-second connect timeout and 15-second total timeout.
- Maximum body size of 2,000,000 bytes (Guzzle response handling and a secondary length check).
- TLS certificate verification is enabled.
- Only `text/html` and `application/xhtml+xml` responses are accepted.
- No user cookies, authorization headers, or arbitrary client headers are forwarded.

### Response handling

- The response is parsed with `DOMDocument` and no JavaScript is executed.
- Relative URLs (canonicals, favicons) are resolved against the final URL with PSR-7 URI resolution.
- Parsed text values are normalized and whitespace-collapsed.

### Error and log handling

- All network errors are mapped to stable, safe error codes. Stack traces and internal IPs are never returned to clients.
- Logs contain only the scheme, host, and path of the requested URL. Query strings are intentionally excluded.
- Error responses are not cached.

## Limitations

- The secondary body-length check catches decompressed oversized bodies, but it still relies on Guzzle's decompression behavior. Compression bombs may briefly consume memory during transport.
- `CURLOPT_RESOLVE` is cURL-specific. If the application is ever deployed with a non-cURL HTTP handler, the DNS-pinning assumption must be re-verified.
- IPv6 literal URLs in `CURLOPT_RESOLVE` are handled as unbracketed IP targets; this should be manually verified on the target platform.
- The parser does not execute JavaScript, so metadata injected by client-side frameworks may be missed.
- JSON-LD extraction is best-effort and looks for `WebSite`, `Organization`, and `Brand` `name` properties.

## Configuration

- Rate limit: `RateLimiter::for('serp-fetch', ...)` in `app/Providers/AppServiceProvider.php`.
- Timeouts, redirect limit, and body-size limit: constructor defaults in `app/Domain/SeoTools/Services/UrlMetadataFetcher.php`.
- DNS resolution implementation: `DnsResolverInterface` bound to `PublicDnsResolver` in `app/Providers/AppServiceProvider.php`.

## HTTP security headers

`app/Http/Middleware/SecurityHeadersMiddleware.php` sets the following on every web response:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `X-XSS-Protection: 0`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; ...`
- `Strict-Transport-Security` in production only.

The current CSP allows `'unsafe-inline'` for scripts and styles so that the Inertia JSON-LD structured data and Vite-injected assets work without nonces in the MVP. This should be tightened to a nonce or hash policy before handling sensitive data.

## Reporting and maintenance

- **Security contact**: For vulnerabilities or concerns, contact the operator at the project's support address. Do not open public issues for security-sensitive bugs.
- **Dependency updates**: Run `composer audit` and `npm audit` before each release. Critical or high advisories should be resolved before production deployment.
- **Secrets hygiene**: Never commit `.env`, keys, or tokens to the repository. Rotate any secret that is accidentally exposed.
- **Production checklist**: Set `APP_DEBUG=false`, `APP_ENV=production`, and configure a central log aggregator. Ensure the CSP and HSTS headers are reviewed for the target deployment.

## Testing

Security tests are in:

- `tests/Unit/Domain/SeoTools/Services/IpValidatorTest.php`
- `tests/Unit/Domain/SeoTools/Services/UrlSecurityValidatorTest.php`
- `tests/Feature/Api/SerpPreviewControllerTest.php`
- `tests/Feature/SmokeTest.php`

These cover public and private IPv4/IPv6 addresses, decimal/hex/octal host tricks, credentials in URLs, redirects to private targets, unsupported content types, oversized responses, malformed HTML, rate limiting, and security headers. All outbound network calls are faked in the test suite.
