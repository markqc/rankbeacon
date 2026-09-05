# RankBeacon Backend Admin — Implementation Architecture

This document is the Phase 0 implementation plan for the private administration area described in `RANKBEACON-BACKEND-ADMIN-PHASED-AI-DEV-PROMPTS.md`. It is an audit and design document only; no migrations, packages, or feature code are introduced here.

## 1. Current repository snapshot

### Verified stack

| Component | Version |
|---|---|
| PHP | 8.3.28 |
| Composer | 2.7.7 |
| Laravel Framework | 13.30.1 |
| inertiajs/inertia-laravel | 3.3 |
| @inertiajs/react | 3.7.0 |
| React / React DOM | 19.2.8 |
| TypeScript | 6.0.3 |
| Tailwind CSS | 4.3.3 (CSS-first via `@tailwindcss/vite`) |
| Vite | 8.2.2 |
| PHPUnit | 12.5.34 |
| Vitest | 5.0.0 |
| Laravel Pint | 1.30.5 |
| ESLint / Prettier | 9.39.5 / 3.9.6 |

### Existing conventions confirmed

- **Routes**: declared in `routes/web.php`. Inertia pages use `Route::inertia(...)`. Public routes and API endpoints live alongside each other.
- **Controllers**: thin HTTP layer. The SERP Preview API controller uses dependency injection and returns typed JSON responses.
- **Domain modules**: `app/Domain/SeoTools` holds services, exceptions, contracts, and value objects for the public SERP tool.
- **Frontend pages**: `resources/js/pages/**/*.tsx`, resolved by `resources/js/app.tsx` through `import.meta.glob`.
- **Layouts**: `resources/js/layouts/MainLayout.tsx` wraps public pages.
- **Components**: `resources/js/components/*` — Button, TextInput, FormField, Card, Alert, Header, Footer, etc. `lucide-react` is the only icon library.
- **Styles**: Tailwind v4 with custom brand tokens in `resources/css/app.css` (`navy-950`, `teal-500`, `blue-600`, `pale-50`, etc.).
- **Tests**: PHPUnit under `tests/Feature` and `tests/Unit`; Vitest for frontend under `resources/js/**/*.test.tsx`.
- **Static analysis**: `vendor/bin/pint` (PHP), `npm run lint` (ESLint), `npm run typecheck` (tsc), `npm run format:check` (Prettier).
- **Queue/session/cache**: defaults are all `database` in `.env.example`.
- **Rate limiting**: `AppServiceProvider::boot()` defines the `serp-fetch` limiter.

### Authentication and users

- The project uses the default Laravel `web` guard with the `users` table.
- **No** auth starter kit (Breeze/Jetstream) is installed, and there are no existing login/logout/registration routes.
- The current `users` migration contains only `id`, `name`, `email` (unique), `email_verified_at`, `password`, `remember_token`, and timestamps.
- The `DatabaseSeeder` creates a single `Test User` via `User::factory()`.
- `HandleInertiaRequests` currently shares only `app` metadata; it does **not** share auth state or flash messages.

### Public tool to instrument

- `/tools/serp-preview` is rendered by `resources/js/pages/Tools/SerpPreview.tsx`.
- The fetch endpoint is `POST /api/v1/serp-preview/fetch`, throttled with the `serp-fetch` rate limiter.
- Client-side state and API calls live in `resources/js/features/serp-preview/`.

## 2. Proposed namespaces and module boundaries

All new admin code is grouped under an `Admin` domain so it stays isolated from the public SEO-tool modules.

