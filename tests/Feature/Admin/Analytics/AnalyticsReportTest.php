<?php

namespace Tests\Feature\Admin\Analytics;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_report_returns_aggregated_stats_and_countries(): void
    {
        $user = User::factory()->superAdmin()->create();
        $session = AnalyticsSession::factory()->create([
            'last_seen_at' => now(),
        ]);

        AnalyticsEvent::factory()->count(3)->state([
            'analytics_session_id' => $session->id,
            'event_type' => 'page_view',
            'created_at' => now(),
            'metadata' => ['country' => 'US'],
        ])->create();

        AnalyticsEvent::factory()->count(2)->state([
            'analytics_session_id' => $session->id,
            'event_type' => 'page_view',
            'created_at' => now(),
            'metadata' => ['country' => 'CA'],
        ])->create();

        AnalyticsEvent::factory()->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now(),
        ])->create();

        $start = now()->subDay()->toDateString();
        $end = now()->toDateString();

        $response = $this->actingAs($user)->get("/admin/analytics?start={$start}&end={$end}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Analytics')
            ->has('stats.summary')
            ->where('stats.summary.page_views', 5)
            ->where('stats.summary.serp_fetches', 1)
            ->where('stats.summary.unique_sessions', 1)
            ->where('startDate', $start)
            ->where('endDate', $end)
            ->has('recentSerpFetches.data', 1)
            ->has('stats.topCountries', 2)
            ->where('stats.topCountries.0.country', 'US')
            ->where('stats.topCountries.0.views', 3)
            ->where('stats.topCountries.1.country', 'CA')
            ->where('stats.topCountries.1.views', 2)
        );
    }
}
