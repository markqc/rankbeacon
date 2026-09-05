<?php

namespace App\Domain\Admin\Services;

use App\Models\Passkey;
use App\Models\User;
use ParagonIE\ConstantTime\Base64UrlSafe;
use Symfony\Component\Serializer\SerializerInterface;
use Webauthn\AttestationStatement\AttestationStatementSupportManager;
use Webauthn\AttestationStatement\NoneAttestationStatementSupport;
use Webauthn\AuthenticatorAssertionResponse;
use Webauthn\AuthenticatorAssertionResponseValidator;
use Webauthn\AuthenticatorAttestationResponse;
use Webauthn\AuthenticatorAttestationResponseValidator;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\CeremonyStep\CeremonyStepManagerFactory;
use Webauthn\CredentialRecord;
use Webauthn\Denormalizer\WebauthnSerializerFactory;
use Webauthn\Exception\AuthenticatorResponseVerificationException;
use Webauthn\PublicKeyCredential;
use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\PublicKeyCredentialDescriptor;
use Webauthn\PublicKeyCredentialParameters;
use Webauthn\PublicKeyCredentialRequestOptions;
use Webauthn\PublicKeyCredentialRpEntity;
use Webauthn\PublicKeyCredentialUserEntity;
use Webauthn\Util\Base64;

class WebAuthnService
{
    private SerializerInterface $serializer;

    private CeremonyStepManagerFactory $factory;

    public function __construct()
    {
        $attestationSupport = new AttestationStatementSupportManager([
            new NoneAttestationStatementSupport,
        ]);

        $this->serializer = (new WebauthnSerializerFactory($attestationSupport))->create();

        $factory = new CeremonyStepManagerFactory;
        $factory->setAllowedOrigins([$this->origin()]);
        $this->factory = $factory;
    }

    public function registrationOptions(User $user): PublicKeyCredentialCreationOptions
    {
        $exclude = $user->passkeys
            ->map(fn (Passkey $passkey) => PublicKeyCredentialDescriptor::create(
                'public-key',
                Base64::decode($passkey->credential_id)
            ))
            ->all();

        return PublicKeyCredentialCreationOptions::create(
            rp: PublicKeyCredentialRpEntity::create((string) config('app.name'), $this->rpId()),
            user: PublicKeyCredentialUserEntity::create($user->email, $this->userHandle($user), $user->name),
            challenge: random_bytes(32),
            pubKeyCredParams: [
                PublicKeyCredentialParameters::createPk(-7),
                PublicKeyCredentialParameters::createPk(-257),
            ],
            authenticatorSelection: AuthenticatorSelectionCriteria::create(
                userVerification: AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_PREFERRED,
                residentKey: AuthenticatorSelectionCriteria::RESIDENT_KEY_REQUIREMENT_PREFERRED,
            ),
            attestation: PublicKeyCredentialCreationOptions::ATTESTATION_CONVEYANCE_PREFERENCE_NONE,
            excludeCredentials: $exclude,
            timeout: 60_000,
        );
    }

    public function authenticationOptions(): PublicKeyCredentialRequestOptions
    {
        return PublicKeyCredentialRequestOptions::create(
            challenge: random_bytes(32),
            rpId: $this->rpId(),
            allowCredentials: [],
            userVerification: AuthenticatorSelectionCriteria::USER_VERIFICATION_REQUIREMENT_PREFERRED,
            timeout: 60_000,
        );
    }

    public function serializeOptions(PublicKeyCredentialCreationOptions|PublicKeyCredentialRequestOptions $options): string
    {
        return $this->serializer->serialize($options, 'json');
    }

    public function verifyRegistration(string $credentialJson, string $optionsJson, string $host): CredentialRecord
    {
        $options = $this->serializer->deserialize($optionsJson, PublicKeyCredentialCreationOptions::class, 'json');
        $credential = $this->serializer->deserialize($credentialJson, PublicKeyCredential::class, 'json');
        $response = $credential->response;

        if (! $response instanceof AuthenticatorAttestationResponse) {
            throw AuthenticatorResponseVerificationException::create('Invalid attestation response.');
        }

        return (new AuthenticatorAttestationResponseValidator($this->factory->creationCeremony()))
            ->check($response, $options, $host);
    }

    public function verifyAssertion(string $credentialJson, string $optionsJson, string $host): ?Passkey
    {
        $options = $this->serializer->deserialize($optionsJson, PublicKeyCredentialRequestOptions::class, 'json');
        $credential = $this->serializer->deserialize($credentialJson, PublicKeyCredential::class, 'json');
        $response = $credential->response;

        if (! $response instanceof AuthenticatorAssertionResponse) {
            throw AuthenticatorResponseVerificationException::create('Invalid assertion response.');
        }

        $passkey = Passkey::with('user')->firstWhere('credential_id', Base64UrlSafe::encodeUnpadded($credential->rawId));

        if (! $passkey) {
            throw AuthenticatorResponseVerificationException::create('Unknown credential.');
        }

        $record = $this->serializer->denormalize($passkey->data, CredentialRecord::class);

        $record = (new AuthenticatorAssertionResponseValidator($this->factory->requestCeremony()))
            ->check($record, $response, $options, $host, $response->userHandle);

        $passkey->forceFill([
            'data' => $this->recordToArray($record),
            'last_used_at' => now(),
        ])->save();

        return $passkey;
    }

    /**
     * @return array<string, mixed>
     */
    public function recordToArray(CredentialRecord $record): array
    {
        return $this->serializer->normalize($record);
    }

    private function rpId(): string
    {
        return (string) parse_url((string) config('app.url'), PHP_URL_HOST);
    }

    private function origin(): string
    {
        $parts = parse_url((string) config('app.url'));
        $scheme = $parts['scheme'] ?? 'https';
        $host = $parts['host'] ?? 'localhost';
        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return "{$scheme}://{$host}{$port}";
    }

    private function userHandle(User $user): string
    {
        return hash_hmac('sha256', 'passkey-user:'.$user->id, (string) config('app.key'), true);
    }
}
