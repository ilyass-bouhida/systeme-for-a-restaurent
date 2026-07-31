<?php

namespace Tests\Feature;

use App\Contracts\CardTerminal;
use App\Contracts\CashDrawer;
use App\Contracts\ReceiptPrinter;
use App\Enums\TableStatus;
use App\Models\Receipt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class PaymentAndReportsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpPosPermissions();
    }

    public function test_cash_payment_calculates_change_prints_and_opens_drawer(): void
    {
        $worker = $this->makeWorker();
        $this->actingAsPos($worker);
        $this->mock(ReceiptPrinter::class, fn (MockInterface $mock) => $mock
            ->shouldReceive('print')->twice());
        $this->mock(CashDrawer::class, fn (MockInterface $mock) => $mock
            ->shouldReceive('open')->once());

        [, $product] = $this->makeProduct(18000);
        $table = $this->makeTable();
        $orderId = $this->postJson("/api/tables/{$table->id}/orders")->json('data.id');
        $this->postJson("/api/orders/{$orderId}/items", [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertOk();

        $receipt = $this->postJson("/api/orders/{$orderId}/pay", [
            'method' => 'cash',
            'paid_cents' => 20000,
        ])->assertOk()
            ->assertJsonPath('data.payload.restaurant', 'Gigino')
            ->assertJsonPath('data.payload.change_cents', 2000)
            ->assertJsonPath('data.print_count', 1)
            ->json('data');

        $this->assertDatabaseHas('payments', [
            'order_id' => $orderId,
            'change_cents' => 2000,
            'method' => 'cash',
        ]);
        $this->assertSame(TableStatus::Available, $table->refresh()->status);

        $this->postJson("/api/receipts/{$receipt['id']}/print")
            ->assertOk()
            ->assertJsonPath('data.print_count', 2);

        $this->getJson('/api/stats/me')
            ->assertOk()
            ->assertJsonPath('data.total_collected_cents', 18000)
            ->assertJsonPath('data.paid_tables', 1);
    }

    public function test_card_payment_uses_terminal_and_admin_reports_totals(): void
    {
        $worker = $this->makeWorker();
        $this->actingAsPos($worker);
        $this->mock(CardTerminal::class, fn (MockInterface $mock) => $mock
            ->shouldReceive('charge')->once()->andReturn('CARD-123'));
        $this->mock(ReceiptPrinter::class, fn (MockInterface $mock) => $mock
            ->shouldReceive('print')->once());

        [, $product] = $this->makeProduct(9200, 3000);
        $table = $this->makeTable();
        $orderId = $this->postJson("/api/tables/{$table->id}/orders")->json('data.id');
        $this->patchJson("/api/orders/{$orderId}/guests", [
            'guest_count' => 3,
        ])->assertOk()->assertJsonPath('data.guest_count', 3);
        $this->postJson("/api/orders/{$orderId}/items", [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->postJson("/api/orders/{$orderId}/pay", [
            'method' => 'card',
        ])->assertOk()->assertJsonPath('data.payload.total_cents', 18400);

        $this->assertDatabaseHas('payments', [
            'method' => 'card',
            'terminal_reference' => 'CARD-123',
            'total_cents' => 18400,
        ]);

        $this->actingAsPos($this->makeAdmin());
        $this->getJson('/api/admin/reports?period=day')
            ->assertOk()
            ->assertJsonPath('data.total_revenue_cents', 18400)
            ->assertJsonPath('data.total_cost_cents', 6000)
            ->assertJsonPath('data.gross_profit_cents', 12400)
            ->assertJsonPath('data.visitors_count', 3)
            ->assertJsonPath('data.items_sold', 2)
            ->assertJsonPath('data.orders_count', 1);

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.revenue_today_cents', 18400)
            ->assertJsonPath('data.profit_today_cents', 12400)
            ->assertJsonPath('data.visitors_today', 3)
            ->assertJsonPath('data.period_summaries.day.orders', 1);

        $this->assertSame(1, Receipt::query()->count());
    }
}
