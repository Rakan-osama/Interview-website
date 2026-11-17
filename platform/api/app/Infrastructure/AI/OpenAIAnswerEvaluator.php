<?php

namespace App\Infrastructure\AI;

use App\Domain\Assessment\AnswerEvaluator;
use App\Domain\Assessment\EvaluationResult;
use App\Models\Lesson;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class OpenAIAnswerEvaluator implements AnswerEvaluator
{
    public function evaluate(Lesson $lesson, string $answer): EvaluationResult
    {
        $response = Http::withToken(config('assessment.openai.key'))
            ->timeout(config('assessment.openai.timeout'))
            ->retry(2, 300, throw: false)
            ->post('https://api.openai.com/v1/responses', [
                'model' => config('assessment.openai.model'),
                'store' => false,
                'instructions' => 'Evaluate the interview answer only against the supplied rubric. Return evidence-based, concise feedback.',
                'input' => json_encode([
                    'question' => $lesson->interview_question,
                    'model_answer' => $lesson->model_answer,
                    'rubric' => $lesson->criteria->map->only(['id', 'label', 'terms'])->all(),
                    'candidate_answer' => $answer,
                ], JSON_THROW_ON_ERROR),
                'text' => ['format' => $this->schema()],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('OpenAI provider failed with HTTP '.$response->status());
        }

        $payload = $response->json();
        $content = collect($payload['output'] ?? [])->flatMap(fn (array $item): array => $item['content'] ?? []);
        $refusal = $content->first(fn (array $item): bool => ($item['type'] ?? null) === 'refusal');
        if ($refusal) throw new RuntimeException('OpenAI refused the assessment request.');
        $text = data_get($content->first(fn (array $item): bool => ($item['type'] ?? null) === 'output_text'), 'text');
        if (! is_string($text)) {
            throw new RuntimeException('OpenAI returned no structured assessment.');
        }

        $result = json_decode($text, true, flags: JSON_THROW_ON_ERROR);
        return new EvaluationResult(
            $result['overall_score'],
            $result['criteria'],
            $result['strengths'],
            $result['gaps'],
            $result['next_steps'],
            $result['confidence'],
            ['provider' => 'openai', 'response_id' => $payload['id'] ?? null, 'usage' => $payload['usage'] ?? null],
        );
    }

    private function schema(): array
    {
        $textList = ['type' => 'array', 'items' => ['type' => 'string']];
        return [
            'type' => 'json_schema',
            'name' => 'answer_assessment',
            'strict' => true,
            'schema' => [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['overall_score', 'criteria', 'strengths', 'gaps', 'next_steps', 'confidence'],
                'properties' => [
                    'overall_score' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 100],
                    'criteria' => ['type' => 'array', 'items' => [
                        'type' => 'object', 'additionalProperties' => false,
                        'required' => ['criterion_id', 'label', 'score', 'evidence'],
                        'properties' => [
                            'criterion_id' => ['type' => 'string'], 'label' => ['type' => 'string'],
                            'score' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 100],
                            'evidence' => ['type' => 'string'],
                        ],
                    ]],
                    'strengths' => $textList, 'gaps' => $textList, 'next_steps' => $textList,
                    'confidence' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                ],
            ],
        ];
    }
}
