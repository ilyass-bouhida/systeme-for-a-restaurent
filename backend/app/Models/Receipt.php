<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'number',
        'payload',
        'last_printed_at',
        'print_count',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'last_printed_at' => 'datetime',
            'print_count' => 'integer',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
