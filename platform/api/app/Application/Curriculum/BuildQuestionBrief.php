<?php

namespace App\Application\Curriculum;

use App\Models\Lesson;

final class BuildQuestionBrief
{
    public function forLesson(Lesson $lesson): array
    {
        return [
            'context' => $lesson->practical_example ?: $this->fallbackContext($lesson),
            'task' => $this->specificTask($lesson->interview_question),
            'requirements' => $lesson->criteria->values()->map(
                fn ($criterion, int $index): array => [
                    'id' => $criterion->id,
                    'title' => $criterion->label,
                    'explanation' => $criterion->description ?: $this->requirementExplanation($criterion->label, $index),
                    'evidenceGroups' => $criterion->evidence_groups ?? [],
                    'claimIds' => $criterion->claims->pluck('id')->all(),
                    'weight' => $criterion->weight,
                ],
            )->all(),
            'answerStructure' => [
                'Start with a direct answer to the question in one or two sentences.',
                'Explain the mechanism and why it produces the stated behavior.',
                'Apply the explanation to the production scenario with a concrete decision or example.',
                'Finish with a trade-off or failure mode and a test, metric, or other verification step.',
            ],
            'successDefinition' => 'A strong answer explains the mechanism, causal reason, and production decision. Naming tools or copying keywords without connecting them to the scenario is not enough.',
        ];
    }

    private function requirementExplanation(string $label, int $index): string
    {
        return match ($index) {
            0 => "Define {$label} in your own words and connect it directly to the question.",
            1 => "Explain how {$label} works and why it matters, not only its final effect.",
            2 => "Turn {$label} into a concrete implementation decision or production example.",
            default => "Explain the impact of {$label}, its failure mode, and how the result will be verified.",
        };
    }

    private function fallbackContext(Lesson $lesson): string
    {
        return "You are reviewing a production decision involving {$lesson->title}. Explain the expected behavior and risk before the change is approved.";
    }

    private function specificTask(string $question): string
    {
        return trim(explode("\n\nAnswer requirements:", $question, 2)[0]);
    }
}
