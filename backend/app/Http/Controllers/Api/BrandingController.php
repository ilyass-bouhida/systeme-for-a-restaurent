<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BrandingService;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    public function __construct(private readonly BrandingService $branding) {}

    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'restaurant_name' => $this->branding->restaurantName(),
            ],
        ]);
    }
}
