<?php

namespace App\Infrastructure\AI;

use App\Domain\Assessment\AnswerEvaluator;
use InvalidArgumentException;

final class AnswerEvaluatorFactory
{
    public function make(?string $driver = null): AnswerEvaluator
    {
        return match ($driver ?? config('assessment.driver')) {
            'openai' => app(OpenAIAnswerEvaluator::class),
            'deterministic' => app(DeterministicRubricEvaluator::class),
            default => throw new InvalidArgumentException('Unsupported assessment driver.'),
        };
    }
}
