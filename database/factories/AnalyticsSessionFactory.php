<?php

namespace Database\Factories;

use App\Models\AnalyticsSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AnalyticsSession>
 */
class AnalyticsSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seen = $this->faker->dateTimeBetween('-30 days');

        return [
            'fingerprint' => $this->faker->unique()->sha256(),
            'session_token' => $this->faker->unique()->sha256(),
            'device_type' => $this->faker->randomElement(['desktop', 'mobile', 'tablet']),
            'user_agent' => $this->faker->userAgent(),
            'first_seen_at' => $seen,
            'last_seen_at' => $seen,
        ];
    }
}
