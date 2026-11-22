<?php

namespace App\Http\Requests\Admin;

use App\Rules\EnglishAuthoredContent;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('lesson')) ?? false;
    }

    public function rules(): array
    {
        $english = new EnglishAuthoredContent;

        return [
            'version' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255', $english],
            'objective' => ['nullable', 'string', 'max:5000', $english],
            'explanation' => ['required', 'string', 'max:100000', $english],
            'plain_explanation' => ['nullable', 'string', 'max:100000', $english],
            'practical_example' => ['nullable', 'string', 'max:100000', $english],
            'interview_question' => ['required', 'string', 'max:10000', $english],
            'model_answer' => ['required', 'string', 'max:100000', $english],
            'code' => ['nullable', 'string', 'max:100000', $english],
            'reference_solution' => ['nullable', 'string', 'max:100000', $english],
            'common_mistake' => ['nullable', 'string', 'max:50000', $english],
            'pitfall' => ['nullable', 'string', 'max:50000', $english],
            'criteria' => ['required', 'array', 'min:1'],
            'criteria.*.label' => ['required', 'string', 'max:255', $english],
            'criteria.*.description' => ['required', 'string', 'max:2000', $english],
            'criteria.*.terms' => ['required', 'array'],
            'criteria.*.terms.*' => ['string', 'max:255', $english],
            'criteria.*.evidence_groups' => ['required', 'array', 'min:1'],
            'criteria.*.evidence_groups.*' => ['array', 'min:1'],
            'criteria.*.evidence_groups.*.*' => ['string', 'max:255', $english],
            'criteria.*.weight' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }
}
