<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_is_private_and_reports_user_progress(): void
    {
        $this->getJson('/api/v1/me/dashboard')->assertUnauthorized();
        [$user, $lesson] = $this->learnerAndLesson();
        DB::table('attempts')->insert([
            'id' => (string) Str::ulid(), 'user_id' => $user->id, 'lesson_id' => $lesson->id,
            'answer' => 'A sufficiently detailed migrated answer.', 'status' => 'completed', 'overall_score' => 80,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('bookmarks')->insert(['user_id' => $user->id, 'lesson_id' => $lesson->id, 'created_at' => now(), 'updated_at' => now()]);

        $this->actingAs($user)->getJson('/api/v1/me/dashboard')->assertOk()->assertJsonPath('data.completedLessons', 1)
            ->assertJsonPath('data.averageScore', 80)->assertJsonPath('data.bookmarkedLessons', 1);
    }

    public function test_browser_import_can_be_previewed_then_applied_once(): void
    {
        [$user] = $this->learnerAndLesson();
        $payload = ['progress' => [
            'attempts' => ['0-0' => ['answer' => 'Legacy answer', 'hits' => [true, false]]],
            'drafts' => ['0-0' => 'Legacy draft'], 'bookmarks' => ['0-0'],
        ]];
        $this->actingAs($user)->postJson('/api/v1/legacy-progress/import', $payload)->assertOk()
            ->assertJsonPath('data.mapped_lessons', 1);
        $this->assertDatabaseCount('attempts', 0);
        $this->actingAs($user)->postJson('/api/v1/legacy-progress/import', $payload + ['apply' => true])->assertOk()
            ->assertJsonPath('data.already_imported', false);
        $this->actingAs($user)->postJson('/api/v1/legacy-progress/import', $payload + ['apply' => true])->assertOk()
            ->assertJsonPath('data.already_imported', true);
        $this->assertDatabaseCount('attempts', 1);
    }

    private function learnerAndLesson(): array
    {
        $user = User::factory()->create();
        $track = Track::create(['slug' => 'progress', 'legacy_key' => 'progress-track', 'title' => 'Progress']);
        $lesson = Lesson::create([
            'track_id' => $track->id, 'slug' => 'first', 'legacy_key' => '0-0', 'title' => 'First',
            'explanation' => 'Explanation', 'interview_question' => 'Question?', 'model_answer' => 'Answer',
        ]);
        return [$user, $lesson];
    }
}
