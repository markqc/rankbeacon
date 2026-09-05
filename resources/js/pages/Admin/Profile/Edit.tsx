import { router, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Fingerprint, KeyRound, Monitor, Trash2 } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import Alert from '../../../components/Alert';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import FormField from '../../../components/FormField';
import TextInput from '../../../components/TextInput';
import AdminLayout from '../../../layouts/AdminLayout';
import { isWebAuthnSupported, registerPasskey } from '../../../features/passkeys';
import type { PageProps, Role } from '../../../types';

interface ProfileData {
    id: number;
    name: string;
    email: string;
    avatar_path: string | null;
    last_login_at: string | null;
    created_at: string | null;
    roles: Role[];
}

interface PasskeyItem {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string | null;
}

interface SessionItem {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    last_activity: number;
    is_current: boolean;
}

interface ProfilePageProps extends PageProps {
    profile: ProfileData;
    passkeys: PasskeyItem[];
    sessions: SessionItem[];
}

export default function Edit() {
    const { profile, passkeys, sessions } = usePage<ProfilePageProps>().props;
    const webauthnAvailable = isWebAuthnSupported();

    const profileForm = useForm<{
        name: string;
        email: string;
        avatar: File | null;
        remove_avatar: boolean;
    }>({
        name: profile.name,
        email: profile.email,
        avatar: null,
        remove_avatar: false,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [passkeyName, setPasskeyName] = useState('');
    const [passkeyError, setPasskeyError] = useState<string | null>(null);
    const [passkeyBusy, setPasskeyBusy] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    function submitProfile(e: FormEvent) {
        e.preventDefault();
        profileForm.transform((formData) => ({ ...formData, _method: 'patch' }));
        profileForm.post('/admin/profile', {
            forceFormData: true,
            onSuccess: () => window.location.assign('/admin/profile'),
        });
    }

    function submitPassword(e: FormEvent) {
        e.preventDefault();
        passwordForm.patch('/admin/password/change');
    }

    async function addPasskey() {
        setPasskeyError(null);
        setPasskeyBusy(true);
        try {
            const credential = await registerPasskey('/admin/profile/passkeys/options');
            router.post('/admin/profile/passkeys', {
                name: passkeyName || 'Passkey',
                credential,
            });
        } catch (error) {
            setPasskeyError(error instanceof Error ? error.message : 'Passkey registration failed.');
        } finally {
            setPasskeyBusy(false);
        }
    }

    function deletePasskey(id: number) {
        if (confirm('Remove this passkey?')) {
            router.delete(`/admin/profile/passkeys/${id}`);
        }
    }

    function revokeSession(id: string) {
        router.delete(`/admin/profile/sessions/${id}`);
    }

    function removeAvatar() {
        profileForm.transform((formData) => ({ ...formData, _method: 'patch', remove_avatar: true }));
        profileForm.post('/admin/profile', {
            forceFormData: true,
            onSuccess: () => window.location.assign('/admin/profile'),
        });
    }

    return (
        <AdminLayout title="Profile">
            <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="text-2xl font-bold text-navy-950">Profile</h1>

                <Card className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-navy-950">Profile information</h2>
                        <p className="mt-1 text-sm text-slate-600">Update your name, email address, and avatar.</p>
                    </div>

                    <form onSubmit={submitProfile} className="space-y-5">
                        <FormField label="Avatar" htmlFor="avatar" error={profileForm.errors.avatar}>
                            <div className="space-y-2">
                                {(profile.avatar_path || profileForm.data.avatar) && (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                profileForm.data.avatar
                                                    ? URL.createObjectURL(profileForm.data.avatar)
                                                    : (profile.avatar_path as string)
                                            }
                                            alt="Avatar preview"
                                            className="h-12 w-12 rounded-full border border-slate-200 bg-white object-cover"
                                        />
                                        <span className="text-xs text-slate-500">
                                            {profileForm.data.avatar ? 'New avatar selected' : 'Current avatar'}
                                        </span>
                                        {profile.avatar_path && !profileForm.data.avatar && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={profileForm.processing}
                                                onClick={removeAvatar}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                        {profileForm.data.avatar && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => profileForm.setData('avatar', null)}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                )}
                                <input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        profileForm.setData('avatar', e.target.files?.[0] ?? null)
                                    }
                                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
                                />
                            </div>
                        </FormField>

                        <FormField label="Full name" htmlFor="name" error={profileForm.errors.name}>
                            <TextInput
                                id="name"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                required
                            />
                        </FormField>

                        <FormField label="Email" htmlFor="email" error={profileForm.errors.email}>
                            <TextInput
                                id="email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                required
                            />
                        </FormField>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={profileForm.processing}>
                                Save profile
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-navy-950">Change password</h2>
                        <p className="mt-1 text-sm text-slate-600">Use a strong, unique password for your account.</p>
                    </div>

                    <form onSubmit={submitPassword} className="space-y-5">
                        <FormField
                            label="Current password"
                            htmlFor="current_password"
                            error={passwordForm.errors.current_password}
                        >
                            <div className="relative">
                                <TextInput
                                    id="current_password"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                                >
                                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </FormField>

                        <FormField label="New password" htmlFor="password" error={passwordForm.errors.password}>
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showNew ? 'text' : 'password'}
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    aria-label={showNew ? 'Hide password' : 'Show password'}
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </FormField>

                        <FormField
                            label="Confirm new password"
                            htmlFor="password_confirmation"
                            error={passwordForm.errors.password_confirmation}
                        >
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </FormField>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={passwordForm.processing}>
                                <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
                                Update password
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-navy-950">Passkeys</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Passkeys let you sign in with your device&apos;s biometrics or PIN instead of a password.
                        </p>
                    </div>

                    {!webauthnAvailable && (
                        <Alert variant="info">Your browser does not support passkeys (WebAuthn).</Alert>
                    )}
                    {passkeyError && <Alert variant="danger">{passkeyError}</Alert>}

                    {passkeys.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {passkeys.map((passkey) => (
                                <li key={passkey.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <Fingerprint className="h-5 w-5 text-teal-600" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{passkey.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Added {formatDateTime(passkey.created_at)} · Last used{' '}
                                                {formatDateTime(passkey.last_used_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deletePasskey(passkey.id)}
                                        aria-label={`Remove passkey ${passkey.name}`}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500">No passkeys registered yet.</p>
                    )}

                    {webauthnAvailable && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <FormField label="Passkey name" htmlFor="passkey_name" className="flex-1" hideLabel>
                                <TextInput
                                    id="passkey_name"
                                    value={passkeyName}
                                    onChange={(e) => setPasskeyName(e.target.value)}
                                    placeholder="e.g. MacBook Touch ID"
                                    aria-label="Passkey name"
                                />
                            </FormField>
                            <Button type="button" onClick={addPasskey} disabled={passkeyBusy}>
                                <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
                                {passkeyBusy ? 'Waiting for device…' : 'Add passkey'}
                            </Button>
                        </div>
                    )}
                </Card>

                {sessions.length > 0 && (
                    <Card className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-navy-950">Sessions</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Devices and browsers currently signed in to your account.
                            </p>
                        </div>

                        <ul className="divide-y divide-slate-100">
                            {sessions.map((session) => (
                                <li key={session.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <Monitor className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {session.is_current ? 'This device' : 'Other device'}
                                                {session.ip_address && (
                                                    <span className="ml-2 text-xs text-slate-500">
                                                        {session.ip_address}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="max-w-md truncate text-xs text-slate-500">
                                                {session.user_agent ?? 'Unknown device'} · Last active{' '}
                                                {formatTimestamp(session.last_activity)}
                                            </p>
                                        </div>
                                    </div>
                                    {!session.is_current && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => revokeSession(session.id)}
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return 'Never';
    }

    return new Date(value).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatTimestamp(value: number): string {
    return new Date(value * 1000).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
