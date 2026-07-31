<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['required', Rule::in(['day', 'week', 'month', 'year'])],
        ]);

        return response()->json([
            'data' => $this->reports->report($validated['period']),
        ]);
    }
}
