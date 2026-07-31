<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function __construct(private readonly ActivityService $activity) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()
                ->withCount('products')
                ->orderBy('display_order')
                ->orderBy('name')
                ->get(),
        );
    }

    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $category = Category::query()->create($data);
        $this->activity->record($request->user(), 'category.created', $category);

        return new CategoryResource($category);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->load('products'));
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category,
    ): CategoryResource {
        $data = $request->validated();
        if (isset($data['name']) && $data['name'] !== $category->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category);
        }
        $category->update($data);
        $this->activity->record($request->user(), 'category.updated', $category);

        return new CategoryResource($category->refresh());
    }

    public function destroy(Category $category, Request $request): JsonResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Move or delete the products in this category first.',
            ]);
        }

        $category->delete();
        $this->activity->record($request->user(), 'category.deleted', $category);

        return response()->json(status: 204);
    }

    private function uniqueSlug(string $name, ?Category $except = null): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $counter = 2;

        while (Category::withTrashed()
            ->where('slug', $slug)
            ->when($except, fn ($query) => $query->whereKeyNot($except->id))
            ->exists()
        ) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }
}
