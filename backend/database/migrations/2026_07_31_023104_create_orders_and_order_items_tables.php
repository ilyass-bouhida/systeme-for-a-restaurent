<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('restaurant_table_id')
                ->constrained('restaurant_tables')
                ->restrictOnDelete();
            $table->foreignId('worker_id')->constrained('users')->restrictOnDelete();
            $table->string('status', 20)->default('open')->index();
            $table->unsignedBigInteger('subtotal_cents')->default(0);
            $table->unsignedBigInteger('total_cents')->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('held_at')->nullable();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['restaurant_table_id', 'status']);
            $table->index(['worker_id', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name', 160);
            $table->unsignedBigInteger('unit_price_cents');
            $table->unsignedSmallInteger('quantity');
            $table->unsignedBigInteger('line_total_cents');
            $table->timestamps();

            $table->unique(['order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
