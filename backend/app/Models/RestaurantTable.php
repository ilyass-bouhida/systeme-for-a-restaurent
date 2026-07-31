<?php

namespace App\Models;

use App\Enums\TableStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class RestaurantTable extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'label',
        'capacity',
        'status',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'status' => TableStatus::class,
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function activeOrder(): HasOne
    {
        return $this->hasOne(Order::class)
            ->ofMany(['id' => 'max'], function ($query): void {
                $query->whereIn('status', ['open', 'held']);
            });
    }
}
