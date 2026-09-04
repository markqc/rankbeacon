<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RoutesTest extends TestCase
{
    #[DataProvider('publicRouteProvider')]
    public function test_public_routes_render_successfully(string $route): void
    {
        $response = $this->get($route);

        $response->assertStatus(200);
    }

    public static function publicRouteProvider(): array
    {
        return [
            ['/'],
            ['/tools'],
            ['/tools/serp-preview'],
            ['/guides'],
            ['/about'],
            ['/privacy'],
            ['/terms'],
            ['/up'],
        ];
    }
}
