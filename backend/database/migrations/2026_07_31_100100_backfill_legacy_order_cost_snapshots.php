<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('order_items.unit_cost_cents', 0)
            ->where('products.cost_cents', '>', 0)
            ->select([
                'order_items.id',
                'order_items.quantity',
                'products.cost_cents',
            ])
            ->orderBy('order_items.id')
            ->get()
            ->each(function (object $item): void {
                DB::table('order_items')
                    ->where('id', $item->id)
                    ->update([
                        'unit_cost_cents' => $item->cost_cents,
                        'line_cost_cents' => $item->cost_cents * $item->quantity,
                    ]);
            });

        DB::table('order_items')
            ->selectRaw('order_id, SUM(line_cost_cents) as cost_total_cents')
            ->groupBy('order_id')
            ->get()
            ->each(function (object $order): void {
                DB::table('orders')
                    ->where('id', $order->order_id)
                    ->update(['cost_total_cents' => $order->cost_total_cents]);
            });
    }

    public function down(): void
    {
        // Historical cost repairs are intentionally retained on rollback.
    }
};
