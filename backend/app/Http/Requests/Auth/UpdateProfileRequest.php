<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => [
                'required',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
            ],
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'confirmed', Password::min(10)->letters()->numbers()],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $user = $this->user();
            $emailChanged = $user && mb_strtolower($this->string('email')->toString())
                !== mb_strtolower($user->email);
            $passwordChanged = $this->filled('password');

            if (! $emailChanged && ! $passwordChanged) {
                return;
            }

            $currentPassword = $this->string('current_password')->toString();
            if ($currentPassword === '') {
                $validator->errors()->add(
                    'current_password',
                    'Your current password is required for email or password changes.',
                );

                return;
            }

            if (! Hash::check($currentPassword, $user->password)) {
                $validator->errors()->add('current_password', 'The current password is incorrect.');
            }
        });
    }
}
