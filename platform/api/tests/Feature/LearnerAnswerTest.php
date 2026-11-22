<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\RubricCriterion;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearnerAnswerTest extends TestCase
{
    use RefreshDatabase;

    public function test_answers_are_isolated_saved_and_counted_as_progress(): void
    {
        [$track, $first, $second] = $this->curriculum();
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $firstAnswer = 'The first answer belongs only to the first interview question.';
        $secondAnswer = 'The second answer is independently stored for the next question.';

        $this->actingAs($user)->putJson("/api/v1/lessons/{$first->id}/draft", [
            'answer' => $firstAnswer,
            'version' => null,
        ])->assertOk()->assertJsonPath('data.version', 1)->assertJsonPath('data.completed', true);

        $this->actingAs($user)->getJson("/api/v1/lessons/{$first->id}")
            ->assertOk()
            ->assertJsonPath('data.learnerState.answer', $firstAnswer)
            ->assertJsonPath('data.completed', true);
        $this->actingAs($user)->getJson("/api/v1/lessons/{$second->id}")
            ->assertOk()
            ->assertJsonPath('data.learnerState.answer', '')
            ->assertJsonPath('data.completed', false);

        $this->actingAs($user)->putJson("/api/v1/lessons/{$second->id}/draft", [
            'answer' => $secondAnswer,
            'version' => null,
        ])->assertOk()->assertJsonPath('data.completed', true);

        $this->actingAs($user)->getJson("/api/v1/tracks/{$track->slug}")
            ->assertOk()
            ->assertJsonPath('data.lessons.0.completed', true)
            ->assertJsonPath('data.lessons.1.completed', true);
        $this->actingAs($user)->getJson('/api/v1/me/dashboard')
            ->assertOk()
            ->assertJsonPath('data.completedLessons', 2);

        $this->actingAs($otherUser)->getJson("/api/v1/lessons/{$first->id}")
            ->assertOk()
            ->assertJsonPath('data.learnerState.answer', '')
            ->assertJsonPath('data.completed', false);
        $this->assertDatabaseCount('draft_answers', 2);
    }

    public function test_latest_answer_and_assessment_return_after_a_new_login(): void
    {
        [, $lesson] = $this->curriculum();
        $user = User::factory()->create();
        RubricCriterion::create([
            'lesson_id' => $lesson->id,
            'label' => 'Safe retry',
            'terms' => ['idempotency'],
            'weight' => 1,
            'position' => 0,
        ]);
        $answer = 'Use an idempotency key so retrying the same operation remains safe.';

        $attempt = $this->actingAs($user)->postJson("/api/v1/lessons/{$lesson->id}/attempts", [
            'answer' => $answer,
        ])->assertAccepted();

        $this->app['auth']->forgetGuards();
        $this->actingAs($user)->getJson("/api/v1/lessons/{$lesson->id}")
            ->assertOk()
            ->assertJsonPath('data.learnerState.answer', $answer)
            ->assertJsonPath('data.learnerState.assessment.id', $attempt->json('data.id'))
            ->assertJsonPath('data.learnerState.assessment.status', 'completed')
            ->assertJsonPath('data.completed', true);
    }

    public function test_stale_draft_version_cannot_overwrite_a_newer_answer(): void
    {
        [, $lesson] = $this->curriculum();
        $user = User::factory()->create();

        $this->actingAs($user)->putJson("/api/v1/lessons/{$lesson->id}/draft", [
            'answer' => 'Original answer with enough detail to be saved safely.',
        ])->assertOk()->assertJsonPath('data.version', 1);
        $this->actingAs($user)->putJson("/api/v1/lessons/{$lesson->id}/draft", [
            'answer' => 'A newer answer from the active browser tab with more detail.',
            'version' => 1,
        ])->assertOk()->assertJsonPath('data.version', 2);
        $this->actingAs($user)->putJson("/api/v1/lessons/{$lesson->id}/draft", [
            'answer' => 'A stale answer that must not replace the new one.',
            'version' => 1,
        ])->assertConflict();
    }

    private function curriculum(): array
    {
        $track = Track::create(['slug' => 'answer-storage', 'legacy_key' => 'answer-storage', 'title' => 'Answer storage']);
        $first = Lesson::create([
            'track_id' => $track->id,
            'slug' => 'first-question',
            'legacy_key' => 'answer-storage-1',
            'title' => 'First question',
            'explanation' => 'Explanation',
            'interview_question' => 'What is the first answer?',
            'model_answer' => 'First model answer',
            'position' => 0,
        ]);
        $second = Lesson::create([
            'track_id' => $track->id,
            'slug' => 'second-question',
            'legacy_key' => 'answer-storage-2',
            'title' => 'Second question',
            'explanation' => 'Explanation',
            'interview_question' => 'What is the second answer?',
            'model_answer' => 'Second model answer',
            'position' => 1,
        ]);

        return [$track, $first, $second];
    }
}
