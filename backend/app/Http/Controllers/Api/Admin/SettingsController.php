<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRestaurantSettingsRequest;
use App\Services\ActivityService;
use App\Services\BrandingService;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function __construct(
        private readonly BrandingService $branding,
        private readonly ActivityService $activity,
    ) {}

    public function show(): JsonResponse
    {
        return $this->response();
    }

    public function update(UpdateRestaurantSettingsRequest $request): JsonResponse
    {
        $settings = $this->branding->updateRestaurantName(
            $request->string('restaurant_name')->toString(),
        );

        $this->activity->record(
            $request->user(),
            'restaurant_settings.updated',
            $settings,
            ['restaurant_name' => $settings->restaurant_name],
        );

        return $this->response();
    }

    private function response(): JsonResponse
    {
        return response()->json([
            'data' => [
                'restaurant_name' => $this->branding->restaurantName(),
            ],
        ]);
    }
}
