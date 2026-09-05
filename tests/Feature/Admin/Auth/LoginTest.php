<?php

namespace Tests\Feature\Admin\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('admin-login');
    }

    public function test_login_page_renders_for_guests(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_authenticated_admin_is_redirected_away_from_login(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)
            ->get('/admin/login')
            ->assertRedirect('/admin/dashboard');
    }

    public function test_valid_super_admin_credentials_redirect_to_dashboard(): void
    {
        $user = User::factory()->superAdmin()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret-password'),
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->last_login_at);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'event' => 'login',
            'module' => 'auth',
        ]);
    }

    public function test_invalid_credentials_do_not_reveal_email_existence(): void
    {
        $response = $this->post('/admin/login', [
            'email' => 'unknown@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'failed_login',
            'module' => 'auth',
        ]);
    }

    public function test_inactive_super_admin_cannot_log_in(): void
    {
        User::factory()->superAdmin()->inactive()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret-password'),
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
        $this->assertGuest();
    }

    public function test_non_admin_user_cannot_log_in_to_admin(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('secret-password'),
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'user@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);
        $this->assertGuest();
    }

    public function test_login_rate_limits_after_five_failed_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/admin/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong-password',
            ]);
        }

        $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(429);
    }

    public function test_registration_and_forgot_password_routes_do_not_exist(): void
    {
        $this->get('/register')->assertNotFound();
        $this->get('/forgot-password')->assertNotFound();
        $this->get('/admin/register')->assertNotFound();
    }
}
