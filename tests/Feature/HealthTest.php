<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_live_returns_ok(): void
    {
        $response = $this->get('/health/live');

        $response->assertStatus(200);
        $response->assertJson(['status' => 'ok']);
    }

    public function test_health_ready_returns_database_status(): void
    {
        $response = $this->get('/health/ready');

        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'checks' => ['database']]);
    }
}
