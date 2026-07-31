<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('tables.manage') === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:80', 'unique:restaurant_tables,label'],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
