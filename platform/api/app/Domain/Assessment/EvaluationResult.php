<?php

namespace App\Domain\Assessment;

final readonly class EvaluationResult
{
    public function __construct(
        public int $overallScore,
        public array $criteria,
        public array $strengths,
        public array $gaps,
        public array $nextSteps,
        public float $confidence,
        public array $metadata = [],
    ) {}
}
