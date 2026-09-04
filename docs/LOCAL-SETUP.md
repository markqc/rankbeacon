# Local Setup

This guide was validated against the current repository on macOS with PHP 8.3, Composer, and Node.js 24.

## Prerequisites

- PHP 8.3+
- Composer 2.7+
- Node.js 24+
- npm 11+
- SQLite (or MySQL if you want a non-default local DB)

## Clone and install

```sh
git clone <repository-url> rankbeacon
cd rankbeacon
composer install
npm install
```

## Environment

```sh
cp .env.example .env
php artisan key:generate
```

Open `.env` and confirm:

```env
APP_NAME=RankBeacon
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

## Database

For SQLite:

```sh
touch database/database.sqlite
php artisan migrate
```

For MySQL:

1. Create `rankbeacon` database and user.
2. Set `DB_CONNECTION=mysql` and fill `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
3. Run `php artisan migrate`.

Expected output: `INFO  Preparing database.` followed by `INFO  Running migrations.` and `DONE`.

## Build assets

```sh
npm run build
```

Expected: `public/build/manifest.json` is created and the command exits `0`.

## Development servers

Two terminals:

```sh
npm run dev   # Vite dev server on http://localhost:5173
```

```sh
php artisan serve --host=127.0.0.1 --port=8000
```

Visit `http://127.0.0.1:8000`.

## Verification

```sh
php artisan test
npm run test
vendor/bin/pint
npm run lint
npm run typecheck
```

All should pass.

## Troubleshooting

- `SQLSTATE[HY000] [14] unable to open database file` — create `database/database.sqlite` and ensure the web user can write to `database/`.
- `Vite manifest not found` — run `npm run build` or `npm run dev`.
- `CSRF token mismatch` on API calls — ensure the session cookie is set and `X-CSRF-TOKEN` header is sent.
- `npm run dev` shows a different host — set `APP_URL` to match or use `php artisan serve` to proxy.
