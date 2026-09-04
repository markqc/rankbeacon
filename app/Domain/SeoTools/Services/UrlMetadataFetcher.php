<?php

declare(strict_types=1);

namespace App\Domain\SeoTools\Services;

use App\Domain\SeoTools\Exceptions\FetchException;
use App\Domain\SeoTools\ValueObjects\UrlMetadata;
use App\Domain\SeoTools\ValueObjects\ValidatedUrl;
use GuzzleHttp\Psr7\Uri;
use GuzzleHttp\Psr7\UriResolver;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class UrlMetadataFetcher
{
    public function __construct(
        private readonly UrlSecurityValidator $securityValidator,
        private readonly HtmlMetadataParser $parser,
        private readonly Repository $cache,
        private readonly int $maxRedirects = 5,
        private readonly int $maxBodyBytes = 2_000_000,
        private readonly int $cacheTtlSeconds = 300,
    ) {}

    public function fetch(string $url): UrlMetadata
    {
        $validated = $this->securityValidator->validate($url);
        $cacheKey = 'serp-fetch:'.md5($validated->normalizedUrl);

        $cached = $this->cache->remember(
            $cacheKey,
            $this->cacheTtlSeconds,
            function () use ($validated) {
                return $this->performFetch($validated)->toArray();
            },
        );

        return UrlMetadata::fromArray($cached);
    }

    private function performFetch(ValidatedUrl $validated): UrlMetadata
    {
        $currentUrl = $validated->normalizedUrl;
        $redirects = 0;
        $finalUrl = $currentUrl;
        $response = null;

        while (true) {
            if ($redirects > $this->maxRedirects) {
                throw new FetchException('Too many redirects.', 'TOO_MANY_REDIRECTS');
            }

            $currentValidated = $this->securityValidator->validate($currentUrl);

            try {
                $client = Http::withOptions([
                    'curl' => $this->curlOptions($currentValidated),
                    'verify' => true,
                    'allow_redirects' => false,
                    'decode_content' => true,
                    'protocols' => ['http', 'https'],
                ])
                    ->timeout(15)
                    ->connectTimeout(5)
                    ->withUserAgent('RankBeacon/1.0 (+https://rankbeacon.app; metadata fetcher)')
                    ->withHeaders([
                        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language' => 'en-US,en;q=0.5',
                        'Cache-Control' => 'no-cache',
                    ]);

                $response = $client->get($currentUrl);
            } catch (ConnectionException $e) {
                $this->logSanitized($currentValidated, 'Connection failed', $e);
                throw new FetchException('Unable to reach the requested URL.', 'FETCH_FAILED', $e);
            } catch (Throwable $e) {
                $this->logSanitized($currentValidated, 'Fetch error', $e);
                throw new FetchException('An error occurred while fetching the URL.', 'FETCH_FAILED', $e);
            }

            $status = $response->status();

            if ($status >= 300 && $status < 400) {
                $location = $response->header('Location');

                if ($location === null || $location === '') {
                    break;
                }

                $redirects++;

                try {
                    $currentUrl = (string) UriResolver::resolve(new Uri($currentUrl), new Uri($location));
                    $finalUrl = $currentUrl;
                } catch (Throwable $e) {
                    throw new FetchException('Invalid redirect location.', 'INVALID_REDIRECT', $e);
                }

                continue;
            }

            $finalUrl = $currentUrl;
            break;
        }

        if ($response === null) {
            throw new FetchException('No response received from the URL.', 'FETCH_FAILED');
        }

        $contentType = strtolower($response->header('Content-Type') ?? '');

        if (! str_contains($contentType, 'text/html') && ! str_contains($contentType, 'application/xhtml+xml')) {
            throw new FetchException('Unsupported content type.', 'UNSUPPORTED_CONTENT_TYPE');
        }

        $body = $response->body();

        if (strlen($body) > $this->maxBodyBytes) {
            throw new FetchException('Response body is too large.', 'RESPONSE_TOO_LARGE');
        }

        $parsed = $this->parser->parse($body, $finalUrl);

        $warnings = $parsed['warnings'];

        if ($redirects > 0) {
            $warnings[] = "Followed {$redirects} redirect(s).";
        }

        if ($response->status() >= 400) {
            $warnings[] = "HTTP status {$response->status()} received.";
        }

        return new UrlMetadata(
            normalizedUrl: $validated->normalizedUrl,
            finalUrl: $finalUrl,
            siteName: $this->coalesceSiteName($parsed, $finalUrl),
            title: $parsed['title'] ?? null,
            description: $parsed['description'] ?? null,
            canonicalUrl: $parsed['canonical_url'] ?? null,
            faviconUrl: $parsed['favicon_url'] ?? null,
            robots: $parsed['robots'] ?? null,
            language: $parsed['language'] ?? null,
            ogTitle: $parsed['og_title'] ?? null,
            ogDescription: $parsed['og_description'] ?? null,
            ogSiteName: $parsed['og_site_name'] ?? null,
            breadcrumbPath: $parsed['breadcrumb_path'] ?? null,
            status: $response->status(),
            warnings: array_values(array_unique($warnings)),
            fetchedAt: now()->toIso8601String(),
        );
    }

    /**
     * @return array<int, mixed>
     */
    private function curlOptions(ValidatedUrl $validated): array
    {
        $options = [];

        // IP literals do not use DNS, so DNS rebinding is not a concern.
        if (filter_var($validated->host, FILTER_VALIDATE_IP) === false) {
            $address = filter_var($validated->ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)
                ? '['.$validated->ip.']'
                : $validated->ip;

            $options[CURLOPT_RESOLVE] = [$validated->host.':'.$validated->port.':'.$address];
        }

        return $options;
    }

    /**
     * @param  array<string, mixed>  $parsed
     */
    private function coalesceSiteName(array $parsed, string $finalUrl): ?string
    {
        $siteName = $parsed['site_name'] ?? null;

        if ($siteName !== null && $siteName !== '') {
            return $siteName;
        }

        $host = parse_url($finalUrl, PHP_URL_HOST);

        return is_string($host) && $host !== '' ? $host : null;
    }

    private function logSanitized(ValidatedUrl $validated, string $message, Throwable $exception): void
    {
        $safeUrl = $validated->scheme.'://'.$validated->host.$validated->path;

        Log::warning($message, [
            'url_host' => $validated->host,
            'url_path' => $validated->path,
            'exception_class' => $exception::class,
        ]);
    }
}
