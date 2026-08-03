<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\TableStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpPosPermissions();
        $this->actingAsPos($this->makeWorker());
    }

    public function test_worker_can_add_update_remove_hold_and_resume_items(): void
    {
        [, $product] = $this->makeProduct(2500);
        $table = $this->makeTable();

        $order = $this->postJson("/api/tables/{$table->id}/orders")
            ->assertCreated()
            ->assertJsonPath('data.status', OrderStatus::Open->value)
            ->json('data');

        $withItem = $this->postJson("/api/orders/{$order['id']}/items", [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertOk()
            ->assertJsonPath('data.total_cents', 5000)
            ->json('data');

        $itemId = $withItem['items'][0]['id'];
        $this->patchJson("/api/orders/{$order['id']}/items/{$itemId}", [
            'quantity' => 3,
        ])->assertOk()->assertJsonPath('data.total_cents', 7500);

        $this->postJson("/api/orders/{$order['id']}/hold")
            ->assertOk()
            ->assertJsonPath('data.status', OrderStatus::Held->value)
            ->assertJsonPath('data.table.status', TableStatus::Hold->value);

        $this->getJson('/api/tables')
            ->assertOk()
            ->assertJsonPath('data.0.status', TableStatus::Hold->value);

        $this->postJson("/api/orders/{$order['id']}/resume")
            ->assertOk()
            ->assertJsonPath('data.status', OrderStatus::Open->value);

        $this->deleteJson("/api/orders/{$order['id']}/items/{$itemId}")
            ->assertOk()
            ->assertJsonPath('data.total_cents', 0)
            ->assertJsonCount(0, 'data.items');
    }

    public function test_opening_same_table_returns_existing_order(): void
    {
        $table = $this->makeTable();

        $first = $this->postJson("/api/tables/{$table->id}/orders")->json('data.id');
        $second = $this->postJson("/api/tables/{$table->id}/orders")->json('data.id');

        $this->assertSame($first, $second);
    }

    public function test_worker_can_cancel_an_order_and_release_the_table(): void
    {
        $table = $this->makeTable();
        $orderId = $this->postJson("/api/tables/{$table->id}/orders")
            ->assertCreated()
            ->json('data.id');

        $this->postJson("/api/orders/{$orderId}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', OrderStatus::Cancelled->value)
            ->assertJsonPath('data.table.status', TableStatus::Available->value)
            ->assertJsonPath('data.cancelled_at', fn ($value) => is_string($value));

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'order.cancelled',
            'subject_id' => $orderId,
        ]);
        $this->assertSame(TableStatus::Available, $table->refresh()->status);

        $this->postJson("/api/orders/{$orderId}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('order');

        $newOrderId = $this->postJson("/api/tables/{$table->id}/orders")
            ->assertCreated()
            ->json('data.id');

        $this->assertNotSame($orderId, $newOrderId);
    }
}