| Responsibility | Namespace / Location |
|---|---|
| Admin HTTP controllers | `App\Http\Controllers\Admin\*` |
| Admin middleware | `App\Http\Middleware\Admin\*` |
| Admin domain services | `App\Domain\Admin\Services\*` |
| Admin domain actions | `App\Domain\Admin\Actions\*` |
| Admin Eloquent models | `App\Models\{Role, ActivityLog, Setting, AnalyticsSession, AnalyticsEvent, AnalyticsDailyStat}` |
| Admin policies | `App\Policies\{UserPolicy, ActivityLogPolicy, SettingPolicy}` |
| Mail provider abstraction | `App\Domain\Admin\Services\Mail\*` |
| Privacy helpers | `App\Domain\Admin\Services\Privacy\*` |
| Seeders | `Database\Seeders\Admin\*` |
| Frontend admin shell | `resources/js/layouts/AdminLayout.tsx` |
| Frontend admin pages | `resources/js/pages/Admin/**/*.tsx` |
| Frontend admin components | `resources/js/components/Admin/**/*.tsx` |
| Admin feature tests | `tests/Feature/Admin/**/*.php` |
| Admin unit tests | `tests/Unit/Admin/**/*.php` |

## 3. Authorization model

A lightweight role layer is used instead of installing a third-party permission package. It is designed so a package such as Spatie Permission can replace it later without changing controllers.

### Tables

- `roles` — `id`, `name` (unique), `label`, `timestamps`.
- `role_user` — `id`, `user_id` (indexed), `role_id` (indexed), `timestamps`.

### Initial role

- `super_admin` — unrestricted administration access.

### Gates (defined in `AppServiceProvider` or a new `AuthServiceProvider`)

| Gate | Capability |
|---|---|
| `admin.access` | View any admin screen. Granted to `super_admin`. |
| `admin.users.manage` | Create, edit, activate/deactivate, reset passwords, and delete users. |
| `admin.settings.manage` | View and update system/mail settings. |
| `admin.activity.view` | View the activity log. |
| `admin.analytics.view` | View analytics dashboards and reports. |

Initially all gates resolve to `user->hasRole('super_admin')`.

### Middleware

| Middleware | Purpose |
|---|---|
| `admin.guest` | Guest-only access to `/admin/login`. Redirects authenticated admins to `admin.dashboard`. |
| `admin.active` | Returns 403 if the authenticated user is inactive. |
| `admin.password-changed` | Redirects authenticated admins whose password is still temporary to `/admin/password/change`. |

### Route protection pattern

```php
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('admin.guest')->group(function () {
        Route::get('login', [Auth\LoginController::class, 'create'])->name('login');
        Route::post('login', [Auth\LoginController::class, 'store'])->name('login.store');
    });

    Route::middleware(['auth', 'admin.active', 'admin.password-changed', 'can:admin.access'])->group(function () {
        Route::get('/', fn () => redirect()->route('admin.dashboard'))->name('index');
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('analytics', AnalyticsController::class)->name('analytics');
        Route::resource('users', UserController::class);
        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('settings/test-email', [SettingsController::class, 'sendTestEmail'])->name('settings.test-email');
        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->name('activity-logs.show');
    });

    Route::middleware(['auth', 'admin.active', 'can:admin.access'])->group(function () {
        Route::get('password/change', [Auth\PasswordChangeController::class, 'edit'])->name('password.change.edit');
        Route::patch('password/change', [Auth\PasswordChangeController::class, 'update'])->name('password.change.update');
        Route::post('logout', [Auth\LogoutController::class, 'store'])->name('logout');
    });
});
```

All admin routes are registered **before** the existing `Route::fallback(...)`.

## 4. Data model

The following migrations are planned. They extend the existing `users` table and add new tables.

### `users` table additions

- `email_normalized` — lower-cased copy of `email`, unique, indexed.
- `status` — enum/string, default `active`; values `active`, `inactive`.
- `password_changed_at` — nullable timestamp. Null means the password is still temporary.
- `deleted_at` — nullable timestamp for soft deletes.

Backfill strategy in the migration: populate `email_normalized` from `LOWER(email)`.

### `roles` and `role_user`

See section 3.

### `settings`

| Field | Notes |
|---|---|
| `id` | big integer |
| `key` | unique string |
| `value` | text |
| `group` | string for UI grouping |
| `is_encrypted` | boolean; true for SMTP passwords and SMTP2GO API keys |
| `timestamps` | |

Non-secret values use plain text/casts. Secret values are encrypted with Laravel's encrypter when written and decrypted when read.

