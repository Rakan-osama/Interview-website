<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveDraftAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answer' => ['present', 'string', 'max:50000'],
            'version' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
