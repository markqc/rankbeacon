# Security

This document records the security review for the RankBeacon admin backend.

## Authentication and authorization

- Admin access requires `super_admin` role and an active account.
- Passwords are hashed with Laravel's default `hashed` cast; temporary passwords force a password-change flow.
- Login and test-email endpoints are rate-limited per IP/user.
- Policies and gates prevent unauthorized user-management and settings changes.
- Deactivated accounts are blocked on each request and active sessions are invalidated safely.

## Input validation and mass assignment

- All admin mutations use Laravel Form Requests (`StoreUserRequest`, `UpdateUserRequest`, `UpdateSettingsRequest`, etc.).
- File uploads are validated by type, extension, dimensions, and size.
- `User` fillable fields exclude derived data such as `email_normalized`.

## Sensitive data

- SMTP passwords and SMTP2GO API keys are encrypted at rest via `SettingsService`.
- Secret fields are masked before being sent to React.
- `SensitiveValueSanitizer` redacts sensitive keys from activity-log metadata.
- No passwords, tokens, or mail credentials are logged or exposed in UI props.

## Output and transport

- React/Blade output escapes user data by default; no raw HTML is rendered from user input.
- CSRF protection is enforced for all state-changing admin and public forms.
- Analytics uses same-origin requests with CSRF validation and rate limiting.
- `SESSION_SECURE_COOKIE` should be set to `true` in production to ensure cookies are sent only over HTTPS.

## Production hardening

- Ensure `APP_ENV=production` and `APP_DEBUG=false` in production to disable debug output.
- Run `php artisan config:cache` and `php artisan route:cache` to apply environment-based security configuration.
- Restart queue workers after changing mail settings so workers pick up the current database-driven mail configuration.

## Ongoing review

- Activity logs and analytics retention commands run via `php artisan activity-log:prune` and `php artisan analytics:prune`.
- Review `docs/ACTIVITY-LOGS.md` for the admin action coverage matrix and audit trail scope.
