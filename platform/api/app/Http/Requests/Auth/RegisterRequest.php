<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name is required.',
            'name.max' => 'The name may not exceed 100 characters.',
            'email.required' => 'The email address is required.',
            'email.email' => 'Enter a valid email address.',
            'email.unique' => 'An account already uses this email address. Try signing in.',
            'password.required' => 'The password is required.',
            'password.min' => 'The password must contain at least 8 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
