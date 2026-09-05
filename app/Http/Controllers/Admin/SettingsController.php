<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\Services\ActivityLogger;
use App\Domain\Admin\Services\SettingsService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Mail\Admin\TestMail;
use App\Support\Concerns\ProcessesUploadedImages;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\Mailer\Exception\TransportException;

class SettingsController extends Controller
{
    use ProcessesUploadedImages;

    private const array MASKED_FRONTEND_KEYS = [
        'mail_password',
        'smtp2go_api_key',
    ];

    private const array FIELD_GROUPS = [
        'general' => [
            'site_name',
            'site_tagline',
            'site_description',
            'contact_email',
            'support_email',
        ],
        'branding' => [
            'primary_color',
            'logo_path',
            'favicon_path',
        ],
        'social' => [
            'facebook_url',
            'twitter_url',
            'linkedin_url',
            'instagram_url',
            'youtube_url',
        ],
        'mail' => [
            'mail_mode',
            'mail_driver',
            'mail_host',
            'mail_port',
            'mail_username',
            'mail_password',
            'mail_encryption',
            'mail_timeout',
            'mail_from_address',
            'mail_from_name',
            'smtp2go_api_key',
        ],
        'analytics' => [
            'analytics_google_tag',
        ],
    ];

    public function __construct(
        private readonly SettingsService $settings,
        private readonly ActivityLogger $logger,
    ) {}

    public function edit(Request $request): Response
    {
        $this->authorize('admin.settings.manage');

        $groups = $this->settings->grouped(array_keys(self::FIELD_GROUPS));
        $settings = $this->normalizeForFrontend($groups);

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => $settings,
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $this->authorize('admin.settings.manage');

        $input = $request->validated('settings', []);
        $changed = [];

        foreach (self::FIELD_GROUPS as $group => $keys) {
            foreach ($keys as $key) {
                if (! array_key_exists($key, $input[$group] ?? [])) {
                    continue;
                }

                $value = $input[$group][$key];

                if (in_array($key, self::MASKED_FRONTEND_KEYS, true) && blank($value)) {
                    continue;
                }

                $this->settings->set($key, $value, $group);
                $changed[] = $key;
            }
        }

        if ($request->boolean('remove_logo')) {
            $this->deleteStoredImage($this->settings->get('logo_path'), ['logos/']);
            $this->settings->set('logo_path', null, 'branding');
            $changed[] = 'logo_path';
        }

        if ($request->boolean('remove_favicon')) {
            $this->deleteStoredImage($this->settings->get('favicon_path'), ['favicons/']);
            $this->settings->set('favicon_path', null, 'branding');
            $changed[] = 'favicon_path';
        }

        if ($request->hasFile('logo')) {
            $this->deleteStoredImage($this->settings->get('logo_path'), ['logos/']);
            $path = $this->storeUploadedImage($request->file('logo'), 'logos', 1024);
            $this->settings->set('logo_path', Storage::disk('public')->url($path), 'branding');
            $changed[] = 'logo_path';
        }

        if ($request->hasFile('favicon')) {
            $this->deleteStoredImage($this->settings->get('favicon_path'), ['favicons/']);
            $path = $this->storeUploadedImage($request->file('favicon'), 'favicons', 512);
            $this->settings->set('favicon_path', Storage::disk('public')->url($path), 'branding');
            $changed[] = 'favicon_path';
        }

        $this->logger->logSettingChanged(
            $request->user(),
            'all',
            ['changed_keys' => $changed],
        );

        return redirect()->back()->with('success', 'Settings saved.');
    }

    public function sendTestEmail(Request $request): RedirectResponse
    {
        $this->authorize('admin.settings.manage');

        $key = 'test-email:'.($request->user()?->id ?: ($request->ip() ?? 'default'));

        $executed = RateLimiter::attempt($key, 5, function () use ($request): bool {
            try {
                Mail::to($request->user())->send(new TestMail($request->user()));

                return true;
            } catch (TransportException $e) {
                return false;
            }
        });

        if (! $executed) {
            throw new TooManyRequestsHttpException(
                message: 'Too many test email attempts. Please try again later.'
            );
        }

        $this->logger->logMailTest($request->user(), true);

        return redirect()->back()->with('success', 'Test email sent.');
    }

    /**
     * @param  array<string, array<string, mixed>>  $groups
     * @return array<string, array<string, mixed>>
     */
    private function normalizeForFrontend(array $groups): array
    {
        $normalized = [];

        foreach (self::FIELD_GROUPS as $group => $keys) {
            $normalized[$group] = [];
            foreach ($keys as $key) {
                $value = $groups[$group][$key] ?? null;

                if (in_array($key, self::MASKED_FRONTEND_KEYS, true) && filled($value)) {
                    $normalized[$group][$key] = '••••••••';
                } else {
                    $normalized[$group][$key] = $value;
                }
            }
        }

        return $normalized;
    }
}
