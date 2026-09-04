<?php

namespace App\Providers;

use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;
use App\Domain\SeoTools\Services\PublicDnsResolver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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
    }
}
