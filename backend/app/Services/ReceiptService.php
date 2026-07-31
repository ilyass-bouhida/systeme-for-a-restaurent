<?php

namespace App\Services;

use App\Contracts\ReceiptPrinter;
use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Support\Str;

class ReceiptService
{
    public function __construct(private readonly ReceiptPrinter $printer) {}

    public function createFor(Payment $payment): Receipt
    {
        $payment->loadMissing(['order.items', 'order.restaurantTable', 'processor']);

        $receipt = Receipt::query()->create([
            'payment_id' => $payment->id,
            'number' => $this->nextNumber($payment),
            'payload' => [
                'restaurant' => 'Gigino',
                'receipt_number' => null,
                'table' => $payment->order->restaurantTable->label,
                'worker' => $payment->processor->name,
                'date_time' => $payment->completed_at->toIso8601String(),
                'items' => $payment->order->items->map(fn ($item) => [
                    'name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit_price_cents' => $item->unit_price_cents,
                    'line_total_cents' => $item->line_total_cents,
                ])->values()->all(),
                'total_cents' => $payment->total_cents,
                'paid_cents' => $payment->paid_cents,
                'change_cents' => $payment->change_cents,
                'payment_method' => $payment->method->value,
            ],
        ]);

        $payload = $receipt->payload;
        $payload['receipt_number'] = $receipt->number;
        $receipt->update(['payload' => $payload]);

        return $receipt;
    }

    public function print(Receipt $receipt): Receipt
    {
        $this->printer->print($receipt);
        $receipt->forceFill([
            'last_printed_at' => now(),
            'print_count' => $receipt->print_count + 1,
        ])->save();

        return $receipt->refresh();
    }

    private function nextNumber(Payment $payment): string
    {
        return sprintf(
            'GIG-%s-%06d-%s',
            now()->format('Ymd'),
            $payment->id,
            strtoupper(Str::random(4)),
        );
    }
}
