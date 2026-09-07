<?php

namespace App\Domain\Analytics\Services;

use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsTracker
{
    public function __construct(private readonly RequestMetadataParser $parser) {}

    public function trackPageView(Request $request, string $path, ?array $metadata = null): ?AnalyticsEvent
    {
        if (! $this->parser->isTrackable($request)) {
            return null;
        }

        return DB::transaction(function () use ($request, $path, $metadata) {
            $session = $this->session($request);

            $event = AnalyticsEvent::create([
                'analytics_session_id' => $session->id,
                'event_type' => 'page_view',
                'page_path' => $path,
                'metadata' => array_merge($metadata ?? [], ['country' => $this->parser->country($request)]),
                'created_at' => now(),
            ]);

            $this->incrementDailyStat('page_views');

            return $event;
        });
    }

    public function trackToolEvent(Request $request, string $tool, string $action, ?array $metadata = null): ?AnalyticsEvent
    {
        if (! $this->parser->isTrackable($request)) {
            return null;
        }

        return DB::transaction(function () use ($request, $tool, $action, $metadata) {
            $session = $this->session($request);

            $event = AnalyticsEvent::create([
                'analytics_session_id' => $session->id,
                'event_type' => 'tool_event',
                'page_path' => $request->input('path'),
                'tool_name' => $tool,
                'metadata' => array_merge($metadata ?? [], [
                    'action' => $action,
                    'country' => $this->parser->country($request),
                ]),
                'created_at' => now(),
            ]);

            $this->incrementDailyStat("tool_{$tool}");

            return $event;
        });
    }

    private function session(Request $request): AnalyticsSession
    {
        $fingerprint = $this->parser->fingerprint($request);

        $session = AnalyticsSession::where('fingerprint', $fingerprint)->first();

        if ($session === null) {
            $session = AnalyticsSession::create([
                'fingerprint' => $fingerprint,
                'session_token' => $this->parser->sessionToken($request),
                'device_type' => $this->parser->deviceType($request),
                'user_agent' => $request->userAgent(),
                'first_seen_at' => now(),
                'last_seen_at' => now(),
            ]);

            $this->incrementDailyStat('unique_sessions');
        } else {
            $session->last_seen_at = now();
            $session->save();
        }

        return $session;
    }

    private function incrementDailyStat(string $metric, int $amount = 1): void
    {
        $stat = AnalyticsDailyStat::firstOrNew(
            ['date' => now()->toDateString(), 'metric' => $metric],
            ['value' => 0],
        );

        $stat->value += $amount;
        $stat->save();
    }
}
