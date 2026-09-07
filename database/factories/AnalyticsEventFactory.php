<?php

namespace Database\Factories;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalyticsEvent>
 */
class AnalyticsEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'analytics_session_id' => AnalyticsSession::factory(),
            'event_type' => $this->faker->randomElement(['page_view', 'tool_event']),
            'page_path' => $this->faker->randomElement(['/', '/tools', '/tools/serp-preview', '/guides']),
            'tool_name' => null,
            'metadata' => ['country' => $this->faker->countryCode()],
            'created_at' => $this->faker->dateTimeBetween('-30 days'),
        ];
    }

    public function toolEvent(string $tool, string $action = 'fetch', ?string $url = null): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'tool_event',
            'tool_name' => $tool,
            'metadata' => [
                'action' => $action,
                'url' => $url ?? fake()->url(),
                'country' => $this->faker->countryCode(),
            ],
        ]);
    }
}
