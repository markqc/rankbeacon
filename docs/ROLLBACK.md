# Rollback

## Application rollback

Use Git tags for each release.

```sh
git checkout <previous-release-tag>
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan cache:clear
php artisan view:clear
php artisan config:cache
php artisan view:cache
```

> Downtime: the duration of the deploy. For zero-downtime, keep two releases and switch the symlink or load-balancer target.

## Database rollback

### Safe: reverse a single migration

If the migration has a working `down()` method:

```sh
php artisan migrate:rollback --step=1
```

### Unsafe: restore from backup

If the migration cannot be reversed or data was lost:

1. Put the app in maintenance mode.
2. Restore the database from the most recent good backup (`docs/BACKUP-RESTORE.md`).
3. Re-run any migrations that should still be applied.
4. Bring the app back up.

```sh
php artisan down
# restore database
php artisan migrate
php artisan up
```

## Migrations that cannot be safely reversed

The current migrations use `sessions`, `cache`, and `jobs` tables with no data mutations. They can be rolled back safely. If you add migrations that transform user data, mark them in `docs/ROLLBACK.md` under `Irreversible migrations`.

## Rollback checklist

- [ ] Identify the last known-good tag
- [ ] Notify users if downtime is required
- [ ] Check out the tag or restore the database
- [ ] Run `php artisan test`
- [ ] Verify `/health/live` and `/health/ready`
- [ ] Verify `/tools/serp-preview` can fetch a known URL
