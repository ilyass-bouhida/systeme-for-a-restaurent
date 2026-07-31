<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->reports->workerToday($request->user()),
        ]);
    }
}
