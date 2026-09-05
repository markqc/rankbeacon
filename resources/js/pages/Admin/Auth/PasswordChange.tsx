import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Alert from '../../../components/Alert';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import TextInput from '../../../components/TextInput';
import AdminLayout from '../../../layouts/AdminLayout';

export default function PasswordChange() {
    const { data, setData, patch, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        patch('/admin/password/change');
    }

    return (
        <AdminLayout title="Change Password">
            <div className="mx-auto max-w-lg">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-navy-950">Change your password</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Your account requires a new password before you can continue.
                    </p>

                    {(errors.current_password || errors.password || errors.password_confirmation) && (
                        <div className="mt-4">
                            <Alert variant="danger">
                                {errors.current_password || errors.password || errors.password_confirmation}
                            </Alert>
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <FormField
                            label="Current password"
                            htmlFor="current_password"
                            error={errors.current_password}
                            required
                        >
                            <div className="relative">
                                <TextInput
                                    id="current_password"
                                    type={showCurrent ? 'text' : 'password'}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((show) => !show)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                                    aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                                >
                                    {showCurrent ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </FormField>

                        <FormField label="New password" htmlFor="password" error={errors.password} required>
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showNew ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((show) => !show)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                                >
                                    {showNew ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </FormField>

                        <FormField
                            label="Confirm new password"
                            htmlFor="password_confirmation"
                            error={errors.password_confirmation}
                            required
                        >
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </FormField>

                        <Button type="submit" disabled={processing} aria-busy={processing}>
                            {processing ? 'Changing password…' : 'Change password'}
                        </Button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
