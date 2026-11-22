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
        [$attempt, $created] = DB::transaction(function () use ($user, $lesson, $answer, $idempotencyKey): array {
            if ($idempotencyKey) {
                $processed = DB::table('processed_mutations')->where('user_id', $user->id)->where('idempotency_key', $idempotencyKey)->first();
                if ($processed) {
                    return [Attempt::findOrFail(json_decode($processed->response, true)['attempt_id']), false];
                }
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
            if ($idempotencyKey) {
                DB::table('processed_mutations')->insert([
                    'id' => (string) str()->ulid(), 'user_id' => $user->id, 'idempotency_key' => $idempotencyKey,
                    'operation' => 'attempt.submit', 'response' => json_encode(['attempt_id' => $attempt->id]),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }

            return [$attempt, true];
        });
        if ($created) {
            config('assessment.sync_local')
                ? EvaluateAttempt::dispatchSync($attempt->id)
                : EvaluateAttempt::dispatch($attempt->id);
        }

        return $attempt;
    }
}
