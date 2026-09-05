<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('activity-log:prune {--days= : Number of days to retain; defaults to config value} {--dry-run : Show count without deleting}')]
#[Description('Prune activity logs older than the configured retention period.')]
class ActivityLogPruneCommand extends Command
{
    public function handle(): int
    {
        $days = $this->option('days') ?? config('admin.activity_log_retention_days', 365);
        $days = (int) $days;

        if ($days < 1) {
            $this->error('Retention days must be a positive integer.');

            return self::FAILURE;
        }

        $cutoff = now()->subDays($days);
        $query = ActivityLog::where('created_at', '<', $cutoff);
        $count = $query->count();

        if ($this->option('dry-run')) {
            $this->info("Would prune {$count} activity log records older than {$days} days.");

            return self::SUCCESS;
        }

        $query->delete();

        $this->info("Pruned {$count} activity log records older than {$days} days.");

        return self::SUCCESS;
    }
}
