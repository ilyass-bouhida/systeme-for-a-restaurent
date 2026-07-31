<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'category_id' => Category::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 9999),
            'description' => fake()->sentence(),
            'price_cents' => fake()->numberBetween(1000, 15000),
            'cost_cents' => fake()->numberBetween(300, 800),
            'image_path' => null,
            'is_active' => true,
            'display_order' => 0,
        ];
    }
}
