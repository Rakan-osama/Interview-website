<?php

namespace Tests\Feature;

use App\Application\Curriculum\LearningSourceRegistry;
use App\Application\Learning\ImportLegacyProgress;
use App\Infrastructure\AI\DeterministicRubricEvaluator;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\LegacyContentSeeder;
use Database\Seeders\SoftwareEngineeringCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ContentMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_legacy_content_record_is_imported_once(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $this->assertDatabaseCount('tracks', 54);
        $this->assertDatabaseCount('lessons', 350);
        $this->assertDatabaseCount('concepts', 102);
        $this->assertDatabaseCount('feature_guides', 16);
        $this->assertSame(350, DB::table('lessons')->distinct()->count('legacy_key'));
        $this->assertSame(0, DB::table('lessons')->whereNull('legacy_key')->count());
    }

    public function test_import_is_idempotent(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $ids = DB::table('lessons')->orderBy('legacy_key')->pluck('id')->all();
        $this->seed(LegacyContentSeeder::class);
        $this->assertSame($ids, DB::table('lessons')->orderBy('legacy_key')->pluck('id')->all());
        $this->assertDatabaseCount('lessons', 350);
    }

    public function test_software_engineering_expansion_is_complete_and_idempotent(): void
    {
        $this->seed();
        $this->assertDatabaseCount('tracks', 63);
        $this->assertDatabaseCount('lessons', 432);
        $this->assertDatabaseCount('concepts', 184);
        $this->assertDatabaseCount('feature_guides', 16);

        $this->assertSame(23, DB::table('lessons')->join('tracks', 'tracks.id', '=', 'lessons.track_id')
            ->where('tracks.legacy_key', 'like', 'se:patterns-%')->count());
        $this->assertSame(12, DB::table('lessons')->join('tracks', 'tracks.id', '=', 'lessons.track_id')
            ->where('tracks.legacy_key', 'se:application-security-2025')->count());

        $ids = DB::table('lessons')->where('legacy_key', 'like', 'se:%')->orderBy('legacy_key')->pluck('id')->all();
        $this->seed(SoftwareEngineeringCurriculumSeeder::class);
        $this->assertSame($ids, DB::table('lessons')->where('legacy_key', 'like', 'se:%')->orderBy('legacy_key')->pluck('id')->all());
        $this->assertDatabaseCount('lessons', 432);
    }

    public function test_new_identity_training_uses_authoritative_sources(): void
    {
        $this->seed();
        $lesson = Lesson::with('track')->where('legacy_key', 'se:identity-authentication:authorization-code-pkce')->firstOrFail();
        $sources = app(LearningSourceRegistry::class)->for($lesson);

        $this->assertGreaterThan(600, mb_strlen($lesson->explanation));
        $this->assertStringContainsString('RFC 9700', implode(' ', array_column($sources, 'title')));
        $this->assertCount(3, $lesson->criteria);
        $this->assertDatabaseHas('concept_lesson', ['lesson_id' => $lesson->id]);
    }

    public function test_track_and_project_endpoints_expose_ordered_training_content(): void
    {
        $this->seed();
        $user = User::factory()->create();
        $track = DB::table('tracks')->where('legacy_key', '0')->first();

        $this->getJson('/api/v1/tracks')->assertUnauthorized();
        $this->actingAs($user)->getJson('/api/v1/tracks/'.$track->slug)->assertOk()
            ->assertJsonCount(22, 'data.lessons')->assertJsonPath('data.lessons.0.legacyKey', '0-0');
        $this->actingAs($user)->getJson('/api/v1/projects')->assertOk()
            ->assertJsonPath('data.0.legacy_key', '0')->assertJsonCount(5, 'data.0.content.deliverables');
    }

    public function test_php_fundamentals_uses_distinct_lesson_owned_questions_without_fallback_concepts(): void
    {
        $this->seed();
        $user = User::factory()->create();
        $track = DB::table('tracks')->where('legacy_key', '0')->first();
        $lessons = DB::table('lessons')->where('track_id', $track->id)->orderBy('position')->get();

        $this->assertCount(22, $lessons);
        $this->assertSame(0, DB::table('concept_lesson')->whereIn('lesson_id', $lessons->pluck('id'))->count());
        $questions = [];
        foreach ($lessons as $lesson) {
            $content = json_decode($lesson->learning_content, true, flags: JSON_THROW_ON_ERROR);
            $this->assertContains($content['depth'], ['full', 'brief']);
            $this->assertNotEmpty($content['brief']);
            $this->assertNotEmpty($content['topicKeywords']);
            $this->assertNotEmpty($content['guidedQuestions']);
            $questions[] = mb_strtolower(trim($content['guidedQuestions'][0]['question']));
        }
        $this->assertCount(22, array_unique($questions));

        $first = $lessons->first();
        $last = $lessons->last();
        $firstPayload = $this->actingAs($user)->getJson("/api/v1/lessons/{$first->id}")->assertOk()->json('data');
        $lastPayload = $this->actingAs($user)->getJson("/api/v1/lessons/{$last->id}")->assertOk()->json('data');
        $this->assertNull($firstPayload['learningConcept']);
        $this->assertNull($lastPayload['learningConcept']);
        $this->assertNotSame($firstPayload['learningContent']['guidedQuestions'], $lastPayload['learningContent']['guidedQuestions']);
        $this->assertContains('https://www.php.net/manual/en/language.types.declarations.php', array_column($firstPayload['sources'], 'url'));
        foreach ([3 => 'https://www.php.net/manual/en/language.types.array.php', 5 => 'https://www.php.net/manual/en/control-structures.foreach.php'] as $position => $url) {
            $payload = $this->actingAs($user)->getJson('/api/v1/lessons/'.$lessons[$position]->id)->assertOk()->json('data');
            $this->assertContains($url, array_column($payload['sources'], 'url'));
        }
    }

    public function test_retired_lessons_redirect_to_a_successor_and_preserve_progress(): void
    {
        $this->seed();
        $user = User::factory()->create();
        $track = DB::table('tracks')->where('legacy_key', '0')->first();
        $retired = Lesson::query()->where('track_id', $track->id)->orderBy('position')->firstOrFail();
        $successor = Lesson::query()->where('track_id', $track->id)->where('id', '!=', $retired->id)->orderBy('position')->firstOrFail();
        $retired->forceFill([
            'retired_at' => now(),
            'superseded_by_lesson_id' => $successor->id,
            'retirement_reason' => 'All distinct claims are covered by the named successor.',
        ])->save();
        DB::table('draft_answers')->insert([
            'id' => (string) str()->ulid(), 'user_id' => $user->id, 'lesson_id' => $retired->id,
            'answer' => str_repeat('A retained historical answer. ', 3), 'version' => 1,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $payload = $this->actingAs($user)->getJson("/api/v1/tracks/{$track->slug}/lessons/{$retired->slug}")
            ->assertOk()->assertJsonPath('data.id', $successor->id)
            ->assertJsonPath('data.retiredFrom.id', $retired->id)
            ->assertJsonPath('data.learnerState.completed', true)->json('data');
        $this->assertSame("/tracks/{$track->slug}/lessons/{$successor->slug}", $payload['canonicalPath']);
        $this->actingAs($user)->getJson("/api/v1/tracks/{$track->slug}")->assertOk()->assertJsonCount(21, 'data.lessons');
        $this->assertDatabaseHas('draft_answers', ['user_id' => $user->id, 'lesson_id' => $retired->id]);
    }

    public function test_every_concept_has_the_complete_learning_structure(): void
    {
        $this->seed();
        $required = ['summary', 'definition', 'guidedQuestions', 'mechanismSteps', 'whenToUse', 'whenNotToUse', 'productionScenarios', 'failureModes', 'codeExamples', 'verificationChecklist', 'reviewedAt'];

        foreach (DB::table('concepts')->get() as $concept) {
            $content = json_decode($concept->content, true, flags: JSON_THROW_ON_ERROR);
            foreach ($required as $field) {
                $this->assertArrayHasKey($field, $content, "{$concept->slug} is missing {$field}");
                if ($field !== 'codeExamples') {
                    $this->assertNotEmpty($content[$field], "{$concept->slug}.{$field} must not be empty");
                }
            }
            $this->assertSame(3, $content['schemaVersion']);
        }
    }

    public function test_concept_endpoint_exposes_learning_content_and_official_references(): void
    {
        $this->seed();
        $user = User::factory()->create();
        $concept = DB::table('concepts')->where('group_name', 'PHP')->first();

        $this->actingAs($user)->getJson('/api/v1/concepts/'.$concept->slug)->assertOk()
            ->assertJsonPath('data.group', 'PHP')
            ->assertJsonStructure(['data' => ['content' => ['summary', 'definition', 'guidedQuestions', 'mechanismSteps', 'whenToUse', 'whenNotToUse', 'productionScenarios', 'failureModes', 'codeExamples', 'verificationChecklist', 'reviewedAt'], 'references' => [['title', 'url', 'publisher', 'applicableVersion', 'sectionLocator', 'reviewedAt']]]]);
    }

    public function test_every_lesson_exposes_a_teaching_structure_and_learning_sources(): void
    {
        $this->seed();
        $user = User::factory()->create();
        $linkedLessonId = DB::table('concept_lesson')->value('lesson_id');
        $lesson = Lesson::with('track')->findOrFail($linkedLessonId);

        $this->assertSame(12, DB::table('lessons')->whereNotNull('plain_explanation')->count());
        $this->actingAs($user)->getJson('/api/v1/lessons/'.$lesson->id)->assertOk()
            ->assertJsonPath('data.id', $lesson->id)
            ->assertJsonStructure(['data' => [
                'explanation', 'plainExplanation', 'practicalExample', 'interviewQuestion', 'pitfall',
                'learningConcept' => ['slug', 'title', 'group', 'content'],
                'interview' => ['scenario', 'question', 'answerStructure', 'modelAnswer'],
                'questionBrief' => ['context', 'task', 'successDefinition', 'answerStructure', 'requirements' => [['id', 'title', 'explanation', 'evidenceGroups', 'claimIds', 'weight']]],
                'rubric' => [['id', 'label', 'description', 'claimIds', 'evidenceGroups', 'weight']],
                'concepts' => [['slug', 'title', 'group', 'intro', 'content']],
                'sources' => [['title', 'url', 'publisher', 'applicableVersion', 'sectionLocator', 'reviewedAt']],
                'codeExamples', 'visuals',
            ]]);

        foreach (Lesson::with('track')->get() as $candidate) {
            $this->assertGreaterThanOrEqual(2, count(app(LearningSourceRegistry::class)->for($candidate)));
        }

        $comparison = DB::table('lessons')->where('title', 'Comparison pitfalls')->first();
        $this->assertGreaterThan(600, mb_strlen($comparison->explanation));
        $this->assertStringContainsString('array_key_exists', $comparison->explanation);
    }

    public function test_every_question_is_specific_and_its_model_answer_earns_full_score(): void
    {
        $this->seed();
        $evaluator = app(DeterministicRubricEvaluator::class);

        foreach (Lesson::with('criteria')->get() as $lesson) {
            $this->assertGreaterThan(40, mb_strlen($lesson->interview_question), "{$lesson->legacy_key} has no explicit task");
            $this->assertNotEmpty($lesson->criteria, "{$lesson->legacy_key} has no rubric criteria");
            $this->assertGreaterThan(250, mb_strlen($lesson->model_answer), "{$lesson->legacy_key} model answer is too short");
            $this->assertSame(100, $evaluator->evaluate($lesson, $lesson->model_answer)->overallScore, "{$lesson->legacy_key} model answer must score 100");
        }
    }

    public function test_legacy_progress_import_is_previewable_and_idempotent(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $user = User::factory()->create();
        $progress = [
            'attempts' => ['0-0' => ['answer' => 'A sufficiently detailed migrated answer.', 'date' => now()->toISOString(), 'hits' => [true, false, true, false], 'flags' => []]],
            'drafts' => ['0-1' => 'A saved draft'], 'bookmarks' => ['0-2'], 'last' => '0-2',
        ];
        $action = app(ImportLegacyProgress::class);
        $this->assertSame(3, $action->preview($progress)['mapped_lessons']);
        $this->assertFalse($action->apply($user, $progress, 'test')['already_imported']);
        $this->assertTrue($action->apply($user, $progress, 'test')['already_imported']);
        $this->assertDatabaseCount('attempts', 1);
        $this->assertDatabaseCount('draft_answers', 1);
        $this->assertDatabaseCount('bookmarks', 1);
    }
}
