<?php

namespace Database\Factories;

use App\Enums\TableStatus;
use App\Models\RestaurantTable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RestaurantTable>
 */
class RestaurantTableFactory extends Factory
{
    public function definition(): array
    {
        return [
            'label' => 'Table '.fake()->unique()->numberBetween(1, 500),
            'capacity' => fake()->numberBetween(2, 8),
            'status' => TableStatus::Available,
            'is_active' => true,
            'display_order' => 0,
        ];
    }
}
