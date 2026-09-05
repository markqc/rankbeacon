<?php

namespace Tests\Feature\Admin\Seeders;

use App\Models\User;
use Database\Seeders\Admin\SuperAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class SuperAdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_mark_super_admin_with_temporary_password(): void
    {
        $this->seed(SuperAdminSeeder::class);

        $user = User::find(1);

        $this->assertNotNull($user);
        $this->assertSame('Mark', $user->name);
        $this->assertSame('mark@m-caneda.com', $user->email);
        $this->assertSame('mark@m-caneda.com', $user->email_normalized);
        $this->assertSame('active', $user->status);
        $this->assertTrue($user->hasRole('super_admin'));
        $this->assertTrue(Hash::check('!Password1234', $user->password));
        $this->assertNull($user->password_changed_at);
    }

    public function test_seeder_is_idempotent(): void
    {
        $this->seed(SuperAdminSeeder::class);
        $this->seed(SuperAdminSeeder::class);

        $this->assertSame(1, User::count());
    }

    public function test_seeder_throws_when_user_id_one_has_different_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->expectException(RuntimeException::class);

        $this->seed(SuperAdminSeeder::class);
    }

    public function test_seeded_credentials_force_password_change_on_login(): void
    {
        $this->seed(SuperAdminSeeder::class);

        $response = $this->post('/admin/login', [
            'email' => 'mark@m-caneda.com',
            'password' => '!Password1234',
        ]);

        $response->assertRedirect('/admin/password/change');
        $this->assertAuthenticated();
    }
}
