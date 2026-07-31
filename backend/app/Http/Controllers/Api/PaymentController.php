<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\PayOrderRequest;
use App\Http\Resources\ReceiptResource;
use App\Models\Order;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function store(PayOrderRequest $request, Order $order): ReceiptResource
    {
        $receipt = $this->payments->complete(
            order: $order,
            worker: $request->user(),
            method: PaymentMethod::from($request->string('method')->toString()),
            paidCents: $request->integer('paid_cents') ?: null,
        );

        return new ReceiptResource($receipt);
    }
}
