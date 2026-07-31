<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTableRequest;
use App\Http\Requests\Admin\UpdateTableRequest;
use App\Http\Resources\TableResource;
use App\Models\RestaurantTable;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class TableController extends Controller
{
    public function __construct(private readonly ActivityService $activity) {}

    public function index(): AnonymousResourceCollection
    {
        return TableResource::collection(
            RestaurantTable::query()
                ->with(['activeOrder.worker:id,name'])
                ->orderBy('display_order')
                ->orderBy('label')
                ->get(),
        );
    }

    public function store(StoreTableRequest $request): TableResource
    {
        $table = RestaurantTable::query()->create($request->validated());
        $this->activity->record($request->user(), 'table.created', $table);

        return new TableResource($table->refresh());
    }

    public function show(RestaurantTable $table): TableResource
    {
        return new TableResource($table->load(['activeOrder.worker:id,name']));
    }

    public function update(
        UpdateTableRequest $request,
        RestaurantTable $table,
    ): TableResource {
        $table->update($request->validated());
        $this->activity->record($request->user(), 'table.updated', $table);

        return new TableResource($table->refresh());
    }

    public function destroy(RestaurantTable $table, Request $request): JsonResponse
    {
        $hasActiveOrder = $table->orders()
            ->whereIn('status', [OrderStatus::Open->value, OrderStatus::Held->value])
            ->exists();

        if ($hasActiveOrder) {
            throw ValidationException::withMessages([
                'table' => 'Complete or cancel the active order before deleting this table.',
            ]);
        }

        $table->delete();
        $this->activity->record($request->user(), 'table.deleted', $table);

        return response()->json(status: 204);
    }
}
