<?php

namespace Database\Seeders\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class SuperAdminSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $existing = User::find(1);

            if ($existing !== null && $existing->email !== 'mark@m-caneda.com') {
                throw new RuntimeException(
                    'Cannot seed super admin: user ID 1 already exists with a different email address.'
                );
            }

            $role = Role::firstOrCreate(
                ['name' => 'super_admin'],
                ['label' => 'Super Admin'],
            );

            $user = User::updateOrCreate(
                ['id' => 1],
                [
                    'name' => 'Mark',
                    'email' => 'mark@m-caneda.com',
                    'email_normalized' => 'mark@m-caneda.com',
                    'status' => 'active',
                    'password' => Hash::make('!Password1234'),
                    'password_changed_at' => null,
                ],
            );

            if (! $user->hasRole('super_admin')) {
                $user->roles()->attach($role->id);
            }
        });
    }
}
