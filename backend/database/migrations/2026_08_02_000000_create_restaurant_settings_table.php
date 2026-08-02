<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('restaurant_name', 80);
            $table->timestamps();
        });

        DB::table('restaurant_settings')->insert([
            'id' => 1,
            'restaurant_name' => 'Gigino',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_settings');
    }
};
