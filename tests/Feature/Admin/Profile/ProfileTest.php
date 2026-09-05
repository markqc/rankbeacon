<?php

namespace Tests\Feature\Admin\Profile;

use App\Models\Passkey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_renders_for_admin(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->get('/admin/profile');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Profile/Edit')
            ->where('profile.email', $admin->email)
            ->has('passkeys')
            ->has('sessions')
        );
    }

    public function test_profile_requires_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/admin/profile')->assertForbidden();
    }

    public function test_admin_can_update_name_and_email(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->patch('/admin/profile', [
            'name' => 'New Name',
            'email' => 'new-email@example.com',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'name' => 'New Name',
            'email_normalized' => 'new-email@example.com',
        ]);
    }

    public function test_email_must_be_unique(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $other = User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($admin)->patch('/admin/profile', [
            'name' => 'Name',
            'email' => $other->email,
        ])->assertSessionHasErrors('email');
    }

    public function test_avatar_upload_is_resized(): void
    {
        Storage::fake('public');
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->post('/admin/profile', [
            '_method' => 'patch',
            'name' => $admin->name,
            'email' => $admin->email,
            'avatar' => UploadedFile::fake()->image('avatar.png', 1024, 1024),
        ]);

        $response->assertRedirect();
        $admin->refresh();
        $this->assertNotNull($admin->avatar_path);

        $path = ltrim(str_replace('/storage/', '', (string) parse_url($admin->avatar_path, PHP_URL_PATH)), '/');
        Storage::disk('public')->assertExists($path);
        $image = Image::decode(Storage::disk('public')->get($path));
        $this->assertLessThanOrEqual(512, $image->width());
    }

    public function test_avatar_can_be_removed(): void
    {
        Storage::fake('public');
        $admin = User::factory()->superAdmin()->create(['avatar_path' => '/storage/avatars/test.png']);
        Storage::disk('public')->put('avatars/test.png', 'fake');

        $response = $this->actingAs($admin)->patch('/admin/profile', [
            'name' => $admin->name,
            'email' => $admin->email,
            'remove_avatar' => true,
        ]);

        $response->assertRedirect();
        $admin->refresh();
        $this->assertNull($admin->avatar_path);
        Storage::disk('public')->assertMissing('avatars/test.png');
    }

    public function test_passkey_options_endpoint_returns_creation_options(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->postJson('/admin/profile/passkeys/options');

        $response->assertOk();
        $response->assertJsonStructure([
            'options' => ['challenge', 'rp', 'user', 'pubKeyCredParams'],
        ]);
    }

    public function test_admin_can_delete_own_passkey(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $passkey = Passkey::create([
            'user_id' => $admin->id,
            'name' => 'Test key',
            'credential_id' => 'abc',
            'data' => [],
        ]);

        $response = $this->actingAs($admin)->delete("/admin/profile/passkeys/{$passkey->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('passkeys', ['id' => $passkey->id]);
    }

    public function test_admin_cannot_delete_another_users_passkey(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $other = User::factory()->create();
        $passkey = Passkey::create([
            'user_id' => $other->id,
            'name' => 'Other key',
            'credential_id' => 'xyz',
            'data' => [],
        ]);

        $this->actingAs($admin)->delete("/admin/profile/passkeys/{$passkey->id}")->assertForbidden();
    }

    public function test_admin_can_revoke_another_session(): void
    {
        $admin = User::factory()->superAdmin()->create();
        DB::table('sessions')->insert([
            'id' => 'fake-session-id',
            'user_id' => $admin->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'payload' => '',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($admin)->delete('/admin/profile/sessions/fake-session-id');

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('sessions', ['id' => 'fake-session-id']);
    }

    public function test_passkey_login_options_is_public(): void
    {
        $response = $this->postJson('/admin/login/passkey/options');

        $response->assertOk();
        $response->assertJsonStructure(['options' => ['challenge', 'rpId', 'timeout']]);
    }
}
