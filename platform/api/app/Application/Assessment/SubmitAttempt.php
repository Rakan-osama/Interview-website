<?php

namespace App\Application\Assessment;

use App\Jobs\EvaluateAttempt;
use App\Models\AssessmentJob;
use App\Models\Attempt;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class SubmitAttempt
{
    public function handle(User $user, Lesson $lesson, string $answer, ?string $idempotencyKey = null): Attempt
    {
        return DB::transaction(function () use ($user, $lesson, $answer, $idempotencyKey): Attempt {
            if ($idempotencyKey) {
                $processed = DB::table('processed_mutations')->where('user_id', $user->id)->where('idempotency_key', $idempotencyKey)->first();
                if ($processed) return Attempt::findOrFail(json_decode($processed->response, true)['attempt_id']);
            }
            $attempt = Attempt::create([
                'user_id' => $user->id,
                'lesson_id' => $lesson->id,
                'answer' => $answer,
                'status' => 'queued',
            ]);
            AssessmentJob::create([
                'attempt_id' => $attempt->id,
                'provider' => config('assessment.driver'),
                'model' => config('assessment.driver') === 'openai' ? config('assessment.openai.model') : null,
                'status' => 'queued',
            ]);
            EvaluateAttempt::dispatch($attempt->id)->afterCommit();
            if ($idempotencyKey) DB::table('processed_mutations')->insert([
                'id' => (string) str()->ulid(), 'user_id' => $user->id, 'idempotency_key' => $idempotencyKey,
                'operation' => 'attempt.submit', 'response' => json_encode(['attempt_id' => $attempt->id]),
                'created_at' => now(), 'updated_at' => now(),
            ]);
            return $attempt;
        });
    }
}
