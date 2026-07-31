<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Validator;

class UpdateProductRequest extends StoreProductRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('products.update') === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price_cents' => ['sometimes', 'required', 'integer', 'min:1', 'max:999999999'],
            'cost_cents' => ['sometimes', 'required', 'integer', 'min:0', 'max:999999999'],
            'image' => ['nullable', 'image', 'max:5120'],
            'generate_image' => ['sometimes', 'boolean'],
            'image_prompt' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $product = $this->route('product');
            $price = $this->has('price_cents')
                ? $this->integer('price_cents')
                : (int) $product?->price_cents;
            $cost = $this->has('cost_cents')
                ? $this->integer('cost_cents')
                : (int) $product?->cost_cents;

            if ($cost > $price) {
                $validator->errors()->add(
                    'cost_cents',
                    'The product cost cannot be higher than its selling price.',
                );
            }
        });
    }
}
