<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderLifecycleController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function hold(Order $order, Request $request): OrderResource
    {
        return new OrderResource($this->orders->hold($order, $request->user()));
    }

    public function resume(Order $order, Request $request): OrderResource
    {
        return new OrderResource($this->orders->resume($order, $request->user()));
    }

    public function cancel(Order $order, Request $request): OrderResource
    {
        return new OrderResource($this->orders->cancel($order, $request->user()));
    }
}
