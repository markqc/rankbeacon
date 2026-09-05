<?php

namespace App\Domain\Admin\Services;

use Illuminate\Support\Facades\Config;

class MailSettingsService
{
    public function __construct(private readonly SettingsService $settings) {}

    public function apply(): void
    {
        $mode = $this->settings->get('mail_mode', 'environment');

        if ($mode === 'environment') {
            return;
        }

        $this->applyFromSettings();

        match ($mode) {
            'local' => $this->applyLocal(),
            'smtp' => $this->applySmtp(),
            'smtp2go_api' => $this->applySmtp2go(),
            default => null,
        };
    }

    private function applyFromSettings(): void
    {
        $fromAddress = $this->settings->get('mail_from_address');
        $fromName = $this->settings->get('mail_from_name');

        if ($fromAddress !== null || $fromName !== null) {
            Config::set('mail.from', [
                'address' => $fromAddress ?: Config::get('mail.from.address'),
                'name' => $fromName ?: Config::get('mail.from.name'),
            ]);
        }
    }

    private function applyLocal(): void
    {
        Config::set('mail.default', 'log');
    }

    private function applySmtp(): void
    {
        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $this->settings->get('mail_host') ?: Config::get('mail.mailers.smtp.host'),
            'port' => (int) ($this->settings->get('mail_port') ?: Config::get('mail.mailers.smtp.port')),
            'encryption' => $this->settings->get('mail_encryption') ?? Config::get('mail.mailers.smtp.encryption'),
            'username' => $this->settings->get('mail_username') ?: Config::get('mail.mailers.smtp.username'),
            'password' => $this->settings->get('mail_password') ?: Config::get('mail.mailers.smtp.password'),
            'timeout' => (int) ($this->settings->get('mail_timeout') ?: Config::get('mail.mailers.smtp.timeout')),
            'local_domain' => Config::get('mail.mailers.smtp.local_domain'),
        ]);
    }

    private function applySmtp2go(): void
    {
        $apiKey = $this->settings->get('smtp2go_api_key');

        Config::set('mail.default', 'smtp2go');
        Config::set('mail.mailers.smtp2go', [
            'transport' => 'smtp',
            'host' => 'mail.smtp2go.com',
            'port' => 587,
            'encryption' => 'tls',
            'username' => $this->settings->get('mail_from_address') ?: '',
            'password' => $apiKey ?: '',
            'timeout' => (int) ($this->settings->get('mail_timeout') ?: 30),
        ]);
    }
}
