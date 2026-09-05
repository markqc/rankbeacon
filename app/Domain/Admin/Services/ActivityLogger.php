<?php

namespace App\Domain\Admin\Services;

use App\Domain\Admin\Services\Privacy\SensitiveValueSanitizer;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityLogger
{
    private readonly SensitiveValueSanitizer $sanitizer;

    public function __construct(
        private readonly Request $request,
    ) {
        $this->sanitizer = new SensitiveValueSanitizer;
    }

    public function log(string $event, string $module, string $description, ?User $actor = null, ?object $subject = null, array $metadata = []): ActivityLog
    {
        return ActivityLog::create([
            'actor_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'actor_email' => $actor?->email,
            'event' => $event,
            'description' => $description,
            'module' => $module,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject ? $subject->id : null,
            'method' => $this->request->getMethod(),
            'url' => $this->request->fullUrl(),
            'ip_address' => $this->anonymizeIp($this->request->ip()),
            'user_agent' => $this->request->userAgent(),
            'metadata' => $this->sanitizer->redact($metadata),
            'request_id' => $this->requestId(),
            'created_at' => now(),
        ]);
    }

    public function logLoginSuccess(User $user): ActivityLog
    {
        return $this->log('login', 'auth', 'User logged in successfully.', $user, $user);
    }

    public function logLoginFailure(?string $email = null, array $metadata = []): ActivityLog
    {
        $metadata['email'] = $email;

        return $this->log('failed_login', 'auth', 'Login attempt failed.', null, null, $metadata);
    }

    public function logLogout(User $user): ActivityLog
    {
        return $this->log('logout', 'auth', 'User logged out.', $user, $user);
    }

    public function logPasswordChanged(User $user): ActivityLog
    {
        return $this->log('password_changed', 'auth', 'User changed their password.', $user, $user);
    }

    public function logAdminPageView(User $user, string $path): ActivityLog
    {
        return $this->log('page_view', 'admin', "Viewed {$path}", $user, null, ['path' => $path]);
    }

    public function logDeniedAction(User $user, string $description): ActivityLog
    {
        return $this->log('denied', 'admin', $description, $user);
    }

    public function logUserCreated(User $actor, User $subject, array $metadata = []): ActivityLog
    {
        return $this->log('user_created', 'users', "Created user {$subject->email}", $actor, $subject, $metadata);
    }

    public function logUserUpdated(User $actor, User $subject, array $metadata = []): ActivityLog
    {
        return $this->log('user_updated', 'users', "Updated user {$subject->email}", $actor, $subject, $metadata);
    }

    public function logUserRoleChanged(User $actor, User $subject, array $metadata = []): ActivityLog
    {
        return $this->log('user_role_changed', 'users', "Changed role for {$subject->email}", $actor, $subject, $metadata);
    }

    public function logUserActivated(User $actor, User $subject): ActivityLog
    {
        return $this->log('user_activated', 'users', "Activated user {$subject->email}", $actor, $subject);
    }

    public function logUserDeactivated(User $actor, User $subject): ActivityLog
    {
        return $this->log('user_deactivated', 'users', "Deactivated user {$subject->email}", $actor, $subject);
    }

    public function logUserPasswordReset(User $actor, User $subject): ActivityLog
    {
        return $this->log('user_password_reset', 'users', "Reset password for {$subject->email}", $actor, $subject);
    }

    public function logUserDeleted(User $actor, User $subject): ActivityLog
    {
        return $this->log('user_deleted', 'users', "Deleted user {$subject->email}", $actor, $subject);
    }

    public function logSettingChanged(User $actor, string $group, array $metadata = []): ActivityLog
    {
        return $this->log('setting_changed', 'settings', "Changed {$group} settings", $actor, null, $metadata);
    }

    public function logMailTest(User $actor, bool $success, array $metadata = []): ActivityLog
    {
        $description = $success ? 'Sent a test email successfully.' : 'Test email failed.';

        return $this->log('mail_test', 'settings', $description, $actor, null, $metadata);
    }

    public function logAnalyticsConfigurationChanged(User $actor, array $metadata = []): ActivityLog
    {
        return $this->log('analytics_configuration_changed', 'analytics', 'Changed analytics configuration.', $actor, null, $metadata);
    }

    public function logAnalyticsDataPurge(User $actor, array $metadata = []): ActivityLog
    {
        return $this->log('analytics_data_purge', 'analytics', 'Purged analytics data.', $actor, null, $metadata);
    }

    public function logAnalyticsDataExport(User $actor, array $metadata = []): ActivityLog
    {
        return $this->log('analytics_data_export', 'analytics', 'Exported analytics data.', $actor, null, $metadata);
    }

    private function requestId(): string
    {
        $existing = $this->request->attributes->get('activity_request_id');

        if ($existing !== null) {
            return $existing;
        }

        $id = (string) Str::uuid();
        $this->request->attributes->set('activity_request_id', $id);

        return $id;
    }

    private function anonymizeIp(?string $ip): ?string
    {
        if ($ip === null || $ip === '') {
            return null;
        }

        if (Str::contains($ip, ':')) {
            return $this->anonymizeIPv6($ip);
        }

        return $this->anonymizeIPv4($ip);
    }

    private function anonymizeIPv4(string $ip): string
    {
        $parts = explode('.', $ip);

        if (count($parts) !== 4 || ! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return $ip;
        }

        $parts[3] = '0';

        return implode('.', $parts);
    }

    private function anonymizeIPv6(string $ip): string
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            return $ip;
        }

        $binary = inet_pton($ip);

        if ($binary === false) {
            return $ip;
        }

        $bytes = unpack('C*', $binary);
        $length = count($bytes);

        for ($i = max(1, $length - 7); $i <= $length; $i++) {
            $bytes[$i] = 0;
        }

        $packed = pack('C*', ...$bytes);

        return inet_ntop($packed) ?: $ip;
    }
}
