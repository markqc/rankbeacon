# Deployment

> **Status: not yet deployed.** This runbook is ready for production deployment. No production server, DNS, database, or SSL changes have been made without explicit authorization. Fill in the pre-flight table and deployment record before executing.

## Assumptions

- A PHP 8.3+ server with Composer, Node.js, and a web server (Nginx/Caddy/Apache).
- SSL/TLS certificate in place.
- A MySQL/MariaDB or PostgreSQL database for production.
- Redis or a database cache for sessions and cache.

## Initial production deployment

### 1. Prepare the server

```sh
ssh user@example.com
cd /var/www
git clone <repository-url> rankbeacon
cd rankbeacon
```

### 2. Install dependencies

```sh
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

> `npm ci` ensures a clean, reproducible install from `package-lock.json`.

### 3. Environment

```sh
cp .env.example .env
php artisan key:generate
```

Edit `.env` for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=rankbeacon
DB_USERNAME=rankbeacon
DB_PASSWORD=<strong-secret>
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### 4. Database

```sh
php artisan migrate --force
```

> `--force` is required in production. Downtime: minimal for new tables; migrations that alter large tables may lock briefly.

### 5. Optimize

```sh
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan storage:link
```

### 6. Web server

Point the document root to `public/`. Example Nginx:

```nginx
server {
    listen 443 ssl;
    server_name example.com;
    root /var/www/rankbeacon/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 7. Seed the super admin

Run the seeder to create the initial administrator:

```sh
php artisan db:seed --class=Database\\Seeders\\Admin\\SuperAdminSeeder
```

The seeder creates the `super_admin` role and the configured super-admin account (default email `mark@m-caneda.com`). If user ID `1` already exists with a different email, the seeder fails and requires manual cleanup before rerunning.

> After seeding, sign in at `/admin/login` and immediately replace the temporary password through the forced password-change flow.

### 8. Health check

```sh
curl -s https://example.com/health/live
curl -s https://example.com/health/ready
```

Both should return `200`.

## Admin-area operational notes

- Public storage is required for uploaded favicon and logo assets. Ensure `php artisan storage:link` has been run and `storage/app/public` is writable.
- Database-driven mail settings are applied on every web request and queue job. After changing mail settings, restart queue workers so long-running processes pick up the new configuration.
- The admin UI uses Inertia + React. Ensure `npm run build` has run and `public/build/` is deployed.
- Admin activity is logged to `activity_logs`; retention is controlled by `ADMIN_ACTIVITY_LOG_RETENTION_DAYS` (default: 365 days).
- Analytics data is retained for `ANALYTICS_RETENTION_DAYS` (default: 90 days).

## Repeat releases

```sh
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan cache:clear
```

## Pre-flight discovery

Before deployment, confirm and record the following. Do not proceed until all items are known.

| Item | Recorded value | Owner |
|---|---|---|
| Domain / subdomain | | |
| DNS A/AAAA / CNAME records | | |
| Linux distribution and version | | |
| Web server (Nginx, Caddy, Apache) and version | | |
| PHP-FPM version and required extensions | | |
| Composer version and path | | |
| Node.js and npm versions | | |
| MySQL / MariaDB version | | |
| SSH / deployment user | | |
| Application path on server | | |
| Current document root | | |
| File ownership model (user:group) | | |
| SSL issuer and renewal method | | |
| Reverse proxy / CDN | | |
| Firewall / outbound HTTP restrictions | | |
| Cron availability | | |
| Process supervisor (Supervisor / systemd) | | |
| Backup location and rollback release | | |

## Recommended deployment model

- Use versioned release directories plus a `current` symlink.
- Keep `.env`, `storage/`, and any persistent files outside the release directory and link them in.
- Point the web root only to `public/`.
- Build immutable frontend assets in CI or a controlled build environment.
- Use `composer install --no-dev --optimize-autoloader`.
- Use least-privilege ownership; never `chmod 777`.
- Enable HTTPS and add secure headers at the web-server or CDN layer without duplicating Laravel headers.
- Clear and re-cache Laravel caches after confirming `.env`.
- Run `php artisan migrate --force` only after a verified backup and migration review.
- Configure one cron for the scheduler if queues or scheduled tasks are used; no supervisor is needed for the current release because no queues are active.

## Release order

1. Confirm maintenance window and rollback owner.
2. Back up and validate that the backup exists.
3. Upload or check out the reviewed release.
4. Install production dependencies and build assets.
5. Link persistent files and the environment.
6. Put the app in maintenance mode only if required.
7. Run migrations and generate caches.
8. Switch the release atomically (e.g., update the `current` symlink).
9. Reload PHP-FPM and the web server safely.
10. Run health checks and smoke tests.
11. Exit maintenance mode.
12. Monitor errors, latency, disk, database, and URL-fetch failures.

## Extended post-deployment smoke tests

- [ ] HTTPS and canonical redirect to `https://example.com`.
- [ ] Homepage loads without mixed content or console errors.
- [ ] All main navigation links work (`/tools`, `/guides`, `/about`, `/privacy`, `/terms`).
- [ ] SERP manual preview renders and updates when typing.
- [ ] Safe public URL fetch returns metadata (`https://example.com/` or similar).
- [ ] Private/local URL fetch is rejected (`http://192.168.1.1/`).
- [ ] 404 page is friendly and returns `404`.
- [ ] `GET /sitemap.xml` returns valid XML.
- [ ] `GET /robots.txt` returns `Allow: /`.
- [ ] `<title>` and `<meta name="description">` are present per page.
- [ ] Favicon and other production assets load.
- [ ] `GET /health/live` and `GET /health/ready` return `200`.
- [ ] `storage/logs/laravel.log` is writable and does not expose stack traces to clients.
- [ ] `GET /admin/login` renders the split admin login page.
- [ ] Seeded super admin can log in and is redirected to `/admin/dashboard`.
- [ ] `/admin/dashboard`, `/admin/analytics`, `/admin/users`, `/admin/settings`, and `/admin/activity-logs` are accessible only to authenticated super admins.
- [ ] `/admin/settings` can save General, Branding, Mail, and Analytics values.
- [ ] A test email can be sent from `/admin/settings` and is recorded in the activity log.
- [ ] Admin page views appear once per navigation in `/admin/activity-logs`.
- [ ] Uploaded favicon is served correctly from `public/storage` and referenced in `<head>`.

## Deployment record

> This section is filled in after the deployment is authorized and completed. Do not pre-fill secrets.

| Field | Value |
|---|---|
| Date | |
| Release version / commit | |
| Operator | |
| Domain | |
| Server IP / host | |
| Web server reload command | |
| Migration result | |
| Smoke test result | |
| Known issues | |
| Rollback location / command | |

## Rollback rule

If any critical smoke test fails, stop traffic to the faulty release, switch back to the previous release, and follow `docs/ROLLBACK.md`. Do not blindly reverse a data migration; restore from backup when the migration is not safely reversible.

## Rollback

See `docs/ROLLBACK.md`.
