import { router, useForm, usePage } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import FormField from '../../../components/FormField';
import TextInput from '../../../components/TextInput';
import AdminLayout from '../../../layouts/AdminLayout';
import type { PageProps, SiteSettings } from '../../../types';

interface SettingsPageProps extends PageProps {
    settings: SiteSettings;
}

type Tab = 'general' | 'branding' | 'social' | 'mail' | 'analytics';

const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'branding', label: 'Branding' },
    { key: 'social', label: 'Social' },
    { key: 'mail', label: 'Mail' },
    { key: 'analytics', label: 'Analytics' },
];

export default function Edit() {
    const { settings } = usePage<SettingsPageProps>().props;
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const { data, setData, transform, post, processing, errors, reset } = useForm<{
        settings: SiteSettings;
        logo: File | null;
        favicon: File | null;
        remove_logo: boolean;
        remove_favicon: boolean;
    }>({
        settings,
        logo: null,
        favicon: null,
        remove_logo: false,
        remove_favicon: false,
    });

    function updateSetting(group: keyof SiteSettings, key: string, value: string) {
        setData('settings', {
            ...data.settings,
            [group]: {
                ...data.settings[group],
                [key]: value,
            },
        });
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        transform((formData) => ({
            ...formData,
            _method: 'patch',
            remove_logo: false,
            remove_favicon: false,
        }));
        post('/admin/settings', {
            forceFormData: true,
            onSuccess: () => window.location.assign('/admin/settings'),
        });
    }

    function removeImage(field: 'logo' | 'favicon') {
        transform((formData) => ({
            ...formData,
            _method: 'patch',
            remove_logo: field === 'logo' ? true : formData.remove_logo,
            remove_favicon: field === 'favicon' ? true : formData.remove_favicon,
        }));
        post('/admin/settings', {
            forceFormData: true,
            onSuccess: () => window.location.assign('/admin/settings'),
        });
    }

    function sendTestEmail() {
        router.post('/admin/settings/test-email');
    }

    return (
        <AdminLayout title="Settings">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-navy-950">Settings</h1>
                    <Button type="button" variant="outline" onClick={sendTestEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send test email
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Settings tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                                        activeTab === tab.key
                                            ? 'border-teal-500 text-teal-600'
                                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                                    aria-current={activeTab === tab.key ? 'page' : undefined}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {activeTab === 'general' && (
                        <Card className="space-y-4">
                            <h2 className="text-lg font-semibold text-navy-950">General</h2>
                            <FormField
                                label="Site name"
                                htmlFor="site_name"
                                error={errors['settings.general.site_name']}
                            >
                                <TextInput
                                    id="site_name"
                                    value={data.settings.general.site_name ?? ''}
                                    onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                                />
                            </FormField>
                            <FormField
                                label="Tagline"
                                htmlFor="site_tagline"
                                error={errors['settings.general.site_tagline']}
                            >
                                <TextInput
                                    id="site_tagline"
                                    value={data.settings.general.site_tagline ?? ''}
                                    onChange={(e) => updateSetting('general', 'site_tagline', e.target.value)}
                                />
                            </FormField>
                            <FormField
                                label="Description"
                                htmlFor="site_description"
                                error={errors['settings.general.site_description']}
                            >
                                <textarea
                                    id="site_description"
                                    value={data.settings.general.site_description ?? ''}
                                    onChange={(e) => updateSetting('general', 'site_description', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-md border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </FormField>
                            <FormField
                                label="Contact email"
                                htmlFor="contact_email"
                                error={errors['settings.general.contact_email']}
                            >
                                <TextInput
                                    id="contact_email"
                                    type="email"
                                    value={data.settings.general.contact_email ?? ''}
                                    onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                                />
                            </FormField>
                            <FormField
                                label="Support email"
                                htmlFor="support_email"
                                error={errors['settings.general.support_email']}
                            >
                                <TextInput
                                    id="support_email"
                                    type="email"
                                    value={data.settings.general.support_email ?? ''}
                                    onChange={(e) => updateSetting('general', 'support_email', e.target.value)}
                                />
                            </FormField>
                        </Card>
                    )}

                    {activeTab === 'branding' && (
                        <Card className="space-y-4">
                            <h2 className="text-lg font-semibold text-navy-950">Branding</h2>
                            <FormField
                                label="Primary color"
                                htmlFor="primary_color"
                                error={errors['settings.branding.primary_color']}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        id="primary_color"
                                        type="color"
                                        value={data.settings.branding.primary_color ?? '#0f172a'}
                                        onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                                        className="h-10 w-16 rounded-md border border-slate-300"
                                    />
                                    <TextInput
                                        value={data.settings.branding.primary_color ?? ''}
                                        onChange={(e) => updateSetting('branding', 'primary_color', e.target.value)}
                                        placeholder="#0f172a"
                                        className="flex-1"
                                    />
                                </div>
                            </FormField>
                            <FormField label="Logo" htmlFor="logo" error={errors.logo}>
                                <div className="space-y-2">
                                    {(data.settings.branding.logo_path || data.logo) && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    data.logo
                                                        ? URL.createObjectURL(data.logo)
                                                        : (data.settings.branding.logo_path as string)
                                                }
                                                alt="Logo preview"
                                                className="h-12 w-auto rounded border border-slate-200 bg-white object-contain"
                                            />
                                            <span className="text-xs text-slate-500">
                                                {data.logo ? 'New logo selected' : 'Current logo'}
                                            </span>
                                            {data.settings.branding.logo_path && !data.logo && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={processing}
                                                    onClick={() => removeImage('logo')}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                            {data.logo && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setData('logo', null)}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setData('logo', e.target.files?.[0] ?? null)
                                        }
                                        className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
                                    />
                                </div>
                            </FormField>
                            <FormField label="Favicon" htmlFor="favicon" error={errors.favicon}>
                                <div className="space-y-2">
                                    {(data.settings.branding.favicon_path || data.favicon) && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    data.favicon
                                                        ? URL.createObjectURL(data.favicon)
                                                        : (data.settings.branding.favicon_path as string)
                                                }
                                                alt="Favicon preview"
                                                className="h-8 w-8 rounded border border-slate-200 bg-white object-contain"
                                            />
                                            <span className="text-xs text-slate-500">
                                                {data.favicon ? 'New favicon selected' : 'Current favicon'}
                                            </span>
                                            {data.settings.branding.favicon_path && !data.favicon && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={processing}
                                                    onClick={() => removeImage('favicon')}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                            {data.favicon && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setData('favicon', null)}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        id="favicon"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setData('favicon', e.target.files?.[0] ?? null)
                                        }
                                        className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
                                    />
                                </div>
                            </FormField>
                        </Card>
                    )}

                    {activeTab === 'social' && (
                        <Card className="space-y-4">
                            <h2 className="text-lg font-semibold text-navy-950">Social links</h2>
                            {(
                                ['facebook_url', 'twitter_url', 'linkedin_url', 'instagram_url', 'youtube_url'] as const
                            ).map((key) => (
                                <FormField
                                    key={key}
                                    label={labelForKey(key)}
                                    htmlFor={key}
                                    error={errors[`settings.social.${key}`]}
                                >
                                    <TextInput
                                        id={key}
                                        type="url"
                                        value={(data.settings.social[key] as string) ?? ''}
                                        onChange={(e) => updateSetting('social', key, e.target.value)}
                                    />
                                </FormField>
                            ))}
                        </Card>
                    )}

                    {activeTab === 'mail' && (
                        <Card className="space-y-4">
                            <h2 className="text-lg font-semibold text-navy-950">Mail</h2>
                            <FormField label="Mode" htmlFor="mail_mode" error={errors['settings.mail.mail_mode']}>
                                <select
                                    id="mail_mode"
                                    value={data.settings.mail.mail_mode ?? 'environment'}
                                    onChange={(e) => updateSetting('mail', 'mail_mode', e.target.value)}
                                    className="w-full rounded-md border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="environment">Environment (.env)</option>
                                    <option value="local">Local / Log</option>
                                    <option value="smtp">SMTP</option>
                                    <option value="smtp2go_api">SMTP2GO API</option>
                                </select>
                            </FormField>
                            {data.settings.mail.mail_mode === 'smtp' && (
                                <>
                                    <FormField
                                        label="Host"
                                        htmlFor="mail_host"
                                        error={errors['settings.mail.mail_host']}
                                    >
                                        <TextInput
                                            id="mail_host"
                                            value={(data.settings.mail.mail_host as string) ?? ''}
                                            onChange={(e) => updateSetting('mail', 'mail_host', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Port"
                                        htmlFor="mail_port"
                                        error={errors['settings.mail.mail_port']}
                                    >
                                        <TextInput
                                            id="mail_port"
                                            type="number"
                                            value={(data.settings.mail.mail_port as number) ?? ''}
                                            onChange={(e) => updateSetting('mail', 'mail_port', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Username"
                                        htmlFor="mail_username"
                                        error={errors['settings.mail.mail_username']}
                                    >
                                        <TextInput
                                            id="mail_username"
                                            value={(data.settings.mail.mail_username as string) ?? ''}
                                            onChange={(e) => updateSetting('mail', 'mail_username', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Password"
                                        htmlFor="mail_password"
                                        error={errors['settings.mail.mail_password']}
                                    >
                                        <TextInput
                                            id="mail_password"
                                            type="password"
                                            value={(data.settings.mail.mail_password as string) ?? ''}
                                            onChange={(e) => updateSetting('mail', 'mail_password', e.target.value)}
                                        />
                                    </FormField>
                                    <FormField
                                        label="Encryption"
                                        htmlFor="mail_encryption"
                                        error={errors['settings.mail.mail_encryption']}
                                    >
                                        <select
                                            id="mail_encryption"
                                            value={data.settings.mail.mail_encryption ?? ''}
                                            onChange={(e) => updateSetting('mail', 'mail_encryption', e.target.value)}
                                            className="w-full rounded-md border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">None</option>
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                        </select>
                                    </FormField>
                                </>
                            )}
                            {data.settings.mail.mail_mode === 'smtp2go_api' && (
                                <FormField
                                    label="SMTP2GO API key"
                                    htmlFor="smtp2go_api_key"
                                    error={errors['settings.mail.smtp2go_api_key']}
                                >
                                    <TextInput
                                        id="smtp2go_api_key"
                                        type="password"
                                        value={(data.settings.mail.smtp2go_api_key as string) ?? ''}
                                        onChange={(e) => updateSetting('mail', 'smtp2go_api_key', e.target.value)}
                                    />
                                </FormField>
                            )}
                            <FormField
                                label="Timeout"
                                htmlFor="mail_timeout"
                                error={errors['settings.mail.mail_timeout']}
                            >
                                <TextInput
                                    id="mail_timeout"
                                    type="number"
                                    value={(data.settings.mail.mail_timeout as number) ?? ''}
                                    onChange={(e) => updateSetting('mail', 'mail_timeout', e.target.value)}
                                />
                            </FormField>
                            <FormField
                                label="From address"
                                htmlFor="mail_from_address"
                                error={errors['settings.mail.mail_from_address']}
                            >
                                <TextInput
                                    id="mail_from_address"
                                    type="email"
                                    value={(data.settings.mail.mail_from_address as string) ?? ''}
                                    onChange={(e) => updateSetting('mail', 'mail_from_address', e.target.value)}
                                />
                            </FormField>
                            <FormField
                                label="From name"
                                htmlFor="mail_from_name"
                                error={errors['settings.mail.mail_from_name']}
                            >
                                <TextInput
                                    id="mail_from_name"
                                    value={(data.settings.mail.mail_from_name as string) ?? ''}
                                    onChange={(e) => updateSetting('mail', 'mail_from_name', e.target.value)}
                                />
                            </FormField>
                        </Card>
                    )}

                    {activeTab === 'analytics' && (
                        <Card className="space-y-4">
                            <h2 className="text-lg font-semibold text-navy-950">Analytics</h2>
                            <FormField
                                label="Google Tag ID"
                                htmlFor="analytics_google_tag"
                                error={errors['settings.analytics.analytics_google_tag']}
                            >
                                <TextInput
                                    id="analytics_google_tag"
                                    value={data.settings.analytics.analytics_google_tag ?? ''}
                                    onChange={(e) => updateSetting('analytics', 'analytics_google_tag', e.target.value)}
                                    placeholder="G-XXXXXXXX"
                                />
                            </FormField>
                        </Card>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save settings
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function labelForKey(key: string): string {
    return key
        .replace(/_url$/, '')
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
