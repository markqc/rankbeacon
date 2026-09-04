# Troubleshooting

## 500 / white page

1. Check `storage/logs/laravel.log` for the stack trace.
2. Confirm `APP_DEBUG=false` in production. Debug mode can leak stack traces.
3. Run `php artisan config:clear` and `php artisan view:clear`.
4. Run `php artisan optimize:clear` as a last resort.

## Vite manifest not found

```
Unable to locate file in Vite manifest: resources/js/app.tsx
```

Run:

```sh
npm run build
```

If `public/hot` exists from a previous `npm run dev`, delete it.

## 404 for all Inertia pages

- Ensure `mod_rewrite` or equivalent is enabled.
- Verify the web root points to `public/`.
- Check `routes/web.php` for the route.

## Database errors

```
SQLSTATE[HY000] [14] unable to open database file
```

For SQLite:

```sh
touch database/database.sqlite
php artisan migrate
chmod 664 database/database.sqlite
```

For MySQL:

- Verify `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
- Ensure the user can connect and the database exists.

## CSRF / 419 errors on API

- Include the `X-CSRF-TOKEN` header or `_token` form value.
- Ensure the session cookie is set and not expired.
- Run `php artisan session:table` and migrate if using `database` sessions.

## TLS / HTTPS

- Ensure `APP_URL` uses `https://`.
- The `Strict-Transport-Security` header is only set in `production`.
- If behind a load balancer, set `TrustProxies` middleware.

## Timeouts on fetch

- `CURLOPT_RESOLVE` and `CURLOPT_TIMEOUT` were removed in favor of Guzzle's `timeout(15)` and `connectTimeout(5)`.
- Large pages are rejected at 2,000,000 bytes.
- Slow servers may exceed the 15-second timeout; this is by design.

## DNS failures

- The `PublicDnsResolver` uses `dns_get_record` with `gethostbynamel` and `gethostbyname` fallbacks.
- Some resolvers do not return A/AAAA records; the fallback usually resolves the host.
- If a host is genuinely unresolvable, the API returns `DNS_FAILED`.

## Cache issues

- `php artisan cache:clear` clears the cache.
- SERP fetch results are cached for 5 minutes; clear the cache to force a fresh fetch.

## Proxy issues

If running behind a reverse proxy:

1. Add the proxy IP to `TrustProxies` middleware.
2. Set `TrustHeaders::HEADERS` if the proxy forwards `X-Forwarded-Proto`.
3. Ensure `APP_URL` matches the public URL.

## Permissions

- `storage/` and `bootstrap/cache/` must be writable by the web server.
- `public/` must be readable.
- `database/database.sqlite` must be writable when using SQLite.

## Logs not visible

- Default log channel is `stack`.
- Check `storage/logs/laravel.log`.
- In containers, redirect logs to `stderr` or a log shipper.
