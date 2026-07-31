<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TableResource;
use App\Models\RestaurantTable;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TableController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $tables = RestaurantTable::query()
            ->where('is_active', true)
            ->with(['activeOrder.worker:id,name'])
            ->orderBy('display_order')
            ->orderBy('label')
            ->get();

        return TableResource::collection($tables);
    }
}
