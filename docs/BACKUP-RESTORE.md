# Backup and Restore

## Assumptions

- Database is the primary state. File uploads are not a feature in the MVP.
- SQLite or MySQL/MariaDB is used.
- Backups are stored off-site (S3, object storage, or another server).

## What to back up

1. **Database** — required.
2. `.env` file — contains `APP_KEY` and secrets. Store in a secret manager, not with code.
3. `storage/` — logs and any user data; not strictly required for a minimal restore.
4. `public/build/` — can be regenerated with `npm run build`.

## SQLite backup

```sh
sqlite3 database/database.sqlite ".backup 'backup/rankbeacon-YYYY-MM-DD.sqlite'"
```

## MySQL/MariaDB backup

```sh
mysqldump -u rankbeacon -p rankbeacon > backup/rankbeacon-YYYY-MM-DD.sql
```

## Automated daily backup script (example)

```sh
#!/bin/bash
DATE=$(date +%F)
mysqldump -u rankbeacon -p'${DB_PASSWORD}' rankbeacon > /backups/rankbeacon-${DATE}.sql
gzip /backups/rankbeacon-${DATE}.sql
```

Store the `.gz` file off-site. Retain at least 7 daily and 4 weekly backups.

## Restore procedure

### SQLite

1. Stop the app or put it in maintenance mode.
2. Move/rename the current database for safety.
3. Copy the backup file to `database/database.sqlite`.
4. Ensure the web user can read and write it.
5. Restart the app.

```sh
php artisan down
mv database/database.sqlite database/database.sqlite.bak
cp backup/rankbeacon-YYYY-MM-DD.sqlite database/database.sqlite
php artisan up
```

### MySQL

1. Create a fresh database or drop existing tables.
2. Import the SQL dump.

```sh
mysql -u rankbeacon -p -e "DROP DATABASE rankbeacon; CREATE DATABASE rankbeacon;"
mysql -u rankbeacon -p rankbeacon < backup/rankbeacon-YYYY-MM-DD.sql
```

## Restore-test procedure

Monthly, restore to a non-production database and verify:

1. `php artisan migrate:status` shows expected migrations.
2. `php artisan test` passes against the restored database.
3. `GET /health/ready` returns `200`.

## Retention

| Backup type | Frequency | Retention |
|---|---|---|
| Database | Daily | 7 days |
| Database | Weekly | 4 weeks |
| Database | Monthly | 12 months |
