<?php

namespace Tests\Feature\Admin;

use App\Domain\Admin\Services\SettingsService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrossModuleIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_page_view_is_logged_once_per_navigation(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)->get('/admin/users');
        $this->actingAs($admin)->get('/admin/users');

        $this->assertDatabaseCount('activity_logs', 2);
    }

    public function test_inertia_requests_do_not_duplicate_page_views(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)->get('/admin/dashboard');
        $this->actingAs($admin)->get('/admin/dashboard', ['X-Inertia' => 'true']);

        $this->assertDatabaseCount('activity_logs', 1);
    }

    public function test_site_name_setting_is_used_in_public_pages(): void
    {
        app(SettingsService::class)->set('site_name', 'Beacon SEO', 'general');

        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('Beacon SEO');
    }

    public function test_site_name_setting_is_used_on_login_page(): void
    {
        app(SettingsService::class)->set('site_name', 'Beacon SEO', 'general');

        $response = $this->get('/admin/login');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->where('branding.site_name', 'Beacon SEO'));
    }

    public function test_failed_login_is_logged_without_passwords(): void
    {
        User::factory()->superAdmin()->create(['email' => 'admin@example.com']);

        $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'super-secret-password',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'event' => 'failed_login',
            'module' => 'auth',
        ]);
        $this->assertDatabaseMissing('activity_logs', [
            'metadata' => '"super-secret-password"',
        ]);
    }

    public function test_dashboard_includes_recent_activity_logs(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->has('recentActivity'));
    }
}
