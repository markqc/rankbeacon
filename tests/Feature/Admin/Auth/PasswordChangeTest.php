<?php

namespace Tests\Feature\Admin\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_change_page_renders_for_temp_password_user(): void
    {
        $user = User::factory()->superAdmin()->temporaryPassword()->create();

        $this->actingAs($user)
            ->get('/admin/password/change')
            ->assertOk();
    }

    public function test_password_change_requires_current_password(): void
    {
        $user = User::factory()->superAdmin()->temporaryPassword()->create();

        $response = $this->actingAs($user)
            ->patch('/admin/password/change', [
                'current_password' => 'wrong-password',
                'password' => 'new-secure-password',
                'password_confirmation' => 'new-secure-password',
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['current_password']);
    }

    public function test_password_change_updates_password_and_redirects_to_dashboard(): void
    {
        $user = User::factory()->superAdmin()->temporaryPassword()->create([
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->actingAs($user)
            ->patch('/admin/password/change', [
                'current_password' => 'old-password',
                'password' => 'new-secure-password',
                'password_confirmation' => 'new-secure-password',
            ]);

        $response->assertRedirect('/admin/dashboard');

        $user->refresh();
        $this->assertNotNull($user->password_changed_at);
        $this->assertTrue(Hash::check('new-secure-password', $user->password));
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'event' => 'password_changed',
            'module' => 'auth',
        ]);
    }
}
