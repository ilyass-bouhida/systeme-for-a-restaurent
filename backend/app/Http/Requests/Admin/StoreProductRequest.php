<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('products.create') === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_cents' => ['required', 'integer', 'min:1', 'max:999999999'],
            'cost_cents' => ['required', 'integer', 'min:0', 'lte:price_cents', 'max:999999999'],
            'image' => ['nullable', 'image', 'max:5120'],
            'generate_image' => ['sometimes', 'boolean'],
            'image_prompt' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
