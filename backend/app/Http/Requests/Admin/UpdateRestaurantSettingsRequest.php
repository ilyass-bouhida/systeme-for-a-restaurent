<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRestaurantSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'restaurant_name' => ['required', 'string', 'max:80'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('restaurant_name')) {
            $this->merge([
                'restaurant_name' => trim((string) $this->input('restaurant_name')),
            ]);
        }
    }
}
