<?php

namespace App\Domain\Admin\Services\Privacy;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class SensitiveValueSanitizer
{
    /**
     * Recursively redact values whose keys indicate sensitive data.
     */
    public function redact(array $data): array
    {
        $redacted = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $redacted[$key] = $this->redact($value);

                continue;
            }

            if (is_string($key) && $this->isSensitiveKey($key)) {
                $redacted[$key] = '[REDACTED]';

                continue;
            }

            $redacted[$key] = $value;
        }

        return $redacted;
    }

    /**
     * Sanitize an incoming request payload before logging or persisting it.
     */
    public function sanitizeRequest(array $input): array
    {
        $withoutSecrets = Arr::except($input, [
            'password',
            'password_confirmation',
            'current_password',
            'remember_token',
            '_token',
        ]);

        return $this->redact($withoutSecrets);
    }

    private function isSensitiveKey(string $key): bool
    {
        $key = Str::lower($key);
        $patterns = config('admin.redacted_keys', []);

        foreach ($patterns as $pattern) {
            if (Str::contains($key, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
