<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\SeoTools\Services\Contracts\DnsResolverInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SmokeTest extends TestCase
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
                    default => [],
                };
            }
        };

        $this->app->instance(DnsResolverInterface::class, $resolver);
    }

    public function test_homepage_renders(): void
    {
        $this->get('/')->assertStatus(200);
    }

    public function test_tools_directory_renders(): void
    {
        $this->get('/tools')->assertStatus(200);
    }

    public function test_serp_preview_tool_renders(): void
    {
        $this->get('/tools/serp-preview')->assertStatus(200);
    }

    public function test_guides_page_renders(): void
    {
        $this->get('/guides')->assertStatus(200);
    }

    public function test_about_page_renders(): void
    {
        $this->get('/about')->assertStatus(200);
    }

    public function test_privacy_page_renders(): void
    {
        $this->get('/privacy')->assertStatus(200);
    }

    public function test_terms_page_renders(): void
    {
        $this->get('/terms')->assertStatus(200);
    }

    public function test_unknown_routes_return_404(): void
    {
        $this->get('/page-that-does-not-exist')->assertStatus(404);
    }

    public function test_sitemap_is_served(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertStatus(200);
        $response->assertSee('<urlset', false);
        $response->assertSee('/about', false);
    }

    public function test_robots_txt_is_restrictive_in_non_production(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertStatus(200);
        $response->assertSee('Disallow');
    }

    public function test_api_fetches_public_metadata(): void
    {
        Http::fake([
            '*' => Http::response(
                '<html><head><title>Example</title><meta name="description" content="Example."></head><body></body></html>',
                Response::HTTP_OK,
                ['Content-Type' => 'text/html']
            ),
        ]);

        $response = $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'https://example.com/']);

        $response->assertStatus(200);
        $response->assertJsonPath('data.title', 'Example');
    }

    public function test_api_rejects_private_ip(): void
    {
        $this->withSession(['_token' => $this->token])
            ->withHeaders(['X-CSRF-TOKEN' => $this->token])
            ->postJson('/api/v1/serp-preview/fetch', ['url' => 'http://192.168.1.1/'])
            ->assertStatus(400)
            ->assertJsonPath('error.code', 'PRIVATE_IP');
    }
}
