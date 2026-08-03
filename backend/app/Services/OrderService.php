<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\TableStatus;
use App\Events\TableStatusChanged;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private readonly ActivityService $activity) {}

    public function openForTable(RestaurantTable $table, User $worker): Order
    {
        $order = DB::transaction(function () use ($table, $worker): Order {
            /** @var RestaurantTable $lockedTable */
            $lockedTable = RestaurantTable::query()->lockForUpdate()->findOrFail($table->id);

            if (! $lockedTable->is_active) {
                throw ValidationException::withMessages([
                    'table' => 'This table is inactive.',
                ]);
            }

            $existing = $lockedTable->orders()
                ->whereIn('status', [OrderStatus::Open->value, OrderStatus::Held->value])
                ->with(['items', 'worker', 'restaurantTable'])
                ->latest('id')
                ->first();

            if ($existing) {
                return $existing;
            }

            $created = $lockedTable->orders()->create([
                'public_id' => (string) Str::uuid(),
                'worker_id' => $worker->id,
                'status' => OrderStatus::Open,
                'subtotal_cents' => 0,
                'total_cents' => 0,
            ]);

            $lockedTable->update(['status' => TableStatus::Occupied]);
            $this->activity->record($worker, 'order.opened', $created);

            return $created->load(['items', 'worker', 'restaurantTable']);
        });

        TableStatusChanged::dispatch($order->restaurantTable, $order->id);

        return $order;
    }

    public function addProduct(Order $order, Product $product, int $quantity): Order
    {
        $this->ensureMutable($order);

        if (! $product->is_active || ! $product->category()->where('is_active', true)->exists()) {
            throw ValidationException::withMessages([
                'product_id' => 'This product is unavailable.',
            ]);
        }

        DB::transaction(function () use ($order, $product, $quantity): void {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $this->ensureMutable($lockedOrder);

            $item = $lockedOrder->items()
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $newQuantity = ($item?->quantity ?? 0) + $quantity;
            if ($newQuantity > 99) {
                throw ValidationException::withMessages([
                    'quantity' => 'A product quantity cannot exceed 99.',
                ]);
            }

            $lockedOrder->items()->updateOrCreate(
                ['product_id' => $product->id],
                [
                    'product_name' => $product->name,
                    'unit_price_cents' => $product->price_cents,
                    'unit_cost_cents' => $product->cost_cents,
                    'quantity' => $newQuantity,
                    'line_total_cents' => $product->price_cents * $newQuantity,
                    'line_cost_cents' => $product->cost_cents * $newQuantity,
                ],
            );

            $this->recalculate($lockedOrder);
        });

        return $order->fresh(['items.product', 'worker', 'restaurantTable']);
    }

    public function updateItem(Order $order, OrderItem $item, int $quantity): Order
    {
        $this->ensureItemBelongsToOrder($order, $item);
        $this->ensureMutable($order);

        DB::transaction(function () use ($order, $item, $quantity): void {
            /** @var OrderItem $lockedItem */
            $lockedItem = OrderItem::query()->lockForUpdate()->findOrFail($item->id);
            $lockedItem->update([
                'quantity' => $quantity,
                'line_total_cents' => $lockedItem->unit_price_cents * $quantity,
                'line_cost_cents' => $lockedItem->unit_cost_cents * $quantity,
            ]);
            $this->recalculate($order);
        });

        return $order->fresh(['items.product', 'worker', 'restaurantTable']);
    }

    public function removeItem(Order $order, OrderItem $item): Order
    {
        $this->ensureItemBelongsToOrder($order, $item);
        $this->ensureMutable($order);

        DB::transaction(function () use ($order, $item): void {
            $item->delete();
            $this->recalculate($order);
        });

        return $order->fresh(['items.product', 'worker', 'restaurantTable']);
    }

    public function hold(Order $order, User $worker): Order
    {
        if ($order->items()->count() === 0) {
            throw ValidationException::withMessages([
                'order' => 'Add at least one product before holding the order.',
            ]);
        }

        $updated = DB::transaction(function () use ($order, $worker): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $this->ensureMutable($lockedOrder);
            $lockedOrder->update([
                'status' => OrderStatus::Held,
                'held_at' => now(),
            ]);
            $lockedOrder->restaurantTable()->update(['status' => TableStatus::Hold]);
            $this->activity->record($worker, 'order.held', $lockedOrder);

            return $lockedOrder->fresh(['items.product', 'worker', 'restaurantTable']);
        });

        TableStatusChanged::dispatch($updated->restaurantTable, $updated->id);

        return $updated;
    }

    public function resume(Order $order, User $worker): Order
    {
        if ($order->status !== OrderStatus::Held) {
            throw ValidationException::withMessages([
                'order' => 'Only a held order can be resumed.',
            ]);
        }

        $updated = DB::transaction(function () use ($order, $worker): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $lockedOrder->update([
                'status' => OrderStatus::Open,
                'held_at' => null,
            ]);
            $lockedOrder->restaurantTable()->update(['status' => TableStatus::Occupied]);
            $this->activity->record($worker, 'order.resumed', $lockedOrder);

            return $lockedOrder->fresh(['items.product', 'worker', 'restaurantTable']);
        });

        TableStatusChanged::dispatch($updated->restaurantTable, $updated->id);

        return $updated;
    }

    public function cancel(Order $order, User $worker): Order
    {
        $cancelled = DB::transaction(function () use ($order, $worker): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $this->ensureMutable($lockedOrder);

            $lockedOrder->update([
                'status' => OrderStatus::Cancelled,
                'held_at' => null,
                'cancelled_at' => now(),
            ]);
            $lockedOrder->restaurantTable()->update([
                'status' => TableStatus::Available,
            ]);
            $this->activity->record($worker, 'order.cancelled', $lockedOrder);

            return $lockedOrder->fresh(['items.product', 'worker', 'restaurantTable']);
        });

        TableStatusChanged::dispatch($cancelled->restaurantTable);

        return $cancelled;
    }

    public function updateGuestCount(Order $order, int $guestCount, User $worker): Order
    {
        $this->ensureMutable($order);
        $order->update(['guest_count' => $guestCount]);
        $this->activity->record($worker, 'order.guests.updated', $order, [
            'guest_count' => $guestCount,
        ]);

        return $order->fresh(['items.product', 'worker', 'restaurantTable']);
    }

    private function recalculate(Order $order): void
    {
        $total = (int) $order->items()->sum('line_total_cents');
        $cost = (int) $order->items()->sum('line_cost_cents');
        $order->update([
            'subtotal_cents' => $total,
            'total_cents' => $total,
            'cost_total_cents' => $cost,
        ]);
    }

    private function ensureMutable(Order $order): void
    {
        if (! in_array($order->status, [OrderStatus::Open, OrderStatus::Held], true)) {
            throw ValidationException::withMessages([
                'order' => 'This order can no longer be changed.',
            ]);
        }
    }

    private function ensureItemBelongsToOrder(Order $order, OrderItem $item): void
    {
        if ($item->order_id !== $order->id) {
            abort(404);
        }
    }
}