### `activity_logs`

| Field | Notes |
|---|---|
| `id` | big integer |
| `actor_id` | nullable foreign key to `users` (no hard FK cascade; audit trail must survive actor deletion) |
| `actor_name` | snapshot at event time |
| `actor_email` | snapshot at event time |
| `event` | string machine name, indexed |
| `description` | human-readable summary |
| `module` | string, indexed (`auth`, `users`, `settings`, `analytics`) |
| `subject_type` | nullable morph type |
| `subject_id` | nullable morph id |
| `method` | HTTP method |
| `url` | sanitized path/query |
| `ip_address` | privacy-masked (see section 8) |
| `user_agent` | short device/browser summary |
| `metadata` | JSON of sanitized old/new values or extra context |
| `request_id` | nullable request/correlation ID |
| `created_at` | timestamp, indexed |

Records are immutable through normal admin UI. No `updated_at`.

### `analytics_sessions`

| Field | Notes |
|---|---|
| `id` | big integer |
| `anonymous_id` | random token, indexed, unique |
| `first_seen_at` | timestamp |
| `last_seen_at` | timestamp |
| `entry_page` | sanitized path |
| `exit_page` | sanitized path |
| `device_category` | `desktop`, `mobile`, `tablet`, `unknown` |
| `browser_family` | string |
| `os_family` | string |
| `referrer_host` | host only |
| `source`, `medium`, `campaign` | UTM values |
| `country` | nullable, only if derivable without paid dependency |
| `is_bot` | boolean, indexed |
| `created_at` / `updated_at` | |

### `analytics_events`

| Field | Notes |
|---|---|
| `id` | big integer |
| `analytics_session_id` | foreign key to `analytics_sessions` |
| `event` | string, indexed; allow-listed names only |
| `path` | sanitized path |
| `host` | sanitized host |
| `properties` | JSON of non-sensitive values |
| `occurred_at` | timestamp, indexed |
| `dedup_hash` | string for idempotent writes, indexed |

### `analytics_daily_stats`

| Field | Notes |
|---|---|
| `id` | big integer |
| `date` | date |
| `metric` | string (`visitors`, `sessions`, `page_views`, `serp_uses`, ...) |
| `dimension` | nullable string (`page`, `device`, `browser`, `referrer`, ...) |
| `dimension_value` | nullable string |
| `value` | integer |
| unique composite | `date`, `metric`, `dimension`, `dimension_value` |

## 5. Route map

| URL | Method | Name | Middleware | Purpose |
|---|---|---|---|---|
| `/admin/login` | GET/POST | `admin.login` / `admin.login.store` | `admin.guest`, throttle `admin-login` | Login page |
| `/admin/logout` | POST | `admin.logout` | `auth` | Logout |
| `/admin/password/change` | GET/PATCH | `admin.password.change.edit` / `update` | `auth`, `admin.active`, `can:admin.access` | Force password change after seed |
| `/admin` | GET | `admin.index` | redirect | Redirect to dashboard |
| `/admin/dashboard` | GET | `admin.dashboard` | `auth`, `admin.active`, `admin.password-changed`, `can:admin.access` | Summary cards + trends |
| `/admin/analytics` | GET | `admin.analytics` | same + `can:admin.analytics.view` | Date-range analytics reports |
| `/admin/users` | GET | `admin.users.index` | `can:admin.users.manage` | Paginated user list |
| `/admin/users/create` | GET | `admin.users.create` | `can:admin.users.manage` | Create form |
| `/admin/users` | POST | `admin.users.store` | `can:admin.users.manage` | Store user |
| `/admin/users/{user}` | GET | `admin.users.show` | `can:admin.users.manage` | User detail + activity summary |
| `/admin/users/{user}/edit` | GET | `admin.users.edit` | `can:admin.users.manage` | Edit form |
| `/admin/users/{user}` | PATCH/PUT | `admin.users.update` | `can:admin.users.manage` | Update name/email |
| `/admin/users/{user}` | DELETE | `admin.users.destroy` | `can:admin.users.manage` | Soft delete |
| `/admin/users/{user}/activate` | PATCH | `admin.users.activate` | `can:admin.users.manage` | Activate account |
| `/admin/users/{user}/deactivate` | PATCH | `admin.users.deactivate` | `can:admin.users.manage` | Deactivate account |
| `/admin/users/{user}/role` | PATCH | `admin.users.role.update` | `can:admin.users.manage` | Change role |
| `/admin/users/{user}/reset-password` | POST | `admin.users.reset-password` | `can:admin.users.manage` | Generate temporary password |
| `/admin/settings` | GET/PATCH | `admin.settings.edit` / `update` | `can:admin.settings.manage` | System/mail settings |
| `/admin/settings/test-email` | POST | `admin.settings.test-email` | `can:admin.settings.manage`, throttle `test-email` | Test mail configuration |
| `/admin/activity-logs` | GET | `admin.activity-logs.index` | `can:admin.activity.view` | Paginated/filtered log |
| `/admin/activity-logs/{activityLog}` | GET | `admin.activity-logs.show` | `can:admin.activity.view` | Log detail drawer/modal |

