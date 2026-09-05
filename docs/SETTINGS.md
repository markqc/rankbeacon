# System Settings

Administrators can manage site-wide settings from `/admin/settings`.

## Groups

- **General** — site name, tagline, description, contact/support emails.
- **Branding** — primary color, logo and favicon uploads.
- **Social** — Facebook, Twitter/X, LinkedIn, Instagram, YouTube URLs.
- **Mail** — mode, host, port, credentials, from address/name, timeout.
  - `environment` uses existing `.env` mail configuration unchanged.
  - `local` routes mail to the log driver.
  - `smtp` overrides Laravel's `smtp` mailer with database values.
  - `smtp2go_api` uses SMTP2GO's SMTP submission endpoint with the API key as the password.
- **Analytics** — Google Tag ID.

## Security notes

- Sensitive values such as `mail_password` and `smtp2go_api_key` are encrypted at rest and only decrypted when read through `SettingsService`.
- Secret values are never returned to the React client; the UI shows a masked placeholder.
- Leaving a secret field blank while editing preserves the existing stored value.
- Values are cached with Laravel Cache; `SettingsService` flushes the relevant cache on update.
- Settings changes are logged to the activity log under the `settings` module.

## Test email

The settings page has a **Send test email** button that sends a message to the current admin. Success or failure is recorded in the activity log.

## Runtime configuration

`MailSettingsService` applies database-driven mail settings on each web request and at the start of each queue job via `ApplyMailSettings` middleware and a `Queue::before` listener. This lets web requests and queued workers use the selected mail mode without editing `.env`.

After changing mail settings, restart queue workers so new values take effect for long-running worker processes.
