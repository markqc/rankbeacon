<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\Services\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\ToggleUserStatusRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly ActivityLogger $logger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $query = User::with('roles')->orderBy('name');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($query->paginate(15)->withQueryString()),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Admin/Users/Create', [
            'roles' => Role::orderBy('label')->get(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $password = $this->temporaryPassword();

        /** @var User $user */
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'status' => $request->validated('status'),
            'password' => Hash::make($password),
            'password_changed_at' => null,
        ]);

        $roles = $request->validated('roles', []);
        if (! empty($roles)) {
            $user->roles()->sync($roles);
        }

        $this->logger->logUserCreated(
            $request->user(),
            $user,
            ['roles' => $roles, 'status' => $user->status],
        );

        return redirect()
            ->route('admin.users.index')
            ->with('success', "User created. Temporary password: {$password}");
    }

    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user->load('roles')),
        ]);
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('Admin/Users/Edit', [
            'user' => new UserResource($user->load('roles')),
            'roles' => Role::orderBy('label')->get(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validated();
        $currentUser = $request->user();

        if ($user->id === $currentUser?->id && $validated['status'] !== $user->status) {
            return back()->with('error', 'You cannot change your own account status.');
        }

        $statusChanged = $validated['status'] !== $user->status;
        $oldRoles = $user->roles->pluck('id')->toArray();
        $newRoles = $validated['roles'] ?? [];
        $rolesChanged = array_diff($oldRoles, $newRoles) !== [] || array_diff($newRoles, $oldRoles) !== [];

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'status' => $validated['status'],
        ]);

        $user->roles()->sync($newRoles);

        $this->logger->logUserUpdated($currentUser, $user, [
            'status_changed' => $statusChanged,
            'roles_changed' => $rolesChanged,
        ]);

        if ($rolesChanged) {
            $this->logger->logUserRoleChanged($currentUser, $user, [
                'previous' => $oldRoles,
                'current' => $newRoles,
            ]);
        }

        if ($statusChanged) {
            if ($user->status === 'active') {
                $this->logger->logUserActivated($currentUser, $user);
            } else {
                $this->logger->logUserDeactivated($currentUser, $user);
            }
        }

        return redirect()->route('admin.users.index')->with('success', 'User updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        if ($user->id === 1) {
            return back()->with('error', 'The primary administrator account cannot be deleted.');
        }

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $actor = auth()->user();
        $user->delete();
        $this->logger->logUserDeleted($actor, $user);

        return redirect()->route('admin.users.index')->with('success', 'User deleted.');
    }

    public function toggleStatus(ToggleUserStatusRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot change your own account status.');
        }

        $actor = auth()->user();
        $status = $request->validated('status');
        $user->status = $status;
        $user->save();

        if ($status === 'active') {
            $this->logger->logUserActivated($actor, $user);
        } else {
            $this->logger->logUserDeactivated($actor, $user);
        }

        return redirect()->route('admin.users.index')->with('success', 'User status updated.');
    }

    public function resetPassword(ResetUserPasswordRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $password = $this->temporaryPassword();
        $user->password = Hash::make($password);
        $user->password_changed_at = null;
        $user->save();

        $this->logger->logUserPasswordReset(auth()->user(), $user);

        return redirect()->route('admin.users.index')->with('success', "Password reset. New temporary password: {$password}");
    }

    private function temporaryPassword(): string
    {
        return Str::password(12, true, true, true, false);
    }
}
