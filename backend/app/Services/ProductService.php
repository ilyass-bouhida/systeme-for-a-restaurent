<?php

namespace App\Services;

use App\Contracts\ProductImageGenerator;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(
        private readonly ProductImageGenerator $imageGenerator,
        private readonly ActivityService $activity,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image, User $actor): Product
    {
        $data['slug'] = $this->uniqueSlug((string) $data['name']);
        $data['image_path'] = $this->resolveImage(
            image: $image,
            generate: (bool) ($data['generate_image'] ?? false),
            prompt: (string) ($data['image_prompt'] ?? $data['name']),
        );
        unset($data['generate_image'], $data['image_prompt']);

        $product = Product::query()->create($data);
        $this->activity->record($actor, 'product.created', $product);

        return $product->load('category');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(
        Product $product,
        array $data,
        ?UploadedFile $image,
        User $actor,
    ): Product {
        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug((string) $data['name'], $product);
        }

        if ($image || ($data['generate_image'] ?? false)) {
            $newPath = $this->resolveImage(
                image: $image,
                generate: (bool) ($data['generate_image'] ?? false),
                prompt: (string) ($data['image_prompt'] ?? $data['name'] ?? $product->name),
            );
            $this->deleteManagedImage($product->image_path);
            $data['image_path'] = $newPath;
        }

        unset($data['generate_image'], $data['image_prompt']);
        $product->update($data);
        $this->activity->record($actor, 'product.updated', $product);

        return $product->fresh('category');
    }

    public function delete(Product $product, User $actor): void
    {
        $product->delete();
        $this->activity->record($actor, 'product.deleted', $product);
    }

    private function resolveImage(
        ?UploadedFile $image,
        bool $generate,
        string $prompt,
    ): ?string {
        if ($image) {
            return $image->store('products', 'public');
        }

        return $generate ? $this->imageGenerator->generate($prompt) : null;
    }

    private function uniqueSlug(string $name, ?Product $except = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $counter = 2;

        while (Product::withTrashed()
            ->where('slug', $slug)
            ->when($except, fn ($query) => $query->whereKeyNot($except->id))
            ->exists()
        ) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function deleteManagedImage(?string $path): void
    {
        if ($path && ! Str::startsWith($path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($path);
        }
    }
}
