<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'restaurant_table_id' => RestaurantTable::factory(),
            'worker_id' => User::factory(),
            'status' => OrderStatus::Open,
            'subtotal_cents' => 0,
            'total_cents' => 0,
        ];
    }
}
