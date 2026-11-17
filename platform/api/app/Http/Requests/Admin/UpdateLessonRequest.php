<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('lesson')) ?? false;
    }

    public function rules(): array
    {
        return [
            'version' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string', 'max:5000'],
            'explanation' => ['required', 'string', 'max:100000'],
            'plain_explanation' => ['nullable', 'string', 'max:100000'],
            'practical_example' => ['nullable', 'string', 'max:100000'],
            'interview_question' => ['required', 'string', 'max:10000'],
            'model_answer' => ['required', 'string', 'max:100000'],
            'code' => ['nullable', 'string', 'max:100000'],
            'reference_solution' => ['nullable', 'string', 'max:100000'],
            'common_mistake' => ['nullable', 'string', 'max:50000'],
            'pitfall' => ['nullable', 'string', 'max:50000'],
            'criteria' => ['required', 'array', 'min:1'],
            'criteria.*.label' => ['required', 'string', 'max:255'],
            'criteria.*.terms' => ['required', 'array'],
            'criteria.*.terms.*' => ['string', 'max:255'],
            'criteria.*.weight' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
