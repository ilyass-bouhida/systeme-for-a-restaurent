<?php

namespace App\Contracts;

use App\Models\Order;

interface CardTerminal
{
    public function charge(Order $order, int $amountCents): string;
}
