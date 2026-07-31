<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'processed_by',
        'method',
        'total_cents',
        'paid_cents',
        'change_cents',
        'terminal_reference',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'method' => PaymentMethod::class,
            'total_cents' => 'integer',
            'paid_cents' => 'integer',
            'change_cents' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function receipt(): HasOne
    {
        return $this->hasOne(Receipt::class);
    }
}
