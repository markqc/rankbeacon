<?php

namespace Tests\Feature\Admin\ActivityLogs;

use App\Domain\Admin\Services\ActivityLogger;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_activity_logs(): void
    {
        $this->get('/admin/activity-logs')->assertRedirect('/login');
    }

    public function test_non_admin_users_cannot_access_activity_logs(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/activity-logs')
            ->assertForbidden();
    }

    public function test_super_admin_can_list_activity_logs(): void
    {
        $user = User::factory()->superAdmin()->create();
        ActivityLog::create([
            'event' => 'login',
            'module' => 'auth',
            'description' => 'User logged in.',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/admin/activity-logs');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/ActivityLogs/Index')
            ->has('logs.data', 1)
        );
    }

    public function test_activity_logs_can_be_filtered_by_module_and_event(): void
    {
        $user = User::factory()->superAdmin()->create();
        ActivityLog::create([
            'event' => 'login',
            'module' => 'auth',
            'description' => 'Login event',
            'created_at' => now(),
        ]);
        ActivityLog::create([
            'event' => 'page_view',
            'module' => 'admin',
            'description' => 'Page view',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/admin/activity-logs?module=auth&event=login');

        $response->assertInertia(fn ($page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.event', 'login')
        );
    }

    public function test_admin_page_views_are_logged_once_per_full_page_visit(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)->get('/admin/dashboard');

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'event' => 'page_view',
            'module' => 'admin',
        ]);
    }

    public function test_inertia_requests_do_not_duplicate_page_view_logs(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)->get('/admin/dashboard', ['X-Inertia' => 'true', 'X-Inertia-Version' => '1']);

        $this->assertDatabaseMissing('activity_logs', [
            'event' => 'page_view',
            'module' => 'admin',
            'actor_id' => $user->id,
        ]);
    }

    public function test_failed_login_metadata_does_not_store_passwords(): void
    {
        $this->post('/admin/login', [
            'email' => 'anyone@example.com',
            'password' => 'super-secret',
        ]);

        $log = ActivityLog::where('event', 'failed_login')->first();

        $this->assertNotNull($log);
        $this->assertStringNotContainsString('super-secret', json_encode($log->metadata));
    }

    public function test_sensitive_metadata_is_redacted(): void
    {
        $logger = app(ActivityLogger::class);
        $log = $logger->log('test', 'auth', 'Test event', null, null, [
            'password' => 'secret',
            'nested' => ['api_key' => 'abc'],
        ]);

        $this->assertSame('[REDACTED]', $log->metadata['password']);
        $this->assertSame('[REDACTED]', $log->metadata['nested']['api_key']);
    }

    public function test_activity_logs_cannot_be_modified_or_deleted_via_routes(): void
    {
        $user = User::factory()->superAdmin()->create();
        $log = ActivityLog::create([
            'event' => 'login',
            'module' => 'auth',
            'description' => 'Test',
            'created_at' => now(),
        ]);

        $this->actingAs($user)->put("/admin/activity-logs/{$log->id}")->assertMethodNotAllowed();
        $this->actingAs($user)->patch("/admin/activity-logs/{$log->id}")->assertMethodNotAllowed();
        $this->actingAs($user)->delete("/admin/activity-logs/{$log->id}")->assertMethodNotAllowed();
    }

    public function test_actor_name_is_preserved_when_user_changes(): void
    {
        $user = User::factory()->superAdmin()->create(['name' => 'Original Name']);
        $logger = app(ActivityLogger::class);
        $log = $logger->logLoginSuccess($user);

        $user->update(['name' => 'New Name']);

        $this->assertSame('Original Name', $log->fresh()->actor_name);
    }

    public function test_prune_command_removes_old_records_but_keeps_recent(): void
    {
        $user = User::factory()->superAdmin()->create();

        $old = ActivityLog::create([
            'actor_id' => $user->id,
            'event' => 'login',
            'module' => 'auth',
            'created_at' => now()->subDays(400),
        ]);
        $recent = ActivityLog::create([
            'actor_id' => $user->id,
            'event' => 'login',
            'module' => 'auth',
            'created_at' => now()->subDay(),
        ]);

        $this->artisan('activity-log:prune', ['--days' => 365])
            ->assertSuccessful();

        $this->assertNull(ActivityLog::find($old->id));
        $this->assertNotNull(ActivityLog::find($recent->id));
    }

    public function test_prune_command_supports_dry_run(): void
    {
        ActivityLog::create([
            'event' => 'login',
            'module' => 'auth',
            'created_at' => now()->subDays(400),
        ]);

        $this->artisan('activity-log:prune', ['--days' => 365, '--dry-run' => true])
            ->assertSuccessful()
            ->expectsOutput('Would prune 1 activity log records older than 365 days.');

        $this->assertSame(1, ActivityLog::count());
    }
}
