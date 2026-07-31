<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('processed_by')->constrained('users')->restrictOnDelete();
            $table->string('method', 20)->index();
            $table->unsignedBigInteger('total_cents');
            $table->unsignedBigInteger('paid_cents');
            $table->unsignedBigInteger('change_cents')->default(0);
            $table->string('terminal_reference')->nullable();
            $table->timestamp('completed_at')->index();
            $table->timestamps();
        });

        Schema::create('receipts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('payment_id')->unique()->constrained()->restrictOnDelete();
            $table->string('number', 40)->unique();
            $table->json('payload');
            $table->timestamp('last_printed_at')->nullable();
            $table->unsignedInteger('print_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('payments');
    }
};
