<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->unsignedBigInteger('cost_cents')->default(0)->after('price_cents');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->unsignedSmallInteger('guest_count')->default(1)->after('worker_id');
            $table->unsignedBigInteger('cost_total_cents')->default(0)->after('total_cents');
        });

        Schema::table('order_items', function (Blueprint $table): void {
            $table->unsignedBigInteger('unit_cost_cents')->default(0)->after('unit_price_cents');
            $table->unsignedBigInteger('line_cost_cents')->default(0)->after('line_total_cents');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table): void {
            $table->dropColumn(['unit_cost_cents', 'line_cost_cents']);
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['guest_count', 'cost_total_cents']);
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('cost_cents');
        });
    }
};
