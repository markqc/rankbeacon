<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Domain\Admin\Services\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function __construct(private readonly ActivityLogger $logger) {}

    public function create(Request $request)
    {
        return Inertia::render('Admin/Auth/Login');
    }

    public function store(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $user = $request->user();

            if (! $user->isActive() || ! $user->can('admin.access')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                $this->logger->logLoginFailure($request->string('email')->toString(), ['reason' => 'inactive_or_unauthorized']);

                return back()->withErrors([
                    'email' => 'These credentials do not match our records.',
                ]);
            }

            $user->forceFill(['last_login_at' => now()])->save();
            $this->logger->logLoginSuccess($user);

            if ($user->password_changed_at === null) {
                return redirect()->route('admin.password.change.edit');
            }

            return redirect()->intended('/admin/dashboard');
        }

        $this->logger->logLoginFailure($request->string('email')->toString(), ['reason' => 'invalid_credentials']);

        return back()->withErrors([
            'email' => 'These credentials do not match our records.',
        ]);
    }
}
