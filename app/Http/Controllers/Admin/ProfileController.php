<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\Services\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateProfileRequest;
use App\Support\Concerns\ProcessesUploadedImages;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use ProcessesUploadedImages;

    public function __construct(private readonly ActivityLogger $logger) {}

    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Admin/Profile/Edit', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_path' => $user->avatar_path,
                'last_login_at' => $user->last_login_at?->toIso8601String(),
                'created_at' => $user->created_at?->toIso8601String(),
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $role->label,
                ])->all(),
            ],
            'passkeys' => $user->passkeys()
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($passkey) => [
                    'id' => $passkey->id,
                    'name' => $passkey->name,
                    'last_used_at' => $passkey->last_used_at?->toIso8601String(),
                    'created_at' => $passkey->created_at?->toIso8601String(),
                ])
                ->all(),
            'sessions' => $this->sessions($request),
            'webauthnSupported' => true,
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($request->boolean('remove_avatar')) {
            $this->deleteStoredImage($user->avatar_path, ['avatars/']);
            $user->avatar_path = null;
        }

        if ($request->hasFile('avatar')) {
            $this->deleteStoredImage($user->avatar_path, ['avatars/']);
            $path = $this->storeUploadedImage($request->file('avatar'), 'avatars', 512);
            $user->avatar_path = Storage::disk('public')->url($path);
        }

        $user->save();

        $this->logger->log('profile_updated', 'profile', 'Profile updated', $user, $user);

        return redirect()->route('admin.profile.edit')->with('success', 'Profile updated.');
    }

    public function destroySession(Request $request, string $sessionId): RedirectResponse
    {
        if ($sessionId === $request->session()->getId()) {
            return back()->with('error', 'You cannot revoke your current session.');
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $request->user()->id)
            ->delete();

        $this->logger->log('session_revoked', 'profile', 'Session revoked', $request->user(), $request->user(), [
            'session_id' => $sessionId,
        ]);

        return back()->with('success', 'Session revoked.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function sessions(Request $request): array
    {
        if (config('session.driver') !== 'database') {
            return [];
        }

        $currentId = $request->session()->getId();

        return DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_activity')
            ->limit(20)
            ->get()
            ->map(fn ($session) => [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_activity' => (int) $session->last_activity,
                'is_current' => $session->id === $currentId,
            ])
            ->all();
    }
}
