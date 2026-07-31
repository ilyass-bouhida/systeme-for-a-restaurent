<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\StoreOrderItemRequest;
use App\Http\Requests\Orders\UpdateOrderItemRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function store(StoreOrderItemRequest $request, Order $order): OrderResource
    {
        $product = Product::query()->findOrFail($request->integer('product_id'));

        return new OrderResource(
            $this->orders->addProduct($order, $product, $request->integer('quantity')),
        );
    }

    public function update(
        UpdateOrderItemRequest $request,
        Order $order,
        OrderItem $item,
    ): OrderResource {
        return new OrderResource(
            $this->orders->updateItem($order, $item, $request->integer('quantity')),
        );
    }

    public function destroy(Request $request, Order $order, OrderItem $item): OrderResource
    {
        abort_unless($request->user()->can('orders.manage'), 403);

        return new OrderResource($this->orders->removeItem($order, $item));
    }
}
