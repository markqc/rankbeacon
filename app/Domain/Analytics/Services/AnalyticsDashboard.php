<?php

namespace App\Domain\Analytics\Services;

use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsDashboard
{
    /**
     * Build dashboard statistics for the last 30 days.
     *
     * @return array<string, mixed>
     */
    public function stats(): array
    {
        $start = now()->subDays(29)->startOfDay();
        $end = now()->endOfDay();

        return [
            'summary' => $this->summary($start, $end),
            'visits' => $this->visitsOverTime($start, $end),
            'devices' => $this->deviceBreakdown($start, $end),
            'topPages' => $this->topPages($start, $end),
            'serpFetches' => $this->serpFetchesOverTime($start, $end),
        ];
    }

    private function summary(Carbon $start, Carbon $end): array
    {
        return [
            'page_views' => AnalyticsEvent::where('event_type', 'page_view')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            'unique_sessions' => AnalyticsSession::whereBetween('last_seen_at', [$start, $end])
                ->count(),
            'serp_fetches' => AnalyticsEvent::where('event_type', 'tool_event')
                ->where('tool_name', 'serp-preview')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
        ];
    }

    /**
     * @return Collection<int, array{date: string, views: int}>
     */
    private function visitsOverTime(Carbon $start, Carbon $end): Collection
    {
        $rows = AnalyticsDailyStat::where('metric', 'page_views')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date')
            ->pluck('value', 'date');

        return $this->dateRange($start, $end)->map(function (string $date) use ($rows) {
            return [
                'date' => $date,
                'views' => (int) ($rows[$date] ?? 0),
            ];
        });
    }

    /**
     * @return Collection<int, array{device: string, sessions: int}>
     */
    private function deviceBreakdown(Carbon $start, Carbon $end): Collection
    {
        return AnalyticsSession::select('device_type', DB::raw('count(*) as sessions'))
            ->whereBetween('last_seen_at', [$start, $end])
            ->groupBy('device_type')
            ->orderByDesc('sessions')
            ->get()
            ->map(fn ($row) => [
                'device' => $row->device_type,
                'sessions' => (int) $row->sessions,
            ]);
    }

    /**
     * @return Collection<int, array{path: string, views: int}>
     */
    private function topPages(Carbon $start, Carbon $end): Collection
    {
        return AnalyticsEvent::select('page_path', DB::raw('count(*) as views'))
            ->where('event_type', 'page_view')
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('page_path')
            ->groupBy('page_path')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'path' => $row->page_path,
                'views' => (int) $row->views,
            ]);
    }

    /**
     * @return Collection<int, array{date: string, fetches: int}>
     */
    private function serpFetchesOverTime(Carbon $start, Carbon $end): Collection
    {
        $rows = AnalyticsDailyStat::where('metric', 'tool_serp-preview')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date')
            ->pluck('value', 'date');

        return $this->dateRange($start, $end)->map(function (string $date) use ($rows) {
            return [
                'date' => $date,
                'fetches' => (int) ($rows[$date] ?? 0),
            ];
        });
    }

    /**
     * @return Collection<int, string>
     */
    private function dateRange(Carbon $start, Carbon $end): Collection
    {
        $dates = collect();

        for ($date = $start->copy(); $date <= $end; $date->addDay()) {
            $dates->push($date->toDateString());
        }

        return $dates;
    }
}