Public analytics collection:

| URL | Method | Name | Middleware | Purpose |
|---|---|---|---|---|
| `/api/v1/analytics/events` | POST | `api.analytics.events` | `web`, throttle `analytics` | Record allow-listed events |
| `/api/v1/analytics/page-view` | POST | `api.analytics.page-view` | `web`, throttle `analytics` | Record page view/session heartbeat |

## 6. Proposed file structure by phase

### Phase 1 — Admin foundation, authorization, and navigation

- `app/Http/Controllers/Admin/DashboardController.php`
- `app/Http/Controllers/Admin/AnalyticsController.php`
- `app/Http/Controllers/Admin/UserController.php`
- `app/Http/Controllers/Admin/SettingsController.php`
- `app/Http/Controllers/Admin/ActivityLogController.php`
- `app/Http/Middleware/Admin/RequireAdmin.php` (or gate middleware)
- `app/Http/Middleware/Admin/ActiveAccount.php`
- `app/Http/Middleware/Admin/RedirectIfAuthenticatedAdmin.php`
- `app/Http/Middleware/Admin/EnsurePasswordChanged.php`
- `app/Models/Role.php`
- `database/migrations/2026_09_05_000001_create_roles_table.php`
- `database/migrations/2026_09_05_000002_create_role_user_table.php`
- `database/migrations/2026_09_05_000003_extend_users_table_for_admin.php`
- `resources/js/layouts/AdminLayout.tsx`
- `resources/js/components/Admin/AdminSidebar.tsx`
- `resources/js/components/Admin/AdminHeader.tsx`
- `resources/js/components/Admin/AdminNavItem.tsx`
- `resources/js/components/Admin/FlashMessages.tsx`
- `resources/js/pages/Admin/Dashboard.tsx`
- `resources/js/pages/Admin/Analytics.tsx`
- `resources/js/pages/Admin/Users/Index.tsx`
- `resources/js/pages/Admin/Settings/Edit.tsx`
- `resources/js/pages/Admin/ActivityLogs/Index.tsx`
- `resources/js/types/admin.ts`
- `tests/Feature/Admin/AuthorizationTest.php`
- `tests/Feature/Admin/NavigationTest.php`
- Update `routes/web.php`.
- Update `app/Http/Middleware/HandleInertiaRequests.php` to share safe auth user and flash.
- Update `bootstrap/app.php` to register admin middleware aliases.

### Phase 2 — Login, logout, and super-admin seeder

