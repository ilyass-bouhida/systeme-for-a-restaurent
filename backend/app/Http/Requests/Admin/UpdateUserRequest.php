<?php

namespace App\Http\Requests\Admin;

use App\Support\Permissions;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends StoreUserRequest
{
    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => [
                'sometimes',
                'required',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($user),
            ],
            'password' => [
                'nullable',
                'confirmed',
                Password::min(10)->mixedCase()->numbers(),
            ],
            'role' => ['sometimes', Rule::in(['admin', 'worker'])],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
