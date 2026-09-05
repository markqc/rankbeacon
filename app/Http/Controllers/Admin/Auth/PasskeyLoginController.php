<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Domain\Admin\Services\ActivityLogger;
use App\Domain\Admin\Services\WebAuthnService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Webauthn\Exception\AuthenticatorResponseVerificationException;

class PasskeyLoginController extends Controller
{
    public function __construct(
        private readonly WebAuthnService $webauthn,
        private readonly ActivityLogger $logger,
    ) {}

    public function options(Request $request): JsonResponse
    {
        $options = $this->webauthn->authenticationOptions();
        $request->session()->put('webauthn.authentication', $this->webauthn->serializeOptions($options));

        return response()->json([
            'options' => json_decode($this->webauthn->serializeOptions($options), true),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        $optionsJson = $request->session()->pull('webauthn.authentication');

        if (! $optionsJson) {
            throw ValidationException::withMessages([
                'credential' => 'Authentication session expired. Please try again.',
            ]);
        }

        try {
            $passkey = $this->webauthn->verifyAssertion(
                $validated['credential'],
                $optionsJson,
                $request->getHost()
            );
        } catch (AuthenticatorResponseVerificationException) {
            throw ValidationException::withMessages([
                'credential' => 'Passkey verification failed.',
            ]);
        }

        $user = $passkey?->user;

        if (! $user || ! $user->isActive() || ! $user->can('admin.access')) {
            throw ValidationException::withMessages([
                'credential' => 'This passkey is not authorized for admin access.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->save();
        $this->logger->logLoginSuccess($user);

        return redirect()->intended(route('admin.dashboard'));
    }
}
