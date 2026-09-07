<?php

namespace App\Domain\Analytics\Services;

use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use Illuminate\Pagination\LengthAwarePaginator;
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
        return $this->rangeStats(now()->subDays(29)->startOfDay(), now()->endOfDay());
    }

    /**
     * Build statistics for an arbitrary date range.
     *
     * @return array<string, mixed>
     */
    public function rangeStats(Carbon $start, Carbon $end): array
    {
        return [
            'summary' => $this->summary($start, $end),
            'visits' => $this->visitsOverTime($start, $end),
            'devices' => $this->deviceBreakdown($start, $end),
            'topCountries' => $this->topCountries($start, $end),
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
     * @return Collection<int, array{country: string, views: int}>
     */
    private function topCountries(Carbon $start, Carbon $end): Collection
    {
        return AnalyticsEvent::select('metadata->country as country', DB::raw('count(*) as views'))
            ->where('event_type', 'page_view')
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('metadata->country')
            ->groupBy('metadata->country')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'country' => $row->country ?? 'Unknown',
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
     * @return LengthAwarePaginator<int, array{url: string, country: string|null, created_at: string|null}>
     */
    public function recentSerpFetches(int $page = 1, int $perPage = 10, ?Carbon $start = null, ?Carbon $end = null): LengthAwarePaginator
    {
        $start ??= now()->subDays(29)->startOfDay();
        $end ??= now()->endOfDay();

        return AnalyticsEvent::where('event_type', 'tool_event')
            ->where('tool_name', 'serp-preview')
            ->whereNotNull('metadata->url')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->paginate($perPage, ['id', 'metadata', 'created_at'], 'page', $page)
            ->through(fn (AnalyticsEvent $event) => [
                'url' => $event->metadata['url'] ?? null,
                'country' => $event->metadata['country'] ?? null,
                'created_at' => $event->created_at?->toDateTimeString(),
            ])
            ->withQueryString();
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
