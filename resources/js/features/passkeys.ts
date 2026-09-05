function base64UrlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

async function fetchOptions(url: string): Promise<Record<string, unknown>> {
    const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch passkey options.');
    }
    const json = (await res.json()) as { options: Record<string, unknown> };
    return json.options;
}

export async function registerPasskey(optionsUrl: string): Promise<string> {
    const options = await fetchOptions(optionsUrl);

    const publicKey: PublicKeyCredentialCreationOptions = {
        ...(options as unknown as PublicKeyCredentialCreationOptions),
        challenge: base64UrlToBuffer(options.challenge as string),
        user: {
            ...(options.user as Record<string, unknown>),
            id: base64UrlToBuffer((options.user as Record<string, unknown>).id as string),
        } as PublicKeyCredentialUserEntity,
        excludeCredentials: ((options.excludeCredentials as { id: string }[] | undefined) ?? []).map((cred) => ({
            ...cred,
            id: base64UrlToBuffer(cred.id),
        })) as PublicKeyCredentialDescriptor[],
    };

    const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
    if (!credential) {
        throw new Error('Passkey registration was cancelled.');
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    return JSON.stringify({
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
            clientDataJSON: bufferToBase64Url(response.clientDataJSON),
            attestationObject: bufferToBase64Url(response.attestationObject),
            transports: response.getTransports?.() ?? [],
        },
    });
}

export async function authenticateWithPasskey(optionsUrl: string): Promise<string> {
    const options = await fetchOptions(optionsUrl);

    const publicKey: PublicKeyCredentialRequestOptions = {
        ...(options as unknown as PublicKeyCredentialRequestOptions),
        challenge: base64UrlToBuffer(options.challenge as string),
        allowCredentials: ((options.allowCredentials as { id: string }[] | undefined) ?? []).map((cred) => ({
            ...cred,
            id: base64UrlToBuffer(cred.id),
        })) as PublicKeyCredentialDescriptor[],
    };

    const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
    if (!assertion) {
        throw new Error('Passkey authentication was cancelled.');
    }

    const response = assertion.response as AuthenticatorAssertionResponse;

    return JSON.stringify({
        id: assertion.id,
        rawId: bufferToBase64Url(assertion.rawId),
        type: assertion.type,
        response: {
            clientDataJSON: bufferToBase64Url(response.clientDataJSON),
            authenticatorData: bufferToBase64Url(response.authenticatorData),
            signature: bufferToBase64Url(response.signature),
            userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
        },
    });
}
