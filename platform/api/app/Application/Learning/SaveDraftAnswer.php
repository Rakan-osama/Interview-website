<?php

namespace App\Application\Learning;

use App\Models\DraftAnswer;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

final class SaveDraftAnswer
{
    public function handle(User $user, Lesson $lesson, string $answer, ?int $expectedVersion): ?DraftAnswer
    {
        return DB::transaction(function () use ($user, $lesson, $answer, $expectedVersion): ?DraftAnswer {
            $draft = DraftAnswer::query()
                ->where('user_id', $user->id)
                ->where('lesson_id', $lesson->id)
                ->lockForUpdate()
                ->first();

            if ($draft && $expectedVersion !== null && $draft->version !== $expectedVersion) {
                throw new ConflictHttpException('The answer was changed in another session. Reload before editing.');
            }

            if (trim($answer) === '') {
                $draft?->delete();

                return null;
            }

            if (! $draft) {
                return DraftAnswer::create([
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                    'answer' => $answer,
                    'version' => 1,
                ]);
            }

            if ($draft->answer !== $answer) {
                $draft->update(['answer' => $answer, 'version' => $draft->version + 1]);
            }

            return $draft->refresh();
        });
    }
}
