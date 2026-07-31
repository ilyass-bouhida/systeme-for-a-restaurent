<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateTableRequest extends StoreTableRequest
{
    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        $table = $this->route('table');

        return [
            'label' => [
                'sometimes',
                'required',
                'string',
                'max:80',
                Rule::unique('restaurant_tables', 'label')->ignore($table),
            ],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
