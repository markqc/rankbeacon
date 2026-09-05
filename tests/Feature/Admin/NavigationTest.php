<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class NavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_root_redirects_to_dashboard(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->get('/admin')
            ->assertRedirect('/admin/dashboard');
    }

    #[DataProvider('adminPageProvider')]
    public function test_admin_pages_render_for_super_admin(string $path): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->get($path)
            ->assertOk();
    }

    public static function adminPageProvider(): array
    {
        return [
            ['/admin/dashboard'],
            ['/admin/analytics'],
            ['/admin/users'],
            ['/admin/users/create'],
            ['/admin/settings'],
            ['/admin/activity-logs'],
        ];
    }

    public function test_public_homepage_renders(): void
    {
        $this->get('/')->assertOk();
    }

    public function test_public_serp_preview_tool_renders(): void
    {
        $this->get('/tools/serp-preview')->assertOk();
    }
}