- `app/Http/Controllers/Admin/Auth/LoginController.php`
- `app/Http/Controllers/Admin/Auth/LogoutController.php`
- `app/Http/Controllers/Admin/Auth/PasswordChangeController.php`
- `app/Http/Requests/Admin/LoginRequest.php`
- `app/Http/Requests/Admin/PasswordChangeRequest.php`
- `database/seeders/Admin/SuperAdminSeeder.php`
- `resources/js/pages/Admin/Auth/Login.tsx`
- `resources/js/pages/Admin/Auth/PasswordChange.tsx`
- `resources/js/components/Admin/BrandPanel.tsx`
- `app/Domain/Admin/Services/ActivityLogger.php` (initial auth events)
- `tests/Feature/Admin/Auth/LoginTest.php`
- `tests/Feature/Admin/Auth/LogoutTest.php`
- `tests/Feature/Admin/Auth/PasswordChangeTest.php`
- `tests/Feature/Admin/Seeders/SuperAdminSeederTest.php`
- Add rate limiters `admin-login` and `password-change` in `AppServiceProvider`.

### Phase 3 — Central activity log infrastructure

- `app/Models/ActivityLog.php`
- `app/Domain/Admin/Services/ActivityLogger.php` (final)
- `app/Domain/Admin/Services/Privacy/SensitiveValueSanitizer.php`
- `database/migrations/2026_09_05_000004_create_activity_logs_table.php`
- `app/Http/Controllers/Admin/ActivityLogController.php`
- `app/Http/Resources/Admin/ActivityLogResource.php`
- `resources/js/pages/Admin/ActivityLogs/Index.tsx`
- `resources/js/pages/Admin/ActivityLogs/Show.tsx`
- `resources/js/components/Admin/ActivityLogFilters.tsx`
- `app/Console/Commands/ActivityLogPruneCommand.php`
- `tests/Feature/Admin/ActivityLogs/ActivityLogTest.php`
- `tests/Unit/Admin/Services/SensitiveValueSanitizerTest.php`
- `docs/ACTIVITY-LOGS.md`

### Phase 4 — First-party analytics collection

- `app/Models/AnalyticsSession.php`
- `app/Models/AnalyticsEvent.php`
- `app/Models/AnalyticsDailyStat.php`
- `database/migrations/2026_09_05_000005_create_analytics_sessions_table.php`
- `database/migrations/2026_09_05_000006_create_analytics_events_table.php`
- `database/migrations/2026_09_05_000007_create_analytics_daily_stats_table.php`
- `app/Domain/Analytics/Services/AnalyticsCollector.php`
- `app/Domain/Analytics/Services/SessionTracker.php`
- `app/Domain/Analytics/Services/BotDetector.php`
- `app/Domain/Analytics/Services/UrlSanitizer.php`
- `app/Domain/Analytics/Jobs/RecordAnalyticsEventJob.php`
- `app/Http/Controllers/Api/AnalyticsController.php`
- `app/Http/Requests/Api/AnalyticsEventRequest.php`
- `app/Http/Requests/Api/PageViewRequest.php`
- `resources/js/features/analytics/analytics.ts`
- `resources/js/features/analytics/useAnalytics.ts`
- Integrate calls into `resources/js/features/serp-preview/useSerpPreview.ts` and public pages via a shared hook.
- `app/Console/Commands/AnalyticsAggregateCommand.php`
- `app/Console/Commands/AnalyticsPruneCommand.php`
- `tests/Feature/Api/AnalyticsTest.php`
- `tests/Unit/Admin/Services/AnalyticsCollectorTest.php`
- `docs/ANALYTICS.md`

### Phase 5 — Analytics dashboard and reports

- Proposed charting dependency: **Recharts** (light React charting). This will be confirmed before installation because the project has no existing chart library.
- `resources/js/components/Admin/StatCard.tsx`
- `resources/js/components/Admin/DateRangePicker.tsx`
- `resources/js/components/Admin/LineChart.tsx` (Recharts wrapper)
- `resources/js/components/Admin/TopPagesTable.tsx`
- `app/Domain/Analytics/Services/AnalyticsAggregator.php`
- `app/Domain/Analytics/Services/AnalyticsReportService.php`
- Update `app/Http/Controllers/Admin/DashboardController.php`.
- Update `app/Http/Controllers/Admin/AnalyticsController.php`.
- Update `resources/js/pages/Admin/Dashboard.tsx`.
- Update `resources/js/pages/Admin/Analytics.tsx`.
- `tests/Feature/Admin/Analytics/DashboardTest.php`
- `tests/Feature/Admin/Analytics/AnalyticsReportTest.php`

