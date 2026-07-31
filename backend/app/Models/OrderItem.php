<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'unit_price_cents',
        'unit_cost_cents',
        'quantity',
        'line_total_cents',
        'line_cost_cents',
    ];

    protected function casts(): array
    {
        return [
            'unit_price_cents' => 'integer',
            'unit_cost_cents' => 'integer',
            'quantity' => 'integer',
            'line_total_cents' => 'integer',
            'line_cost_cents' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
