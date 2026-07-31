<?php

namespace App\Http\Requests\Payments;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.process') === true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'method' => ['required', Rule::enum(PaymentMethod::class)],
            'paid_cents' => [
                'nullable',
                'required_if:method,cash',
                'integer',
                'min:0',
                'max:999999999',
            ],
        ];
    }
}
