<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class MoneyCalculationTest extends TestCase
{
    public function test_change_is_calculated_with_integer_centimes(): void
    {
        $totalCents = 18000;
        $paidCents = 20000;

        $this->assertSame(2000, $paidCents - $totalCents);
    }
}
