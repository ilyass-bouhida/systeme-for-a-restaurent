<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Open = 'open';
    case Held = 'held';
    case Paid = 'paid';
    case Cancelled = 'cancelled';
}
