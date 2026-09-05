<?php

namespace App\Domain\Admin\Services;

use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class SettingsService
{
    private const string CACHE_PREFIX = 'app.settings.';

    private const array SENSITIVE_KEYS = [
        'mail_password',
        'smtp_password',
        'api_key',
        'mailgun_secret',
        'postmark_token',
        'analytics_google_tag',
        'smtp2go_api_key',
    ];

    public function get(string $key, mixed $default = null): mixed
    {
        $value = Cache::rememberForever($this->cacheKey($key), function () use ($key, $default) {
            $setting = Setting::where('key', $key)->first();

            if ($setting === null) {
                return $default;
            }

            return $this->decodeValue($setting);
        });

        return $value === null ? $default : $value;
    }

    public function set(string $key, mixed $value, string $group = 'general'): Setting
    {
        $shouldEncrypt = $this->isSensitive($key);

        $storedValue = $value;
        if ($shouldEncrypt && is_string($value) && $value !== '') {
            $storedValue = Crypt::encryptString($value);
        }

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $this->serializeValue($storedValue),
                'group' => $group,
                'is_encrypted' => $shouldEncrypt,
                'updated_at' => now(),
            ]
        );

        Cache::forget($this->cacheKey($key));
        Cache::forget($this->groupCacheKey($group));

        return $setting;
    }

    /**
     * @return Collection<int, Setting>
     */
    public function group(string $group): Collection
    {
        return Setting::where('group', $group)->orderBy('key')->get();
    }

    /**
     * @param  array<int, string>  $groups
     * @return array<string, array<string, mixed>>
     */
    public function grouped(array $groups): array
    {
        $result = [];

        foreach ($groups as $group) {
            $result[$group] = [];
        }

        $settings = Setting::whereIn('group', $groups)
            ->orderBy('key')
            ->get();

        foreach ($settings as $setting) {
            $result[$setting->group][$setting->key] = $this->decodeValue($setting);
        }

        return $result;
    }

    public function forget(string $key, string $group = 'general'): void
    {
        Setting::where('key', $key)->delete();
        Cache::forget($this->cacheKey($key));
        Cache::forget($this->groupCacheKey($group));
    }

    private function cacheKey(string $key): string
    {
        return self::CACHE_PREFIX.$key;
    }

    private function groupCacheKey(string $group): string
    {
        return self::CACHE_PREFIX.'group.'.$group;
    }

    private function isSensitive(string $key): bool
    {
        return in_array($key, self::SENSITIVE_KEYS, true);
    }

    private function serializeValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }

    private function decodeValue(Setting $setting): mixed
    {
        $value = $setting->value;

        if ($setting->is_encrypted && is_string($value) && $value !== '') {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception) {
                return $value;
            }
        }

        $decoded = json_decode((string) $value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
