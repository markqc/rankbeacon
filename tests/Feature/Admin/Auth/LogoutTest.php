<?php

namespace Tests\Feature\Admin\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_logout_invalidates_session_and_redirects_to_login(): void
    {
        $user = User::factory()->superAdmin()->create();

        $response = $this->actingAs($user)
            ->post('/admin/logout');

        $response->assertRedirect('/admin/login');
        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $user->id,
            'event' => 'logout',
            'module' => 'auth',
        ]);
    }
}
