<?php

namespace App\Providers;

use App\Domain\Admin\Services\MailSettingsService;
use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;
use App\Domain\SeoTools\Services\PublicDnsResolver;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(DnsResolverInterface::class, PublicDnsResolver::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('serp-fetch', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip() ?? 'default');
        });

        RateLimiter::for('admin-login', function (Request $request) {
            $key = Str::transliterate(Str::lower($request->input('email', '').'|'.$request->ip()));

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('analytics-event', function (Request $request) {
            return Limit::perMinute(60)->by(session()->getId() ?: ($request->ip() ?? 'default'));
        });

        RateLimiter::for('test-email', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: ($request->ip() ?? 'default'));
        });

        Queue::before(function (JobProcessing $event) {
            app(MailSettingsService::class)->apply();
        });

        $this->defineGates();
    }

    private function defineGates(): void
    {
        Gate::before(fn (User $user) => $user->hasRole('super_admin') ? true : null);

        Gate::define('admin.access', fn (User $user) => $user->hasRole('super_admin'));
        Gate::define('admin.users.manage', fn (User $user) => $user->hasRole('super_admin'));
        Gate::define('admin.settings.manage', fn (User $user) => $user->hasRole('super_admin'));
        Gate::define('admin.activity.view', fn (User $user) => $user->hasRole('super_admin'));
        Gate::define('admin.analytics.view', fn (User $user) => $user->hasRole('super_admin'));
    }
}
