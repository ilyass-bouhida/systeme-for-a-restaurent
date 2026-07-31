<?php

namespace App\Infrastructure\Hardware;

use App\Contracts\CardTerminal;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class LoggingCardTerminal implements CardTerminal
{
    public function charge(Order $order, int $amountCents): string
    {
        $reference = 'MOCK-'.$order->public_id;

        Log::info('Card terminal charge simulated.', [
            'order_id' => $order->id,
            'amount_cents' => $amountCents,
            'reference' => $reference,
        ]);

        return $reference;
    }
}
