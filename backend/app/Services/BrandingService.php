<?php

namespace App\Services;

use App\Models\RestaurantSetting;

class BrandingService
{
    public function current(): RestaurantSetting
    {
        return RestaurantSetting::query()->firstOrCreate(
            ['id' => RestaurantSetting::SINGLETON_ID],
            ['restaurant_name' => 'Gigino'],
        );
    }

    public function restaurantName(): string
    {
        return $this->current()->restaurant_name;
    }

    public function updateRestaurantName(string $restaurantName): RestaurantSetting
    {
        $settings = $this->current();
        $settings->update(['restaurant_name' => trim($restaurantName)]);

        return $settings->refresh();
    }
}
