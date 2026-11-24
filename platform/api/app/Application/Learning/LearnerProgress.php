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

        $completed = $attempts->merge($drafts)->unique();
        $successors = DB::table('lessons')->whereIn('id', $completed)->whereNotNull('superseded_by_lesson_id')
            ->pluck('superseded_by_lesson_id');

        return $completed->merge($successors)->unique()->values()->all();
    }

    public function lessonIsCompleted(string $userId, string $lessonId): bool
    {
        $predecessors = DB::table('lessons')->where('superseded_by_lesson_id', $lessonId)->pluck('id');
        $equivalentIds = $predecessors->prepend($lessonId)->all();
        if (DB::table('attempts')->where('user_id', $userId)->whereIn('lesson_id', $equivalentIds)->exists()) {
            return true;
        }

        $answer = DB::table('draft_answers')
            ->where('user_id', $userId)
            ->whereIn('lesson_id', $equivalentIds)
            ->pluck('answer')
            ->first(fn (string $answer): bool => $this->answerIsComplete($answer));

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
