<?php

namespace App\Application\Assessment;

use App\Models\Attempt;
use Illuminate\Support\Facades\DB;

final class AssessmentPayload
{
    public function forAttempt(Attempt $attempt): array
    {
        $job = DB::table('assessment_jobs')->where('attempt_id', $attempt->id)->first();
        $result = $job
            ? DB::table('assessment_results')->where('assessment_job_id', $job->id)->first()
            : null;

        return [
            'id' => $attempt->id,
            'status' => $this->status($attempt->status),
            'overallScore' => $result?->overall_score,
            'criteria' => $this->criteria($result?->criterion_scores),
            'strengths' => $this->json($result?->strengths),
            'gaps' => $this->json($result?->gaps),
            'nextSteps' => $this->json($result?->next_steps),
            'confidence' => $result?->confidence ? (float) $result->confidence : null,
        ];
    }

    private function status(string $status): string
    {
        return match ($status) {
            'queued', 'processing' => 'pending',
            'completed', 'migrated' => 'completed',
            default => 'failed',
        };
    }

    private function json(?string $value): array
    {
        return $value ? json_decode($value, true) : [];
    }

    private function criteria(?string $value): array
    {
        return array_map(fn (array $criterion): array => [
            'criterionId' => $criterion['criterion_id'] ?? '',
            'label' => $criterion['label'] ?? '',
            'met' => ($criterion['score'] ?? 0) >= 60,
            'score' => $criterion['score'] ?? 0,
            'evidence' => $criterion['evidence'] ?? '',
            'feedback' => $criterion['feedback'] ?? '',
        ], $this->json($value));
    }
}
