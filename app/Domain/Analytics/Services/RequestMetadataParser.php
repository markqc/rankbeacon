<?php

namespace App\Domain\Analytics\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Jaybizzle\CrawlerDetect\CrawlerDetect;

class RequestMetadataParser
{
    private readonly CrawlerDetect $crawlerDetect;

    public function __construct(?CrawlerDetect $crawlerDetect = null)
    {
        $this->crawlerDetect = $crawlerDetect ?? new CrawlerDetect;
    }

    public function isTrackable(Request $request): bool
    {
        return ! $this->isBot($request)
            && ! $this->isExcludedPath($request)
            && ! $this->isAuthenticatedAdmin($request)
            && ! $this->hasPrivacyOptOut($request);
    }

    public function hasPrivacyOptOut(Request $request): bool
    {
        $dnt = $request->header('DNT');
        $gpc = $request->header('Sec-GPC');

        return $dnt === '1' || $gpc === '1';
    }

    public function isBot(Request $request): bool
    {
        return $this->crawlerDetect->isCrawler($request->userAgent() ?? '');
    }

    public function deviceType(Request $request): string
    {
        $agent = strtolower($request->userAgent() ?? '');

        if (preg_match('/(tablet|ipad|kindle|playbook|silk)|(android(?!.*mobile))/i', $agent)) {
            return 'tablet';
        }

        if (preg_match('/mobile|iphone|android|blackberry|opera mini|opera mobi/i', $agent)) {
            return 'mobile';
        }

        return 'desktop';
    }

    public function fingerprint(Request $request): string
    {
        return hash('sha256', ($request->userAgent() ?? '').'|'.session()->getId().'|'.config('app.key'));
    }

    public function sessionToken(Request $request): string
    {
        return hash('sha256', session()->getId().'|'.config('app.key'));
    }

    public function country(Request $request): ?string
    {
        $headers = ['CF-IPCountry', 'Cloudflare-IP-Country', 'X-Country-Code'];

        foreach ($headers as $header) {
            $value = $request->header($header);

            if ($value !== null && $value !== '') {
                return strtoupper($value);
            }
        }

        return null;
    }

    private function isExcludedPath(Request $request): bool
    {
        $raw = (string) $request->input('path', '');

        if ($raw === '') {
            return true;
        }

        $path = ltrim($raw, '/');

        $excluded = [
            'admin',
            'admin/*',
            'login',
            'logout',
            'register',
            'forgot-password',
            'reset-password',
            'api/*',
            'up',
            'health/*',
            'sitemap.xml',
            'robots.txt',
        ];

        foreach ($excluded as $pattern) {
            if ($this->pathMatches($path, $pattern)) {
                return true;
            }
        }

        return false;
    }

    private function pathMatches(string $path, string $pattern): bool
    {
        $regex = '#^'.str_replace('\\*', '.*', preg_quote($pattern, '#')).'$#';

        return (bool) preg_match($regex, $path);
    }

    private function isAuthenticatedAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user !== null && Gate::forUser($user)->allows('admin.access');
    }
}
