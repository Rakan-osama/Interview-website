<?php

namespace App\Application\Learning;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class ImportLegacyProgress
{
    public function preview(array $progress): array
    {
        $keys = array_unique(array_merge(array_keys($progress['attempts'] ?? []), array_keys($progress['drafts'] ?? []), $progress['bookmarks'] ?? []));
        $mapped = Lesson::whereIn('legacy_key', $keys)->count();
        return [
            'attempts' => count($progress['attempts'] ?? []), 'drafts' => count($progress['drafts'] ?? []),
            'bookmarks' => count($progress['bookmarks'] ?? []), 'unique_lessons' => count($keys),
            'mapped_lessons' => $mapped, 'unmapped_lessons' => count($keys) - $mapped,
        ];
    }

    public function apply(User $user, array $progress, string $source): array
    {
        $hash = hash('sha256', json_encode($progress, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        $existing = DB::table('legacy_imports')->where(['user_id' => $user->id, 'source' => $source, 'payload_hash' => $hash])->first();
        if ($existing) return json_decode($existing->totals, true) + ['already_imported' => true];
        $totals = $this->preview($progress);
        abort_if($totals['unmapped_lessons'] > 0, 422, 'Legacy progress contains unknown lesson identifiers.');

        DB::transaction(function () use ($user, $progress, $source, $hash, $totals): void {
            $lessons = Lesson::whereIn('legacy_key', array_unique(array_merge(array_keys($progress['attempts'] ?? []), array_keys($progress['drafts'] ?? []), $progress['bookmarks'] ?? [])))->get()->keyBy('legacy_key');
            $this->importAttempts($user, $progress['attempts'] ?? [], $lessons);
            $this->importDrafts($user, $progress['drafts'] ?? [], $lessons);
            $this->importBookmarks($user, $progress['bookmarks'] ?? [], $lessons);
            DB::table('legacy_imports')->insert([
                'id' => (string) Str::ulid(), 'user_id' => $user->id, 'source' => $source,
                'payload_hash' => $hash, 'totals' => json_encode($totals), 'created_at' => now(), 'updated_at' => now(),
            ]);
        });
        return $totals + ['already_imported' => false];
    }

    private function importAttempts(User $user, array $attempts, $lessons): void
    {
        foreach ($attempts as $legacyKey => $attempt) {
            $duplicate = DB::table('attempts')->where('user_id', $user->id)->where('lesson_id', $lessons[$legacyKey]->id)->where('answer', $attempt['answer'])->exists();
            if (! $duplicate) DB::table('attempts')->insert([
                'id' => (string) Str::ulid(), 'user_id' => $user->id, 'lesson_id' => $lessons[$legacyKey]->id,
                'answer' => $attempt['answer'], 'status' => 'migrated',
                'overall_score' => isset($attempt['hits']) ? (int) round(count(array_filter($attempt['hits'])) / max(1, count($attempt['hits'])) * 100) : null,
                'created_at' => $attempt['date'] ?? now(), 'updated_at' => now(),
            ]);
        }
    }

    private function importDrafts(User $user, array $drafts, $lessons): void
    {
        foreach ($drafts as $legacyKey => $answer) DB::table('draft_answers')->updateOrInsert(
            ['user_id' => $user->id, 'lesson_id' => $lessons[$legacyKey]->id],
            ['id' => DB::table('draft_answers')->where(['user_id' => $user->id, 'lesson_id' => $lessons[$legacyKey]->id])->value('id') ?? (string) Str::ulid(), 'answer' => $answer, 'updated_at' => now(), 'created_at' => now()]
        );
    }

    private function importBookmarks(User $user, array $bookmarks, $lessons): void
    {
        foreach ($bookmarks as $legacyKey) DB::table('bookmarks')->insertOrIgnore(['user_id' => $user->id, 'lesson_id' => $lessons[$legacyKey]->id, 'created_at' => now(), 'updated_at' => now()]);
    }
}
