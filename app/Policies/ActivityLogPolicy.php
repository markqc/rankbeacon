<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ActivityLog $activityLog): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Activity logs are immutable; only the logger should create them.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ActivityLog $activityLog): bool
    {
        return false;
    }
}
