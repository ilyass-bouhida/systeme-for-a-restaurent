<?php

namespace App\Contracts;

use App\Models\Receipt;

interface ReceiptPrinter
{
    public function print(Receipt $receipt): void;
}
