<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email_normalized')],
            'status' => ['required', 'string', 'in:active,inactive'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', Rule::exists('roles', 'id')],
            'send_notification' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'roles.*' => 'role',
        ];
    }

    public function shouldSendNotification(): bool
    {
        return (bool) $this->input('send_notification', false);
    }
}
