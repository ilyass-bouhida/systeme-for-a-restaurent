<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantSetting extends Model
{
    public const SINGLETON_ID = 1;

    protected $fillable = [
        'restaurant_name',
    ];
}
