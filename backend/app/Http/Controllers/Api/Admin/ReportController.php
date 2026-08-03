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
            'year' => ['nullable', 'integer', 'between:2000,'.(now()->year + 1)],
            'month' => ['nullable', 'integer', 'between:1,12'],
        ]);

        return response()->json([
            'data' => $this->reports->report(
                $validated['period'],
                isset($validated['year']) ? (int) $validated['year'] : null,
                isset($validated['month']) ? (int) $validated['month'] : null,
            ),
        ]);
    }
}
