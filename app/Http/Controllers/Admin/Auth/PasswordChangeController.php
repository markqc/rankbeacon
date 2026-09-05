<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Domain\Admin\Services\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PasswordChangeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    public function __construct(private readonly ActivityLogger $logger) {}

    public function edit(Request $request)
    {
        return Inertia::render('Admin/Auth/PasswordChange');
    }

    public function update(PasswordChangeRequest $request)
    {
        $user = $request->user();
        $wasTemporaryPassword = $user->password_changed_at === null;

        $user->password = Hash::make($request->validated('password'));
        $user->password_changed_at = now();
        $user->save();

        $this->logger->logPasswordChanged($user);

        Auth::login($user);
        $request->session()->regenerate();

        if ($wasTemporaryPassword) {
            return redirect()->route('admin.dashboard')->with('success', 'Password changed successfully.');
        }

        return redirect()->back()->with('success', 'Password changed successfully.');
    }
}
