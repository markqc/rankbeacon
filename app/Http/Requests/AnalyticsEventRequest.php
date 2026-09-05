<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AnalyticsEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'event_type' => ['required', 'string', 'in:page_view,tool_event'],
            'path' => ['required', 'string', 'max:2048'],
            'tool' => ['required_if:event_type,tool_event', 'nullable', 'string', 'max:255'],
            'action' => ['required_if:event_type,tool_event', 'nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function passedValidation(): void
    {
        $this->merge([
            'metadata' => $this->filterMetadata($this->input('metadata', [])),
        ]);
    }

    private function filterMetadata(mixed $metadata): array
    {
        if (! is_array($metadata)) {
            return [];
        }

        return collect($metadata)
            ->reject(fn ($value, $key) => is_string($key) && str_contains(strtolower($key), 'password'))
            ->toArray();
    }
}
