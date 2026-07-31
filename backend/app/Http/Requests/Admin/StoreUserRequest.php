<?php

namespace App\Http\Requests\Admin;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.manage') === true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(10)->mixedCase()->numbers(),
            ],
            'role' => ['required', Rule::in(['admin', 'worker'])],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
