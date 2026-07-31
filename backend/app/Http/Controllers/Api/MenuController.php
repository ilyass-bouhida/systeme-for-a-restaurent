<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->with(['products' => fn ($query) => $query
                ->where('is_active', true)
                ->orderBy('display_order')
                ->orderBy('name')])
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }
}
