<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('restaurant.operations', function (User $user): bool {
    return $user->is_active
        && ($user->can('cashier.access') || $user->hasRole('admin'));
});
