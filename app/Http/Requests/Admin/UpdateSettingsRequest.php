<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => ['sometimes', 'array'],
            'settings.general' => ['nullable', 'array'],
            'settings.general.site_name' => ['nullable', 'string', 'max:255'],
            'settings.general.site_tagline' => ['nullable', 'string', 'max:255'],
            'settings.general.site_description' => ['nullable', 'string', 'max:1000'],
            'settings.general.contact_email' => ['nullable', 'email', 'max:255'],
            'settings.general.support_email' => ['nullable', 'email', 'max:255'],
            'settings.branding' => ['nullable', 'array'],
            'settings.branding.primary_color' => ['nullable', 'string', 'max:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'settings.social' => ['nullable', 'array'],
            'settings.social.facebook_url' => ['nullable', 'url', 'max:255'],
            'settings.social.twitter_url' => ['nullable', 'url', 'max:255'],
            'settings.social.linkedin_url' => ['nullable', 'url', 'max:255'],
            'settings.social.instagram_url' => ['nullable', 'url', 'max:255'],
            'settings.social.youtube_url' => ['nullable', 'url', 'max:255'],
            'settings.mail' => ['nullable', 'array'],
            'settings.mail.mail_mode' => ['nullable', 'string', Rule::in(['environment', 'local', 'smtp', 'smtp2go_api'])],
            'settings.mail.mail_host' => ['nullable', 'string', 'max:255'],
            'settings.mail.mail_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'settings.mail.mail_username' => ['nullable', 'string', 'max:255'],
            'settings.mail.mail_password' => ['nullable', 'string', 'max:255'],
            'settings.mail.mail_encryption' => ['nullable', 'string', Rule::in(['tls', 'ssl', ''])],
            'settings.mail.mail_timeout' => ['nullable', 'integer', 'min:1', 'max:120'],
            'settings.mail.mail_from_address' => ['nullable', 'email', 'max:255'],
            'settings.mail.mail_from_name' => ['nullable', 'string', 'max:255'],
            'settings.mail.smtp2go_api_key' => ['nullable', 'string', 'max:255'],
            'settings.analytics' => ['nullable', 'array'],
            'settings.analytics.analytics_google_tag' => ['nullable', 'string', 'max:255', 'regex:/^G-[A-Z0-9]+$/i'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg,gif,webp', 'max:2048'],
            'favicon' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg,webp', 'max:1024'],
            'remove_logo' => ['nullable', 'boolean'],
            'remove_favicon' => ['nullable', 'boolean'],
        ];
    }
}
