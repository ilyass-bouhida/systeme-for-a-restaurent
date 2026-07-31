<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $imageUrl = $this->image_path;
        if ($imageUrl && ! Str::startsWith($imageUrl, ['http://', 'https://'])) {
            $imageUrl = Storage::disk('public')->url($imageUrl);
        }

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category->name),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price_cents' => $this->price_cents,
            'cost_cents' => $this->when(
                $request->user()?->hasRole('admin') === true,
                $this->cost_cents,
            ),
            'image_url' => $imageUrl,
            'is_active' => $this->is_active,
            'display_order' => $this->display_order,
        ];
    }
}
