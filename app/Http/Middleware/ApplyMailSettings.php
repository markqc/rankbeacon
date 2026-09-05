<?php

namespace App\Http\Middleware;

use App\Domain\Admin\Services\MailSettingsService;
use App\Domain\Admin\Services\SettingsService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpFoundation\Response;

class ApplyMailSettings
{
    public function __construct(
        private readonly MailSettingsService $mailSettings,
        private readonly SettingsService $settings,
    ) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $siteName = $this->settings->get('site_name');

        if (is_string($siteName) && $siteName !== '') {
            Config::set('app.name', $siteName);
        }

        $this->mailSettings->apply();

        return $next($request);
    }
}
