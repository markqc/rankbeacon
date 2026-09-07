<?php

namespace Tests\Feature\Analytics;

use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Models\AnalyticsDailyStat;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private string $token = 'test-csrf-token';

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('analytics-event');
    }

    public function test_page_view_is_recorded_via_api(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Mozilla/5.0 (compatible; Test/1.0)',
            ])
            ->postJson('/api/analytics/event', [
                'event_type' => 'page_view',
                'path' => '/tools/serp-preview',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('status', 'recorded');
        $this->assertDatabaseHas('analytics_events', [
            'event_type' => 'page_view',
            'page_path' => '/tools/serp-preview',
        ]);
        $this->assertDatabaseHas('analytics_daily_stats', [
            'metric' => 'page_views',
            'value' => 1,
        ]);
    }

    public function test_duplicate_page_views_create_separate_events(): void
    {
        $first = $this->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Mozilla/5.0',
            ])
            ->postJson('/api/analytics/event', ['event_type' => 'page_view', 'path' => '/']);

        $second = $this->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Mozilla/5.0',
            ])
            ->postJson('/api/analytics/event', ['event_type' => 'page_view', 'path' => '/']);

        $first->assertCreated();
        $second->assertCreated();

        $this->assertSame(2, AnalyticsEvent::count());
    }

    public function test_bot_user_agents_are_ignored(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Googlebot/2.1 (+http://www.google.com/bot.html)',
            ])
            ->postJson('/api/analytics/event', [
                'event_type' => 'page_view',
                'path' => '/',
            ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'ignored');
        $this->assertSame(0, AnalyticsEvent::count());
    }

    public function test_do_not_track_header_is_respected(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Mozilla/5.0',
                'DNT' => '1',
            ])
            ->postJson('/api/analytics/event', [
                'event_type' => 'page_view',
                'path' => '/',
            ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'ignored');
        $this->assertSame(0, AnalyticsEvent::count());
    }

    public function test_admin_users_are_ignored(): void
    {
        $user = User::factory()->superAdmin()->create();

        $response = $this->actingAs($user)
            ->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Mozilla/5.0',
            ])
            ->postJson('/api/analytics/event', [
                'event_type' => 'page_view',
                'path' => '/',
            ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'ignored');
        $this->assertSame(0, AnalyticsEvent::count());
    }

    public function test_admin_paths_are_ignored(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders([
                'X-CSRF-TOKEN' => $this->token,
                'User-Agent' => 'Mozilla/5.0',
            ])
            ->postJson('/api/analytics/event', [
                'event_type' => 'page_view',
                'path' => '/admin/dashboard',
            ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'ignored');
    }

    public function test_tool_event_is_recorded_by_tracker(): void
    {
        $tracker = app(AnalyticsTracker::class);
        $request = $this->createRequest('/tools/serp-preview');

        $event = $tracker->trackToolEvent($request, 'serp-preview', 'fetch', ['url' => 'https://example.com/']);

        $this->assertNotNull($event);
        $this->assertSame('tool_event', $event->event_type);
        $this->assertSame('serp-preview', $event->tool_name);
        $this->assertDatabaseHas('analytics_daily_stats', [
            'metric' => 'tool_serp-preview',
            'value' => 1,
        ]);
    }

    public function test_dashboard_returns_aggregated_stats(): void
    {
        $user = User::factory()->superAdmin()->create();
        $session = AnalyticsSession::factory()->create();

        AnalyticsEvent::factory()->count(3)->state([
            'analytics_session_id' => $session->id,
            'event_type' => 'page_view',
            'created_at' => now(),
        ])->create();

        AnalyticsEvent::factory()->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now(),
        ])->create();

        $response = $this->actingAs($user)->get('/admin/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('stats.summary')
            ->where('stats.summary.page_views', 3)
            ->where('stats.summary.serp_fetches', 1)
            ->where('stats.summary.unique_sessions', 1)
        );
    }

    public function test_dashboard_scales_with_large_dataset(): void
    {
        $user = User::factory()->superAdmin()->create();
        $session = AnalyticsSession::factory()->create();

        AnalyticsEvent::factory()->count(500)->state([
            'analytics_session_id' => $session->id,
            'event_type' => 'page_view',
            'page_path' => '/popular-page',
            'created_at' => now(),
        ])->create();

        AnalyticsEvent::factory()->count(25)->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now(),
        ])->create();

        $response = $this->actingAs($user)->get('/admin/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('stats.summary.page_views', 500)
            ->where('stats.summary.serp_fetches', 25)
            ->where('stats.topPages.0.views', 500)
        );
    }

    public function test_dashboard_includes_paginated_recent_serp_fetches(): void
    {
        $user = User::factory()->superAdmin()->create();
        $session = AnalyticsSession::factory()->create();

        AnalyticsEvent::factory()->count(12)->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now(),
            'metadata' => fn () => ['action' => 'fetch', 'url' => fake()->unique()->url()],
        ])->create();

        $response = $this->actingAs($user)->get('/admin/dashboard?page=2');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('recentSerpFetches.data', 2)
            ->where('recentSerpFetches.meta.current_page', 2)
            ->where('recentSerpFetches.meta.last_page', 2)
            ->where('recentSerpFetches.meta.per_page', 10)
            ->where('recentSerpFetches.meta.total', 12)
        );
    }

    public function test_dashboard_serp_fetch_list_filters_by_url_and_date_range(): void
    {
        $user = User::factory()->superAdmin()->create();
        $session = AnalyticsSession::factory()->create();

        AnalyticsEvent::factory()->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now(),
            'metadata' => ['action' => 'fetch'],
        ])->create();

        AnalyticsEvent::factory()->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now()->subDays(31),
            'metadata' => ['action' => 'fetch', 'url' => 'https://old.example.com/'],
        ])->create();

        AnalyticsEvent::factory()->toolEvent('serp-preview')->state([
            'analytics_session_id' => $session->id,
            'created_at' => now(),
            'metadata' => ['action' => 'fetch', 'url' => 'https://recent.example.com/'],
        ])->create();

        $response = $this->actingAs($user)->get('/admin/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('recentSerpFetches.data', 1)
            ->where('recentSerpFetches.data.0.url', 'https://recent.example.com/')
            ->where('recentSerpFetches.meta.total', 1)
        );
    }

    public function test_prune_command_removes_old_analytics_data(): void
    {
        $oldSession = AnalyticsSession::factory()->create([
            'last_seen_at' => now()->subDays(120),
        ]);
        $recentSession = AnalyticsSession::factory()->create([
            'last_seen_at' => now()->subDay(),
        ]);
        AnalyticsDailyStat::factory()->create([
            'date' => now()->subDays(120)->toDateString(),
            'metric' => 'page_views',
        ]);

        $this->artisan('analytics:prune', ['--days' => 90])->assertSuccessful();

        $this->assertNull(AnalyticsSession::find($oldSession->id));
        $this->assertNotNull(AnalyticsSession::find($recentSession->id));
        $this->assertSame(0, AnalyticsDailyStat::whereDate('date', '<', now()->subDays(90)->toDateString())->count());
    }

    public function test_prune_command_supports_dry_run(): void
    {
        $session = AnalyticsSession::factory()->create([
            'last_seen_at' => now()->subDays(120),
        ]);

        $this->artisan('analytics:prune', ['--days' => 90, '--dry-run' => true])
            ->assertSuccessful();

        $this->assertNotNull(AnalyticsSession::find($session->id));
    }

    private function createRequest(string $path): Request
    {
        return Request::create(
            'https://rankbeacon.local.system'.$path,
            'POST',
            ['path' => $path],
            [],
            [],
            ['HTTP_USER_AGENT' => 'Mozilla/5.0 (compatible; Test/1.0)'],
            null,
        );
    }
}
