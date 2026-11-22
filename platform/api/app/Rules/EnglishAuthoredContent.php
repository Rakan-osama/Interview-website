<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class EnglishAuthoredContent implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && preg_match('/\p{Arabic}/u', $value) === 1) {
            $fail('Authored curriculum content must be written in English. Learner names and answers are not restricted by this rule.');
        }
    }
}
