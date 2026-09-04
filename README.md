# RankBeacon

RankBeacon is a modular SEO tools platform by **Authority Lighthouse**. The first public tool is the **Google SERP Preview**, which lets you fetch live page metadata or edit titles and descriptions manually to compare desktop and mobile search snippets.

![Screenshot placeholder](docs/screenshots/.gitkeep)

> Screenshots of the SERP Preview and homepage should be saved in `docs/screenshots/` once the public deployment is live.

## Stack

- **Backend**: Laravel 13, PHP 8.3+
- **Frontend**: React 19, TypeScript, Inertia.js, Tailwind CSS 4, Vite
- **Testing**: PHPUnit, Vitest, Testing Library
- **Tooling**: Composer, npm, Laravel Pint, ESLint, Prettier

For exact versions and decisions, see `docs/STACK.md`.

## Quick start

```sh
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
php artisan serve
```

Visit `http://127.0.0.1:8000`.

## Development

In separate terminals:

```sh
npm run dev       # Vite dev server
php artisan serve # Laravel server
```

## Tests and quality

```sh
php artisan test        # PHPUnit
npm run test            # Vitest
vendor/bin/pint         # PHP formatting
npm run lint            # ESLint
npm run format          # Prettier
npm run typecheck       # TypeScript
npm run build           # Production build
```

## Health and smoke

- `GET /up` — Laravel default up check
- `GET /health/live` — liveness
- `GET /health/ready` — database connectivity
- `GET /robots.txt` and `GET /sitemap.xml` — SEO files

## Documentation

- `docs/STACK.md` — exact versions and major decisions
- `docs/ARCHITECTURE.md` — request flow and folder responsibilities
- `docs/ENVIRONMENT.md` — environment variables, sensitivity, and examples
- `docs/LOCAL-SETUP.md` — fresh local setup
- `docs/DEPLOYMENT.md` — production deployment and releases
- `docs/OPERATIONS.md` — day-to-day operations
- `docs/BACKUP-RESTORE.md` — backup and restore
- `docs/ROLLBACK.md` — rollback strategy
- `docs/TROUBLESHOOTING.md` — common issues
- `docs/SECURITY.md` — threat model and controls
- `docs/QA-REPORT.md` — Phase 8 QA results and release blockers
- `docs/HANDOVER.md` — final release status and next steps
- `docs/BACKLOG.md` — post-MVP backlog
- `CHANGELOG.md` — release history

## Ownership

RankBeacon is developed by **MCaneda.com** under the **Authority Lighthouse** brand.
