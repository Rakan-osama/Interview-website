<?php

namespace Tests\Unit;

use App\Infrastructure\AI\DeterministicRubricEvaluator;
use App\Models\Lesson;
use App\Models\RubricCriterion;
use Illuminate\Database\Eloquent\Collection;
use PHPUnit\Framework\TestCase;

class DeterministicRubricEvaluatorTest extends TestCase
{
    public function test_it_scores_expected_rubric_evidence_without_a_provider(): void
    {
        $lesson = new Lesson(['interview_question' => 'How?', 'model_answer' => 'Use idempotency.']);
        $criterion = new RubricCriterion(['label' => 'Safety', 'terms' => ['idempotency', 'transaction']]);
        $criterion->id = 'criterion-1';
        $lesson->setRelation('criteria', new Collection([$criterion]));
        $result = (new DeterministicRubricEvaluator)->evaluate($lesson, 'Use an idempotency key.');
        $this->assertSame(50, $result->overallScore);
        $this->assertSame('Safety', $result->gaps[0]);
        $this->assertSame('deterministic', $result->metadata['provider']);
    }
}
