<?php

namespace App\Infrastructure\AI;

use App\Domain\Assessment\AnswerEvaluator;
use App\Domain\Assessment\EvaluationResult;
use App\Models\Lesson;

final class DeterministicRubricEvaluator implements AnswerEvaluator
{
    public function evaluate(Lesson $lesson, string $answer): EvaluationResult
    {
        $haystack = mb_strtolower($answer);
        $criteria = $lesson->criteria->map(function ($criterion) use ($haystack): array {
            $terms = $criterion->terms ?? [];
            $hits = array_values(array_filter($terms, fn (string $term): bool =>
                str_contains($haystack, mb_strtolower($term))
            ));
            $ratio = count($terms) === 0 ? 0 : count($hits) / count($terms);
            return [
                'criterion_id' => $criterion->id,
                'label' => $criterion->label,
                'score' => (int) round($ratio * 100),
                'evidence' => $hits === [] ? 'No expected evidence found.' : implode(', ', $hits),
            ];
        })->all();

        $overall = $criteria === [] ? 0 : (int) round(array_sum(array_column($criteria, 'score')) / count($criteria));
        $strong = array_values(array_map(fn ($item) => $item['label'], array_filter($criteria, fn ($item) => $item['score'] >= 60)));
        $gaps = array_values(array_map(fn ($item) => $item['label'], array_filter($criteria, fn ($item) => $item['score'] < 60)));

        return new EvaluationResult(
            $overall,
            $criteria,
            $strong,
            $gaps,
            $gaps === [] ? ['Compare your answer with the model answer.'] : ['Add concrete evidence for: '.implode(', ', $gaps)],
            0.55,
            ['provider' => 'deterministic'],
        );
    }
}
