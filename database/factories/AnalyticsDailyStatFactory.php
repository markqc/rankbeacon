<?php

namespace Database\Factories;

use App\Models\AnalyticsDailyStat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalyticsDailyStat>
 */
class AnalyticsDailyStatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date' => $this->faker->unique()->dateTimeBetween('-60 days')->format('Y-m-d'),
            'metric' => $this->faker->randomElement(['page_views', 'unique_sessions', 'tool_serp-preview']),
            'value' => $this->faker->numberBetween(1, 1000),
        ];
    }
}
