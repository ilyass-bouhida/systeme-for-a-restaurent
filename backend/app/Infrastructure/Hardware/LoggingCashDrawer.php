<?php

namespace App\Infrastructure\Hardware;

use App\Contracts\CashDrawer;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class LoggingCashDrawer implements CashDrawer
{
    public function open(Payment $payment): void
    {
        Log::info('Cash drawer open requested.', [
            'payment_id' => $payment->id,
            'order_id' => $payment->order_id,
        ]);
    }
}
