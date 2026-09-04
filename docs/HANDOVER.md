# Handover

## Release status

**MVP is ready for final review and deployment.**

All automated tests, lint, format, type, and build checks pass. The application is not deployed to a live server yet; `docs/DEPLOYMENT.md` is prepared and awaiting your pre-flight details.

## Release identifier

- **Version**: `1.0.0-MVP`
- **Date**: 2026-09-04
- **Repository**: `rankbeacon` (local working tree)
- **Commit**: No Git repository initialized locally. Initialize one and tag `v1.0.0-MVP` before deployment.

## Test and build results

| Check | Command | Result |
|---|---|---|
| PHP formatting | `vendor/bin/pint --test` | PASS (47 files) |
| PHPUnit | `php artisan test` | **61 passed** (127 assertions) |
| JS/TS formatting | `npm run format:check` | PASS |
| ESLint | `npm run lint` | PASS |
| TypeScript | `npm run typecheck` | PASS |
| Vitest | `npm run test` | **52 passed** |
| Vite build | `npm run build` | PASS |
| Composer audit | `composer audit` | No advisories |

## Deployment status

- **Deployed**: No
- **URL**: Not deployed
- **Status**: Ready to deploy using `docs/DEPLOYMENT.md` once server details are provided.

## Environment variable checklist

Required values before deployment (do not commit these):

- [ ] `APP_NAME=RankBeacon`
- [ ] `APP_ENV=production`
- [ ] `APP_KEY` (generate on server)
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL=https://<domain>`
- [ ] `DB_CONNECTION=mysql` or `pgsql`
- [ ] `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- [ ] `CACHE_STORE=redis`
- [ ] `SESSION_DRIVER=redis`
- [ ] `QUEUE_CONNECTION=redis`
- [ ] `MAIL_MAILER=log` or `smtp` if used
- [ ] `TRUSTED_PROXIES` if behind a CDN/load balancer

## Deployment and rollback

- Primary runbook: `docs/DEPLOYMENT.md`
- Backup and restore: `docs/BACKUP-RESTORE.md`
- Rollback: `docs/ROLLBACK.md`
- Operations: `docs/OPERATIONS.md`

## Known issues and accepted risks

1. **CSP uses `'unsafe-inline'`**. Allows the current Inertia/Vite setup and JSON-LD structured data to work without nonces. Acceptable for an MVP without accounts or PII; tighten before introducing either.
2. **No SSR**. Search engines and social crawlers that do not execute JavaScript may not see dynamic `<title>` and `<meta>` tags. Consider Inertia SSR for a future release.
3. **No automated cross-browser or visual regression suite**. Manual browser checks should be done before and after deployment.
4. **No `npm audit` report in Phase 8**. Re-run `npm audit` before release.
5. **Main JS bundle at ~100 kB gzipped**. Within budget but close to the limit; monitor growth.
6. **Privacy and Terms pages are pre-launch drafts**. Both are flagged with `Legal review needed` alerts and must be reviewed by a legal professional before public use.
7. **No Git history**. Initialize a repository and push to a remote before production deployment.

## Maintenance schedule

| Task | Frequency | Reference |
|---|---|---|
| Run tests | Every release | `php artisan test` / `npm run test` |
| Review logs | Daily | `docs/OPERATIONS.md` |
| Update dependencies | Monthly | `composer update`, `npm update` |
| Run `composer audit` | Monthly | `docs/SECURITY.md` |
| Run `npm audit` | Monthly | `docs/SECURITY.md` |
| Backup database | Daily | `docs/BACKUP-RESTORE.md` |
| Test restore | Monthly | `docs/BACKUP-RESTORE.md` |

## Handover package contents

- `README.md` — quick start and documentation index
- `docs/STACK.md` — exact versions and major decisions
- `docs/ARCHITECTURE.md` — request flow and folder responsibilities
- `docs/ENVIRONMENT.md` — environment variables
- `docs/LOCAL-SETUP.md` — local setup
- `docs/DEPLOYMENT.md` — production deployment runbook
- `docs/OPERATIONS.md` — day-to-day operations
- `docs/BACKUP-RESTORE.md` — backup and restore
- `docs/ROLLBACK.md` — rollback strategy
- `docs/TROUBLESHOOTING.md` — common issues
- `docs/SECURITY.md` — threat model, controls, headers
- `docs/QA-REPORT.md` — Phase 8 QA results
- `docs/BACKLOG.md` — post-MVP backlog
- `CHANGELOG.md` — release notes
- `SECURITY.md` — top-level security policy

## Exact next action for Mark

1. Review `docs/HANDOVER.md`, `docs/DEPLOYMENT.md`, and `docs/QA-REPORT.md`.
2. If you approve the release, provide the server and DNS details from the pre-flight table in `docs/DEPLOYMENT.md` or authorize me to proceed with the live deployment.
3. If you do not want to deploy immediately, initialize a Git repository, commit the code, and tag `v1.0.0-MVP` for safekeeping.
