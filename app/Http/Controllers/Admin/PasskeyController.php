<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\Services\ActivityLogger;
use App\Domain\Admin\Services\WebAuthnService;
use App\Http\Controllers\Controller;
use App\Models\Passkey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use ParagonIE\ConstantTime\Base64UrlSafe;

class PasskeyController extends Controller
{
    public function __construct(
        private readonly WebAuthnService $webauthn,
        private readonly ActivityLogger $logger,
    ) {}

    public function options(Request $request): JsonResponse
    {
        $options = $this->webauthn->registrationOptions($request->user());
        $request->session()->put('webauthn.registration', $this->webauthn->serializeOptions($options));

        return response()->json([
            'options' => json_decode($this->webauthn->serializeOptions($options), true),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'credential' => ['required', 'string'],
        ]);

        $optionsJson = $request->session()->pull('webauthn.registration');

        if (! $optionsJson) {
            throw ValidationException::withMessages([
                'credential' => 'Registration session expired. Please try again.',
            ]);
        }

        try {
            $record = $this->webauthn->verifyRegistration(
                $validated['credential'],
                $optionsJson,
                $request->getHost()
            );
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'credential' => 'Passkey verification failed. Please try again.',
            ]);
        }

        $user = $request->user();

        $passkey = $user->passkeys()->create([
            'name' => $validated['name'],
            'credential_id' => Base64UrlSafe::encodeUnpadded($record->publicKeyCredentialId),
            'data' => $this->webauthn->recordToArray($record),
        ]);

        $this->logger->log('passkey_registered', 'profile', 'Passkey registered', $user, $passkey, [
            'name' => $passkey->name,
        ]);

        return back()->with('success', 'Passkey registered.');
    }

    public function destroy(Request $request, Passkey $passkey): RedirectResponse
    {
        abort_unless($passkey->user_id === $request->user()->id, 403);

        $passkey->delete();

        $this->logger->log('passkey_deleted', 'profile', 'Passkey deleted', $request->user(), $request->user(), [
            'name' => $passkey->name,
        ]);

        return back()->with('success', 'Passkey removed.');
    }
}
