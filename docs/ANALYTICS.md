# Public Analytics

RankBeacon collects privacy-preserving analytics for the public site so administrators can understand traffic, device usage, and SERP Preview tool engagement.

## What is collected

- Page views on public pages.
- SERP Preview fetches.
- Anonymous session identifier (a one-way hash of the Laravel session ID).
- Device type (desktop, mobile, tablet) derived from the user agent.
- No IP addresses are stored and no personal data is collected.

## What is excluded

The following traffic is intentionally not recorded:

- Known search-engine and bot crawlers (via `jaybizzle/crawler-detect`).
- Authenticated admin users.
- Admin, authentication, health, and asset paths.

## Client-side tracking

Public pages automatically report page views to `/api/analytics/event` after each full-page or Inertia navigation. The tracking request is fire-and-forget: a failure never blocks the UI.

## Retention

Analytics data is retained for `ANALYTICS_RETENTION_DAYS` (default 90 days).

```sh
# Preview what would be deleted
php artisan analytics:prune --days=90 --dry-run

# Delete sessions, events, and daily stats older than 90 days
php artisan analytics:prune
```

## Dashboard

Super admins can view trends on `/admin/dashboard`:

- Page views and unique sessions over the last 30 days.
- Device breakdown.
- Top pages.
- SERP Preview fetches over time.
