<?php

namespace App\Jobs;

use App\Infrastructure\AI\AnswerEvaluatorFactory;
use App\Models\AssessmentJob;
use App\Models\AssessmentResult;
use App\Models\Attempt;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Throwable;

class EvaluateAttempt implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public function __construct(public readonly string $attemptId) {}

    public function handle(AnswerEvaluatorFactory $factory): void
    {
        $attempt = Attempt::with('lesson.criteria.claims')->findOrFail($this->attemptId);
        $job = AssessmentJob::where('attempt_id', $attempt->id)->firstOrFail();
        $job->update(['status' => 'processing']);

        try {
            $result = $factory->make()->evaluate($attempt->lesson, $attempt->answer);
        } catch (Throwable $exception) {
            if (config('assessment.driver') === config('assessment.fallback_driver')) {
                throw $exception;
            }
            report($exception);
            $result = $factory->make(config('assessment.fallback_driver'))->evaluate($attempt->lesson, $attempt->answer);
        }

        DB::transaction(function () use ($attempt, $job, $result): void {
            AssessmentResult::updateOrCreate(['assessment_job_id' => $job->id], [
                'overall_score' => $result->overallScore,
                'criterion_scores' => $result->criteria,
                'strengths' => $result->strengths,
                'gaps' => $result->gaps,
                'next_steps' => $result->nextSteps,
                'confidence' => $result->confidence,
                'raw_metadata' => $result->metadata,
            ]);
            $usage = $result->metadata['usage'] ?? [];
            $job->update([
                'status' => 'completed',
                'input_tokens' => $usage['input_tokens'] ?? null,
                'output_tokens' => $usage['output_tokens'] ?? null,
                'completed_at' => now(),
            ]);
            $attempt->update(['status' => 'completed', 'overall_score' => $result->overallScore]);
        });
    }

    public function failed(Throwable $exception): void
    {
        AssessmentJob::where('attempt_id', $this->attemptId)->update([
            'status' => 'failed',
            'failure_code' => class_basename($exception),
            'failure_message' => mb_substr($exception->getMessage(), 0, 1000),
        ]);
        Attempt::whereKey($this->attemptId)->update(['status' => 'failed']);
    }
}
