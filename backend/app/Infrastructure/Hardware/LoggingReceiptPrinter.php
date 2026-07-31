<?php

namespace App\Infrastructure\Hardware;

use App\Contracts\ReceiptPrinter;
use App\Models\Receipt;
use Illuminate\Support\Facades\Log;

class LoggingReceiptPrinter implements ReceiptPrinter
{
    public function print(Receipt $receipt): void
    {
        Log::info('Receipt print requested.', [
            'receipt_id' => $receipt->id,
            'receipt_number' => $receipt->number,
        ]);
    }
}
