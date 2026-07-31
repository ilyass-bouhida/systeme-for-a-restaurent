<?php

namespace App\Contracts;

use App\Models\Payment;

interface CashDrawer
{
    public function open(Payment $payment): void;
}
