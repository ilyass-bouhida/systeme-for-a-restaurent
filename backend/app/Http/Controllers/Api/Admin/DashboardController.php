<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function __invoke(): JsonResponse
    {
        return response()->json(['data' => $this->reports->dashboard()]);
    }
}
