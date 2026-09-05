<?php

namespace Tests\Feature\Admin\Settings;

use App\Domain\Admin\Services\MailSettingsService;
use App\Domain\Admin\Services\SettingsService;
use App\Mail\Admin\TestMail;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_settings_page_requires_admin(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/settings');

        $response->assertForbidden();
    }

    public function test_admin_can_view_settings(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->get('/admin/settings');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Admin/Settings/Edit'));
    }

    public function test_admin_can_save_general_settings(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->patch('/admin/settings', [
            'settings' => [
                'general' => [
                    'site_name' => 'RankBeacon Pro',
                    'site_tagline' => 'Better SERP tools',
                    'site_description' => 'Description',
                    'contact_email' => 'contact@example.com',
                    'support_email' => 'support@example.com',
                ],
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('settings', ['key' => 'site_name', 'value' => 'RankBeacon Pro']);
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'setting_changed',
            'module' => 'settings',
            'actor_id' => $admin->id,
        ]);
    }

    public function test_settings_can_be_saved_with_spoofed_post(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->post('/admin/settings', [
            '_method' => 'patch',
            'settings' => [
                'general' => [
                    'site_name' => 'RankBeacon Pro',
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('settings', ['key' => 'site_name', 'value' => 'RankBeacon Pro']);
    }

    public function test_favicon_upload_is_resized_to_preferred_dimension(): void
    {
        Storage::fake('public');
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->post('/admin/settings', [
            '_method' => 'patch',
            'favicon' => UploadedFile::fake()->image('favicon.png', 1024, 1024),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $faviconPath = Setting::where('key', 'favicon_path')->first()?->value;
        $this->assertNotNull($faviconPath);

        $path = ltrim(str_replace('/storage/', '', (string) parse_url($faviconPath, PHP_URL_PATH)), '/');
        Storage::disk('public')->assertExists($path);

        $image = Image::decode(Storage::disk('public')->get($path));
        $this->assertLessThanOrEqual(512, $image->width());
        $this->assertLessThanOrEqual(512, $image->height());
    }

    public function test_favicon_can_be_removed(): void
    {
        Storage::fake('public');
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)->post('/admin/settings', [
            '_method' => 'patch',
            'favicon' => UploadedFile::fake()->image('favicon.png', 1024, 1024),
        ]);

        $faviconUrl = Setting::where('key', 'favicon_path')->first()?->value;
        $this->assertNotNull($faviconUrl);
        $path = ltrim(str_replace('/storage/', '', (string) parse_url($faviconUrl, PHP_URL_PATH)), '/');
        Storage::disk('public')->assertExists($path);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            '_method' => 'patch',
            'remove_favicon' => true,
        ]);

        $response->assertRedirect();
        $this->assertNull(Setting::where('key', 'favicon_path')->first()?->value);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_sensitive_mail_password_is_encrypted(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)->patch('/admin/settings', [
            'settings' => [
                'mail' => [
                    'mail_password' => 'secret-password',
                ],
            ],
        ]);

        $this->assertDatabaseMissing('settings', ['value' => 'secret-password']);

        $service = app(SettingsService::class);
        $this->assertSame('secret-password', $service->get('mail_password'));
    }

    public function test_secret_values_are_masked_in_frontend_props(): void
    {
        $admin = User::factory()->superAdmin()->create();
        app(SettingsService::class)->set('mail_password', 'super-secret', 'mail');
        app(SettingsService::class)->set('smtp2go_api_key', 'api-secret', 'mail');

        $response = $this->actingAs($admin)->get('/admin/settings');

        $response->assertInertia(fn ($page) => $page
            ->where('settings.mail.mail_password', '••••••••')
            ->where('settings.mail.smtp2go_api_key', '••••••••')
            ->whereNot('settings.mail.mail_password', 'super-secret')
            ->whereNot('settings.mail.smtp2go_api_key', 'api-secret')
        );
    }

    public function test_empty_secret_submission_preserves_existing_value(): void
    {
        $admin = User::factory()->superAdmin()->create();
        app(SettingsService::class)->set('mail_password', 'existing-secret', 'mail');

        $this->actingAs($admin)->patch('/admin/settings', [
            'settings' => [
                'mail' => [
                    'mail_mode' => 'smtp',
                    'mail_password' => '',
                ],
            ],
        ]);

        $this->assertSame('existing-secret', app(SettingsService::class)->get('mail_password'));
    }

    public function test_mail_mode_applies_runtime_configuration(): void
    {
        $service = app(MailSettingsService::class);
        app(SettingsService::class)->set('mail_mode', 'smtp', 'mail');
        app(SettingsService::class)->set('mail_host', 'smtp.example.com', 'mail');
        app(SettingsService::class)->set('mail_port', '587', 'mail');
        app(SettingsService::class)->set('mail_from_address', 'from@example.com', 'mail');

        $service->apply();

        $this->assertSame('smtp', Config::get('mail.default'));
        $this->assertSame('smtp.example.com', Config::get('mail.mailers.smtp.host'));
        $this->assertSame(587, Config::get('mail.mailers.smtp.port'));
        $this->assertSame('from@example.com', Config::get('mail.from.address'));
    }

    public function test_smtp2go_mode_configures_mailer(): void
    {
        $service = app(MailSettingsService::class);
        app(SettingsService::class)->set('mail_mode', 'smtp2go_api', 'mail');
        app(SettingsService::class)->set('smtp2go_api_key', 'key-123', 'mail');
        app(SettingsService::class)->set('mail_from_address', 'from@example.com', 'mail');

        $service->apply();

        $this->assertSame('smtp2go', Config::get('mail.default'));
        $this->assertSame('mail.smtp2go.com', Config::get('mail.mailers.smtp2go.host'));
        $this->assertSame('key-123', Config::get('mail.mailers.smtp2go.password'));
    }

    public function test_local_mode_sets_log_mailer(): void
    {
        $service = app(MailSettingsService::class);
        app(SettingsService::class)->set('mail_mode', 'local', 'mail');

        $service->apply();

        $this->assertSame('log', Config::get('mail.default'));
    }

    public function test_test_email_is_sent(): void
    {
        Mail::fake();
        $admin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($admin)->post('/admin/settings/test-email');

        $response->assertRedirect();
        $response->assertSessionHas('success');
        Mail::assertSent(TestMail::class, fn ($mail) => $mail->hasTo($admin->email));
        $this->assertDatabaseHas('activity_logs', [
            'event' => 'mail_test',
            'module' => 'settings',
        ]);
    }

    public function test_test_email_is_rate_limited(): void
    {
        Mail::fake();
        $admin = User::factory()->superAdmin()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($admin)->post('/admin/settings/test-email')->assertRedirect();
        }

        $this->actingAs($admin)->post('/admin/settings/test-email')->assertStatus(429);
    }

    public function test_settings_are_cached(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $service = app(SettingsService::class);
        $service->set('site_name', 'Cached Site', 'general');

        $this->assertSame('Cached Site', $service->get('site_name'));

        Setting::where('key', 'site_name')->update(['value' => 'Direct Update']);
        $this->assertSame('Cached Site', $service->get('site_name'));

        $service->set('site_name', 'Updated', 'general');
        $this->assertSame('Updated', $service->get('site_name'));
    }
}
