<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReceiptResource;
use App\Models\Receipt;
use App\Services\ReceiptService;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function __construct(private readonly ReceiptService $receipts) {}

    public function show(Receipt $receipt): ReceiptResource
    {
        return new ReceiptResource($receipt);
    }

    public function print(Receipt $receipt, Request $request): ReceiptResource
    {
        abort_unless($request->user()->can('receipts.reprint'), 403);

        return new ReceiptResource($this->receipts->print($receipt));
    }
}
