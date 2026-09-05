# Privacy and Analytics

This document describes how RankBeacon collects and protects visitor analytics.

## Collected data

- Anonymous session fingerprint (`analytics_sessions.fingerprint`), derived from the user-agent, session identifier, and app key.
- Device type (desktop / tablet / mobile) from the user-agent.
- Page path and event metadata for `page_view` and `tool_event` records.
- Timestamps for first/last seen and event creation.

## Excluded traffic

- Bots and crawlers are detected via `jaybizzle/crawler-detect`.
- Admin and API paths are excluded.
- Authenticated super admins are not tracked.
- Do Not Track (`DNT: 1`) and Global Privacy Control (`Sec-GPC: 1`) opt-outs are respected.
- Health checks, sitemaps, and system paths are ignored.

## Privacy safeguards

- IP addresses are not stored in `analytics_events` or `analytics_sessions`.
- Activity logs store anonymized IP addresses only for admin actions; IPv4 last octets and IPv6 last 8 bytes are masked.
- Cookies are used only to identify the session for analytics; no personal identifiers are stored.
- Analytics payloads are validated server-side and rate-limited to prevent abuse.
- The SERP Preview tool and public pages continue to function if analytics collection fails.

## Retention

- Raw analytics events and sessions are retained for the configured `ANALYTICS_RETENTION_DAYS` (default: 90 days).
- Aggregate daily stats are retained for the same period and can be pruned independently.
- Activity logs are retained for `ADMIN_ACTIVITY_LOG_RETENTION_DAYS` (default: 365 days).

## Commands

```sh
# Preview analytics cleanup
php artisan analytics:prune --days=90 --dry-run

# Delete analytics data older than the configured retention period
php artisan analytics:prune

# Preview activity-log cleanup
php artisan activity-log:prune --days=365 --dry-run

# Delete activity-log records older than the configured retention period
php artisan activity-log:prune
```

## Privacy policy disclosure

Visitors should be informed that RankBeacon uses first-party, privacy-conscious analytics to measure site and tool usage. No personally identifiable data or full IP addresses are stored.
