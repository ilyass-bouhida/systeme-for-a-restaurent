<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderGuestsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('orders.manage') === true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'guest_count' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }
}
