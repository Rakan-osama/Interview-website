<?php

namespace App\Domain\Assessment;

use App\Models\Lesson;

interface AnswerEvaluator
{
    public function evaluate(Lesson $lesson, string $answer): EvaluationResult;
}
