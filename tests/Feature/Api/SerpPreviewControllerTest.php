<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SerpPreviewControllerTest extends TestCase
{
    use RefreshDatabase;

    private string $token = 'test-csrf-token';

    protected function setUp(): void
    {
        parent::setUp();

        $resolver = new class implements DnsResolverInterface
        {
            public function resolve(string $host): array
            {
                return match ($host) {
                    'example.com' => ['93.184.216.34'],
                    'redirect-target.example' => ['93.184.216.35'],
                    'internal.example' => ['192.168.1.1'],
                    default => [],
                };
            }
        };

        $this->app->instance(DnsResolverInterface::class, $resolver);
        Cache::flush();
    }

    public function test_fetch_returns_metadata_for_a_public_url(): void
    {
        Http::fake([
            '*' => Http::response($this->sampleHtml(), Response::HTTP_OK, ['Content-Type' => 'text/html; charset=utf-8']),
        ]);

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertOk();
        $response->assertJsonPath('data.title', 'RankBeacon');
        $response->assertJsonPath('data.normalized_url', 'https://example.com/');
        $response->assertJsonPath('data.status', 200);
        $response->assertJsonPath('meta.version', 'v1');
    }

    public function test_missing_url_returns_validation_error(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch');

        $response->assertStatus(422);
        $response->assertJsonPath('error.code', 'INVALID_URL');
    }

    public function test_private_ipv4_url_is_rejected(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'http://127.0.0.1/']);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'PRIVATE_IP');
    }

    public function test_private_ipv6_url_is_rejected(): void
    {
        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'http://[::1]/']);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'PRIVATE_IP');
    }

    public function test_redirect_to_private_destination_is_rejected(): void
    {
        Http::fake([
            'https://example.com/' => Http::response('', Response::HTTP_FOUND, [
                'Location' => 'https://internal.example/',
                'Content-Type' => 'text/html',
            ]),
        ]);

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertStatus(400);
        $response->assertJsonPath('error.code', 'PRIVATE_IP');
    }

    public function test_unsupported_content_type_is_rejected(): void
    {
        Http::fake([
            '*' => Http::response('{}', Response::HTTP_OK, ['Content-Type' => 'application/json']),
        ]);

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertStatus(502);
        $response->assertJsonPath('error.code', 'UNSUPPORTED_CONTENT_TYPE');
    }

    public function test_oversized_response_is_rejected(): void
    {
        Http::fake([
            '*' => Http::response(str_repeat('a', 2_000_001), Response::HTTP_OK, ['Content-Type' => 'text/html']),
        ]);

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertStatus(502);
        $response->assertJsonPath('error.code', 'RESPONSE_TOO_LARGE');
    }

    public function test_public_redirect_is_followed_and_metadata_is_returned(): void
    {
        Http::fake([
            'https://example.com/' => Http::response('', Response::HTTP_FOUND, [
                'Location' => 'https://redirect-target.example/final',
                'Content-Type' => 'text/html',
            ]),
            'https://redirect-target.example/final' => Http::response($this->sampleHtml('Final Title'), Response::HTTP_OK, ['Content-Type' => 'text/html']),
        ]);

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertOk();
        $response->assertJsonPath('data.title', 'Final Title');
        $response->assertJsonPath('data.final_url', 'https://redirect-target.example/final');
        $response->assertJsonPath('data.warnings', function ($warnings) {
            return in_array('Followed 1 redirect(s).', $warnings, true);
        });
    }

    public function test_rate_limit_returns_429_after_threshold(): void
    {
        RateLimiter::for('serp-fetch', function () {
            return Limit::perMinute(1);
        });

        Http::fake([
            '*' => Http::response($this->sampleHtml(), Response::HTTP_OK, ['Content-Type' => 'text/html']),
        ]);

        $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/'])
            ->assertOk();

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertStatus(429);
    }

    private function sampleHtml(?string $title = 'RankBeacon'): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{$title}</title>
    <meta name="description" content="A sample page.">
    <link rel="canonical" href="/">
    <link rel="icon" href="/favicon.ico">
</head>
<body></body>
</html>
HTML;
    }
}
