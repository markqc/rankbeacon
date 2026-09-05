<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            Admin\SuperAdminSeeder::class,
        ]);

        /** @var User $user */
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'email_normalized' => 'test@example.com',
                'status' => 'active',
                'password' => Hash::make(Str::password(12, true, true, true, false)),
                'password_changed_at' => now(),
            ]
        );

        $role = Role::firstOrCreate(
            ['name' => 'super_admin'],
            ['label' => 'Super Admin'],
        );

        if (! $user->hasRole('super_admin')) {
            $user->roles()->attach($role->id);
        }
    }
}
