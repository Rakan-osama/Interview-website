<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\RubricCriterion;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AssessmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_submission_is_idempotent_and_result_is_pollable(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $track = Track::create(['slug' => 'safety', 'legacy_key' => 'test-track', 'title' => 'Safety']);
        $lesson = Lesson::create([
            'track_id' => $track->id, 'slug' => 'idempotency', 'legacy_key' => 'test-lesson', 'title' => 'Idempotency',
            'explanation' => 'Explain safe retries.', 'interview_question' => 'How do retries stay safe?',
            'model_answer' => 'Use an idempotency key.', 'position' => 0,
        ]);
        RubricCriterion::create(['lesson_id' => $lesson->id, 'label' => 'Key', 'terms' => ['idempotency'], 'weight' => 1, 'position' => 0]);
        $key = '98d436ad-14d6-45ca-b9d4-720751fde312';
        $first = $this->withHeader('Idempotency-Key', $key)->postJson("/api/v1/lessons/{$lesson->id}/attempts", ['answer' => 'Use an idempotency key for every retry.']);
        $second = $this->withHeader('Idempotency-Key', $key)->postJson("/api/v1/lessons/{$lesson->id}/attempts", ['answer' => 'Use an idempotency key for every retry.']);
        $first->assertAccepted()->assertJsonPath('data.status', 'pending');
        $second->assertAccepted()->assertJsonPath('data.id', $first->json('data.id'));
        $this->assertDatabaseCount('attempts', 1);
        $this->getJson('/api/v1/attempts/'.$first->json('data.id'))->assertOk()->assertJsonPath('data.status', 'completed')->assertJsonPath('data.overallScore', 100);
    }
}
