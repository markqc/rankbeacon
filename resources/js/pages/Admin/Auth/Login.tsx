import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useState } from 'react';
import Alert from '../../../components/Alert';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import TextInput from '../../../components/TextInput';
import Lighthouse from '../../../components/icons/Lighthouse';
import { useFavicon } from '../../../hooks/useFavicon';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { authenticateWithPasskey, isWebAuthnSupported } from '../../../features/passkeys';
import type { PageProps } from '../../../types';

export default function Login() {
    const { branding } = usePage<PageProps>().props;
    useFavicon(branding.favicon_path);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passkeyBusy, setPasskeyBusy] = useState(false);
    const [passkeyError, setPasskeyError] = useState<string | null>(null);
    const webauthnAvailable = isWebAuthnSupported();
    useScrollReveal();

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post('/admin/login');
    }

    async function signInWithPasskey() {
        setPasskeyError(null);
        setPasskeyBusy(true);
        try {
            const credential = await authenticateWithPasskey('/admin/login/passkey/options');
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const res = await fetch('/admin/login/passkey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ credential }),
            });
            if (res.ok) {
                window.location.assign('/admin/dashboard');
                return;
            }
            const json = (await res.json().catch(() => null)) as {
                errors?: { credential?: string[] };
            } | null;
            setPasskeyError(json?.errors?.credential?.[0] ?? 'Passkey sign-in failed.');
        } catch (error) {
            setPasskeyError(error instanceof Error ? error.message : 'Passkey sign-in failed.');
        } finally {
            setPasskeyBusy(false);
        }
    }

    return (
        <>
            <Head title={`Sign In — ${branding.site_name} Admin`} />
            <div className="flex min-h-screen flex-col-reverse bg-white lg:flex-row">
                <div className="relative flex flex-1 flex-col justify-center bg-slate-50 p-8 lg:p-12">
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                        <svg
                            className="absolute -left-16 -top-16 h-96 w-96 text-teal-200"
                            viewBox="0 0 200 200"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <circle cx="100" cy="100" r="90" />
                        </svg>
                        <svg
                            className="absolute -bottom-20 -right-20 h-80 w-80 text-blue-100"
                            viewBox="0 0 200 200"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <circle cx="100" cy="100" r="80" />
                        </svg>
                    </div>

                    <div className="relative z-10 mx-auto max-w-md">
                        <div className="mb-8 flex items-center gap-3">
                            <Lighthouse className="h-12 w-12" />
                            <div>
                                <h2 className="text-2xl font-bold text-navy-950">{branding.site_name}</h2>
                                <p className="text-sm text-slate-500">{branding.tagline}</p>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-navy-950 lg:text-4xl">Administration</h1>
                        <p className="mt-4 text-slate-600">
                            Manage SEO tools, review analytics, and configure your RankBeacon account from one place.
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-sm">
                        <div data-reveal="true" className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-xl font-semibold text-navy-950">Sign in</h2>
                            <p className="mt-1 text-sm text-slate-500">Enter your email and password to continue.</p>

                            {errors.email && !errors.password && (
                                <div className="mt-4">
                                    <Alert variant="danger">{errors.email}</Alert>
                                </div>
                            )}

                            <form onSubmit={submit} className="mt-6 space-y-5">
                                <FormField label="Email" htmlFor="email" error={errors.email} required>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="email"
                                        autoFocus
                                        required
                                    />
                                </FormField>

                                <FormField label="Password" htmlFor="password" error={errors.password} required>
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            autoComplete="current-password"
                                            required
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((show) => !show)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" aria-hidden="true" />
                                            ) : (
                                                <Eye className="h-4 w-4" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                </FormField>

                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    Remember me
                                </label>

                                <Button type="submit" className="w-full" disabled={processing} aria-busy={processing}>
                                    {processing ? 'Signing in…' : 'Sign in'}
                                </Button>
                            </form>

                            {webauthnAvailable && (
                                <div className="mt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-slate-500">or</span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4 w-full"
                                        disabled={passkeyBusy}
                                        onClick={signInWithPasskey}
                                        aria-busy={passkeyBusy}
                                    >
                                        <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
                                        {passkeyBusy ? 'Waiting for passkey…' : 'Sign in with a passkey'}
                                    </Button>
                                    {passkeyError && (
                                        <p className="mt-2 text-center text-xs text-red-600">{passkeyError}</p>
                                    )}
                                    <div className="mt-4 text-center">
                                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
                                            Go to landing page
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
