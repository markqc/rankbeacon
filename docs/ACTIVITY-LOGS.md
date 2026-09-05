# Activity Logs

The activity log records security-relevant and operational events inside the RankBeacon admin area.

## What is logged

| Module  | Events |
| ------- | ------ |
| auth    | `login`, `failed_login`, `logout`, `password_changed` |
| admin   | `page_view`, `denied` |
| users   | `user_created`, `user_updated`, `user_role_changed`, `user_activated`, `user_deactivated`, `user_password_reset`, `user_deleted` |
| settings| `setting_changed`, `mail_test` |
| analytics| `analytics_configuration_changed`, `analytics_data_purge`, `analytics_data_export` |

Page views are logged once per full page navigation. Subsequent Inertia navigation requests do not create duplicate entries.

## Admin action coverage

| Page / Action | Module | Event(s) | Notes |
| ------------ | ------ | -------- | ----- |
| Admin login | `auth` | `login`, `failed_login` | Failed attempts log email but never passwords. |
| Admin logout | `auth` | `logout` | Logged from authenticated logout controller. |
| Change temporary password | `auth` | `password_changed` | Logged after successful password change. |
| Any admin page view | `admin` | `page_view` | Logged once per full (non-Inertia) GET request. |
| Unauthorized admin attempt | `admin` | `denied` | Logged by authorization paths when needed. |
| Create user | `users` | `user_created` | Records assigned role IDs and status. |
| Update user | `users` | `user_updated`, `user_role_changed` | Fired when fields or roles change. |
| Toggle user status | `users` | `user_activated`, `user_deactivated` | Fired from the toggle-status action. |
| Reset user password | `users` | `user_password_reset` | No password values are logged. |
| Delete user | `users` | `user_deleted` | Soft-delete only. |
| Save settings | `settings` | `setting_changed` | Records changed keys only, never secret values. |
| Send test email | `settings` | `mail_test` | Records success/failure; no credentials. |
| Analytics configuration changes | `analytics` | `analytics_configuration_changed` | Reserved for analytics settings. |
| Analytics purge/export | `analytics` | `analytics_data_purge`, `analytics_data_export` | Reserved for future tooling. |

## Privacy and security

- IP addresses are masked (IPv4 last octet removed, IPv6 last 8 bytes zeroed).
- Sensitive metadata keys are redacted using `SensitiveValueSanitizer`.
- Raw passwords, tokens, CSRF values, and mail credentials are never stored in `metadata`.
- Actor name and email are captured at event time so renaming a user does not rewrite history.
- Activity logs are immutable; there are no update or delete routes.

## Storage and retention

Retention is configured with `ADMIN_ACTIVITY_LOG_RETENTION_DAYS` and defaults to 365 days.

```sh
# Preview what would be deleted
php artisan activity-log:prune --days=365 --dry-run

# Delete records older than 365 days
php artisan activity-log:prune
```

## Viewing logs

Visit `/admin/activity-logs` as a super admin. The page supports:

- Keyword search across event, description, actor, URL, and module.
- Filters for module, event, HTTP method, actor ID, and date range.
- Pagination (20 records per page).
- A slide-out detail panel for event metadata.
