<?php

namespace App\Console\Commands;

use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsSession;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('analytics:prune {--days= : Number of days to retain; defaults to config value} {--dry-run : Show count without deleting}')]
#[Description('Prune analytics data older than the configured retention period.')]
class AnalyticsPruneCommand extends Command
{
    public function handle(): int
    {
        $days = $this->option('days') ?? config('admin.analytics_retention_days', 90);
        $days = (int) $days;

        if ($days < 1) {
            $this->error('Retention days must be a positive integer.');

            return self::FAILURE;
        }

        $cutoff = now()->subDays($days);

        $sessionsQuery = AnalyticsSession::where('last_seen_at', '<', $cutoff);
        $statsQuery = AnalyticsDailyStat::where('date', '<', $cutoff->toDateString());

        $sessionCount = $sessionsQuery->count();
        $statCount = $statsQuery->count();

        if ($this->option('dry-run')) {
            $this->info("Would prune {$sessionCount} sessions (and their events) and {$statCount} daily stats older than {$days} days.");

            return self::SUCCESS;
        }

        $sessionsQuery->delete();
        $statsQuery->delete();

        $this->info("Pruned {$sessionCount} sessions and {$statCount} daily stats older than {$days} days.");

        return self::SUCCESS;
    }
}
