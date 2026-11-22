<?php

namespace App\Infrastructure\AI;

use App\Domain\Assessment\AnswerEvaluator;
use App\Domain\Assessment\EvaluationResult;
use App\Models\Lesson;

final class DeterministicRubricEvaluator implements AnswerEvaluator
{
    public function evaluate(Lesson $lesson, string $answer): EvaluationResult
    {
        $haystack = $this->normalize($answer);
        $criteria = $lesson->criteria->map(function ($criterion) use ($haystack): array {
            $groups = $this->groups($criterion->evidence_groups, $criterion->terms ?? []);
            $matched = array_values(array_filter(array_map(
                fn (array $aliases): ?string => $this->firstMatch($haystack, $aliases),
                $groups,
            )));
            $ratio = $groups === [] ? 0 : count($matched) / count($groups);

            return [
                'criterion_id' => $criterion->id,
                'label' => $criterion->label,
                'score' => (int) round($ratio * 100),
                'weight' => max(1, (int) $criterion->weight),
                'evidence' => $matched === []
                    ? 'No clear evidence matched this claim.'
                    : 'Matched evidence: '.implode(', ', $matched),
                'feedback' => $ratio >= 1
                    ? 'The answer covers every required evidence group. Keep the causal explanation and production decision explicit.'
                    : 'Explain the missing claim in your own words, connect it to the scenario, and add a concrete verification step.',
            ];
        })->all();

        $totalWeight = array_sum(array_column($criteria, 'weight'));
        $weightedScore = array_sum(array_map(
            fn (array $criterion): int => $criterion['score'] * $criterion['weight'],
            $criteria,
        ));
        $overall = $totalWeight === 0 ? 0 : (int) round($weightedScore / $totalWeight);
        $criteria = array_map(function (array $criterion): array {
            unset($criterion['weight']);

            return $criterion;
        }, $criteria);
        $strengths = array_values(array_map(fn (array $item): string => $item['label'], array_filter($criteria, fn (array $item): bool => $item['score'] >= 60)));
        $gaps = array_values(array_map(fn (array $item): string => $item['label'], array_filter($criteria, fn (array $item): bool => $item['score'] < 60)));

        return new EvaluationResult(
            $overall,
            $criteria,
            $strengths,
            $gaps,
            $gaps === []
                ? ['Compare the structure with the canonical answer and remove any wording that does not support a rubric claim.']
                : ['Add specific evidence for: '.implode(', ', $gaps).'.'],
            0.55,
            ['provider' => 'deterministic'],
        );
    }

    private function groups(?array $configured, array $legacyTerms): array
    {
        $groups = $configured ?: array_map(fn (string $term): array => [$term], $legacyTerms);

        return array_values(array_filter(array_map(function (mixed $group): array {
            $aliases = is_array($group) && array_key_exists('aliases', $group) ? $group['aliases'] : $group;
            $aliases = is_array($aliases) ? $aliases : [$aliases];

            return array_values(array_filter(array_map('strval', $aliases)));
        }, $groups)));
    }

    private function firstMatch(string $haystack, array $aliases): ?string
    {
        foreach ($aliases as $alias) {
            if (str_contains($haystack, $this->normalize($alias))) {
                return $alias;
            }
        }

        return null;
    }

    private function normalize(string $value): string
    {
        return preg_replace('/\s+/u', ' ', mb_strtolower(trim($value))) ?? '';
    }
}
