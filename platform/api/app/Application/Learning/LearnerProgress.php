<?php

namespace App\Application\Learning;

use Illuminate\Support\Facades\DB;

final class LearnerProgress
{
    public function completedLessonIds(string $userId): array
    {
        $attempts = DB::table('attempts')
            ->where('user_id', $userId)
            ->distinct()
            ->pluck('lesson_id');

        $drafts = DB::table('draft_answers')
            ->where('user_id', $userId)
            ->get(['lesson_id', 'answer'])
            ->filter(fn (object $draft): bool => $this->answerIsComplete($draft->answer))
            ->pluck('lesson_id');

        return $attempts->merge($drafts)->unique()->values()->all();
    }

    public function lessonIsCompleted(string $userId, string $lessonId): bool
    {
        if (DB::table('attempts')->where('user_id', $userId)->where('lesson_id', $lessonId)->exists()) {
            return true;
        }

        $answer = DB::table('draft_answers')
            ->where('user_id', $userId)
            ->where('lesson_id', $lessonId)
            ->value('answer');

        return is_string($answer) && $this->answerIsComplete($answer);
    }

    public function minimumAnswerLength(): int
    {
        return (int) config('learning.minimum_answer_length', 35);
    }

    private function answerIsComplete(string $answer): bool
    {
        return mb_strlen(trim($answer)) >= $this->minimumAnswerLength();
    }
}
