<?php

namespace Tests\Feature\Admin\Users;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_users_and_pagination(): void
    {
        $admin = User::factory()->superAdmin()->create();
        User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 4)
        );
    }

    public function test_search_filters_users_by_name_or_email(): void
    {
        $admin = User::factory()->superAdmin()->create();
        User::factory()->create(['name' => 'Alice Smith', 'email' => 'alice@example.com']);
        User::factory()->create(['name' => 'Bob Doe', 'email' => 'bob@example.com']);

        $response = $this->actingAs($admin)->get('/admin/users?search=alice');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 1)
            ->where('users.data.0.email', 'alice@example.com')
        );
    }

    public function test_create_page_renders_roles(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $role = Role::factory()->create(['name' => 'editor', 'label' => 'Editor']);

        $response = $this->actingAs($admin)->get('/admin/users/create');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Create')
            ->has('roles', 2)
            ->where('roles', fn ($roles) => collect($roles)->contains('id', $role->id))
        );
    }

    public function test_store_creates_user_with_temporary_password_and_roles(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $role = Role::factory()->create(['name' => 'editor', 'label' => 'Editor']);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'status' => 'active',
            'roles' => [$role->id],
        ]);

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email_normalized' => 'new@example.com',
            'status' => 'active',
            'password_changed_at' => null,
        ]);

        $user = User::where('email', 'new@example.com')->first();
        $this->assertTrue($user->hasRole('editor'));
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'user_created',
            'module' => 'users',
            'actor_id' => $admin->id,
            'subject_id' => $user->id,
        ]);
    }

    public function test_show_page_displays_user(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->get("/admin/users/{$user->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Show')
            ->where('user.id', $user->id)
        );
    }

    public function test_edit_page_displays_user_and_roles(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $user = User::factory()->create();
        $role = Role::factory()->create(['name' => 'editor', 'label' => 'Editor']);

        $response = $this->actingAs($admin)->get("/admin/users/{$user->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Edit')
            ->where('user.id', $user->id)
            ->has('roles', 2)
            ->where('roles', fn ($roles) => collect($roles)->contains('id', $role->id))
        );
    }

    public function test_update_changes_user_details_and_roles(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $role = Role::factory()->create(['name' => 'editor', 'label' => 'Editor']);
        $user = User::factory()->create(['status' => 'inactive']);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => $user->email,
            'status' => 'active',
            'roles' => [$role->id],
        ]);

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertSame('Updated Name', $user->name);
        $this->assertSame('active', $user->status);
        $this->assertTrue($user->hasRole('editor'));

        $this->assertDatabaseHas('activity_logs', [
            'event' => 'user_updated',
            'module' => 'users',
            'actor_id' => $admin->id,
            'subject_id' => $user->id,
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'user_activated',
            'module' => 'users',
        ]);
    }

    public function test_cannot_deactivate_own_account(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->patch("/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'status' => 'inactive',
            'roles' => [],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertSame('active', $admin->fresh()->status);
    }

    public function test_toggle_status_changes_status_and_logs(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $user = User::factory()->create(['status' => 'active']);

        $response = $this->actingAs($admin)->patch("/admin/users/{$user->id}/toggle-status", [
            'status' => 'inactive',
        ]);

        $response->assertRedirect('/admin/users');
        $this->assertSame('inactive', $user->fresh()->status);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'user_deactivated',
            'module' => 'users',
            'subject_id' => $user->id,
        ]);
    }

    public function test_reset_password_sets_temporary_password(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $user = User::factory()->create(['password_changed_at' => now()]);
        $oldHash = $user->password;

        $response = $this->actingAs($admin)->post("/admin/users/{$user->id}/reset-password");

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertNull($user->password_changed_at);
        $this->assertNotSame($oldHash, $user->password);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'user_password_reset',
            'module' => 'users',
            'subject_id' => $user->id,
        ]);
    }

    public function test_delete_soft_deletes_user_and_logs(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin)->delete("/admin/users/{$user->id}");

        $response->assertRedirect('/admin/users');
        $this->assertSoftDeleted($user);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'user_deleted',
            'module' => 'users',
            'subject_id' => $user->id,
        ]);
    }

    public function test_cannot_delete_own_account(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->delete("/admin/users/{$admin->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertNull($admin->fresh()->deleted_at);
    }

    public function test_non_admin_users_cannot_access_user_management(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertForbidden();
    }
}
