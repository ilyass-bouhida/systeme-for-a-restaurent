<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with('category')
            ->when(
                $request->filled('category_id'),
                fn ($query) => $query->where('category_id', $request->integer('category_id')),
            )
            ->orderBy('display_order')
            ->orderBy('name')
            ->paginate(30);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        return new ProductResource($this->products->create(
            data: $request->safe()->except('image'),
            image: $request->file('image'),
            actor: $request->user(),
        ));
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function update(
        UpdateProductRequest $request,
        Product $product,
    ): ProductResource {
        return new ProductResource($this->products->update(
            product: $product,
            data: $request->safe()->except('image'),
            image: $request->file('image'),
            actor: $request->user(),
        ));
    }

    public function destroy(Product $product, Request $request): JsonResponse
    {
        abort_unless($request->user()->can('products.delete'), 403);
        $this->products->delete($product, $request->user());

        return response()->json(status: 204);
    }
}