### Phase 6 — System settings and branding

- `app/Models/Setting.php`
- `app/Domain/Admin/Services/SettingsService.php`
- `app/Domain/Admin/Services/Mail/MailSettingsService.php`
- `app/Domain/Admin/Services/Mail/Smtp2goApiTransport.php`
- `database/migrations/2026_09_05_000008_create_settings_table.php`
- `app/Http/Controllers/Admin/SettingsController.php`
- `app/Http/Requests/Admin/UpdateSettingsRequest.php`
- `app/Http/Requests/Admin/SendTestEmailRequest.php`
- `app/Http/Resources/Admin/SettingResource.php`
- `resources/js/pages/Admin/Settings/Edit.tsx`
- `resources/js/components/Admin/settings/GeneralSettingsForm.tsx`
- `resources/js/components/Admin/settings/MailSettingsForm.tsx`
- `tests/Feature/Admin/Settings/SettingsTest.php`
- `tests/Unit/Admin/Services/MailSettingsServiceTest.php`
- `docs/SYSTEM-SETTINGS.md`

### Phase 7 — User management

- `app/Http/Controllers/Admin/UserController.php` (full resource)
- `app/Http/Requests/Admin/StoreUserRequest.php`
- `app/Http/Requests/Admin/UpdateUserRequest.php`
- `app/Http/Requests/Admin/UpdateUserRoleRequest.php`
- `app/Policies/UserPolicy.php`
- `app/Domain/Admin/Services/UserService.php`
- `resources/js/pages/Admin/Users/Index.tsx`
- `resources/js/pages/Admin/Users/Create.tsx`
- `resources/js/pages/Admin/Users/Show.tsx`
- `resources/js/pages/Admin/Users/Edit.tsx`
- `resources/js/components/Admin/users/UserFilters.tsx`
- `resources/js/components/Admin/users/UserForm.tsx`
- `resources/js/components/Admin/users/ConfirmationDialog.tsx`
- `tests/Feature/Admin/Users/UserManagementTest.php`
- `tests/Unit/Admin/Policies/UserPolicyTest.php`
- `docs/USER-MANAGEMENT.md`

### Phase 8 — Full audit coverage

- Build the activity coverage matrix.
- Add integration tests for realistic end-to-end flows.
- Update `docs/ACTIVITY-LOGS.md`.

### Phase 9 — Security, privacy, performance, and accessibility hardening

- Update `docs/SECURITY.md`.
- Create/update `docs/PRIVACY-ANALYTICS.md`.
- Create/update `docs/QA-REPORT.md`.
- Add final hardening tests.

### Phase 10 — Deployment and operations documentation

- Update `README.md` with admin setup notes.
- Update `docs/DEPLOYMENT.md`.
- Update `docs/OPERATIONS.md`.
- Update `.env.example` with safe placeholders only.

### Phase 11 — Final acceptance audit

- Run full test matrix: PHPUnit, Vitest, Pint, ESLint, Prettier, tsc, `npm run build`.
- Produce final checklist with Pass/Fail/N/A and evidence.
- No Git operations.

## 7. Key design decisions

### Reuse over new dependencies

- No new backend packages unless required (e.g., chart library in Phase 5, SMTP2GO transport uses Laravel/Symfony Mailer already present).
- No second frontend framework or admin template. All admin pages reuse existing Button, Card, FormField, TextInput, Alert, etc.
- `lucide-react` remains the only icon library.

### Mail modes

Four explicit modes are implemented via `SettingsService`/`MailSettingsService`:

1. `environment` — no runtime override; Laravel uses `.env` mail config.
2. `local` — sets `mail.default` to `log` (or `array` in tests) via `config()`.
3. `smtp` — overrides `mail.default` to `smtp` and injects host/port/encryption/etc from `settings`.
4. `smtp2go_api` — overrides `mail.default` to a custom `smtp2go_api` mailer backed by `Smtp2goApiTransport`.

