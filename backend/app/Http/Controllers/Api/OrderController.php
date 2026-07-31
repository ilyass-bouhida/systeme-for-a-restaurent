<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\UpdateOrderGuestsRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $status = $request->string('status')->toString();
        $query = Order::query()
            ->with(['restaurantTable', 'worker:id,name', 'items', 'payment.receipt'])
            ->latest('id');

        match ($status) {
            'current' => $query->whereIn('status', [
                OrderStatus::Open->value,
                OrderStatus::Held->value,
            ]),
            OrderStatus::Open->value,
            OrderStatus::Held->value,
            OrderStatus::Paid->value,
            OrderStatus::Cancelled->value => $query->where('status', $status),
            default => null,
        };

        return OrderResource::collection($query->paginate(30));
    }

    public function store(RestaurantTable $table, Request $request): OrderResource
    {
        return new OrderResource($this->orders->openForTable($table, $request->user()));
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource(
            $order->load(['restaurantTable', 'worker:id,name', 'items.product', 'payment.receipt']),
        );
    }

    public function updateGuests(
        UpdateOrderGuestsRequest $request,
        Order $order,
    ): OrderResource {
        return new OrderResource($this->orders->updateGuestCount(
            $order,
            $request->integer('guest_count'),
            $request->user(),
        ));
    }
}
