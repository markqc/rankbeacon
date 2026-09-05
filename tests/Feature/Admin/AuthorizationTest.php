<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_protected_admin_routes(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
    }

    public function test_guest_can_visit_admin_login_page(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_authenticated_non_admin_user_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_authenticated_super_admin_can_access_admin_dashboard(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertOk();
    }

    public function test_inactive_super_admin_is_forbidden(): void
    {
        $user = User::factory()->superAdmin()->inactive()->create();

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_with_temporary_password_is_redirected_to_change_password(): void
    {
        $user = User::factory()->superAdmin()->temporaryPassword()->create();

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertRedirect('/admin/password/change');
    }

    public function test_password_change_page_is_accessible_to_authenticated_admin(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->get('/admin/password/change')
            ->assertOk();
    }
}