The provider is selected at runtime in a service provider boot or in `MailSettingsService::apply()`. It never writes to `.env`. Encrypted secrets are not returned to the client.

### Analytics privacy

- Visitor/session ID is a random UUIDv4 stored in a first-party, `SameSite=Lax`, `HttpOnly`, secure cookie. No fingerprinting.
- IP addresses are masked to `/24` for IPv4 and `/56` for IPv6 before storage (configurable).
- URLs store normalized host/path only; fragments and sensitive query parameters are stripped.
- UTM parameters are extracted into columns; raw query strings are not kept.
- Bot, admin, test, health-check, and excluded-environment traffic is dropped.
- Do Not Track and a configurable consent setting are respected.
- Retention: raw `analytics_events` and `analytics_sessions` retained for 90 days by default; daily aggregates are kept indefinitely.

### Secret redaction

`SensitiveValueSanitizer` redacts the following in activity-log metadata, validation errors, and exception context:

- `password`, `password_confirmation`, `current_password`
- `remember_token`, `csrf-token`, `_token`
- `cookie`, `authorization`, `api_key`, `apikey`, `secret`
- `smtp_password`, `smtp2go_api_key`
- Any other key configured in `config('admin.redacted_keys')`.

### User protection rules

- User ID `1` (Mark) is protected from accidental deletion and from being deactivated if it is the only active super admin.
- The last active super admin cannot be deactivated, deleted, or stripped of the `super_admin` role.
- A user can edit their own name/email, but cannot change their own role.
- Deactivated users are logged out on the next request and blocked from new admin requests.

## 8. Conflicts and compatibility notes

| Area | Current state | Proposed change | Mitigation |
|---|---|---|---|
| `users` table | Only basic columns. | Add `email_normalized`, `status`, `password_changed_at`, `deleted_at`. | Single migration with backfill; existing factory/seeder updated to populate normalized email. |
| Auth routes | None exist. | Add `/admin/login`, `/admin/logout`, etc. | No conflict; public routes unchanged. |
| `HandleInertiaRequests` | Shares `app` only. | Add safe `auth.user` and `flash`. | Only shares non-sensitive fields; password/hash excluded. |
| Rate limiters | Only `serp-fetch`. | Add `admin-login`, `analytics`, `test-email`. | Additive only. |
| `.env` / `.env.example` | Standard Laravel values. | Add safe placeholders for analytics retention, excluded environments, mail mode. | No real secrets; actual secrets stored encrypted in DB. |
| Mail configuration | Driven by `.env`. | Runtime override possible via settings. | Defaults to `.env` (`environment` mode); no `.env` mutation. |
| Frontend page discovery | `import.meta.glob` on `./pages/**/*.tsx`. | New admin pages are automatically discovered. | No Vite config change required. |
| Charting | None installed. | Propose Recharts in Phase 5. | Confirmed with report before install; fallback to data tables if declined. |
| Laravel Boost | Not installed; `AGENTS.md`/`CLAUDE.md` instructs installing before application changes. | Install as the first step of Phase 1. | Phase 0 does not install packages; documented as Phase 1 prerequisite. |

## 9. Baseline verification performed

- `php artisan --version` — Laravel 13.30.1
- `php artisan test` — **61 passed**
- `npm run test` — **51 passed**
- `npm run typecheck` — **pass**
- `npm run lint` — **pass**
- `vendor/bin/pint --test` — **pass**

No existing functionality is broken by this plan.

## 10. Next steps

1. Review and approve this architecture document.
2. Confirm the proposed charting library (Recharts) for Phase 5.
3. Before implementing Phase 1, install Laravel Boost per project rules:
   ```sh
   composer require laravel/boost --dev
   php artisan boost:install
   ```
   Then re-read `AGENTS.md` and continue with Phase 1.
4. Begin Phase 1: create migrations, middleware, admin shell, and protected routes.

No Git operations have been performed.
